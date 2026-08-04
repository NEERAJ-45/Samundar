import { useState, useEffect, useCallback, useRef } from 'react';
import { useToggleCompletion } from '@/hooks/use-completions';
import { useSaveNote } from '@/hooks/use-notes';
import { useAddCustomTopic, useDeleteCustomTopic } from '@/hooks/use-custom-topics';
import { useProfile } from '@/components/providers/ProfileProvider';

export type CompletedMap = Record<string, string>;
export type NotesMap = Record<string, string>;
export type BookmarkMap = Record<string, boolean>;

export interface ItemWithId {
  id: number;
  title: string;
  difficulty?: string;
  link?: string;
}

export function loadLocalData<T>(storageKey: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLocalData<T>(storageKey: string, data: T) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export interface UseTableSyncOptions {
  storagePrefix: string;
  completedStorageKey?: string;
  notesStorageKey?: string;
  customStorageKey?: string;
  bookmarkStorageKey?: string;
  defaultCompletedIds?: number[];
  allItems?: ItemWithId[];
}

export function useTableSync({
  storagePrefix,
  completedStorageKey: customCompletedKey,
  notesStorageKey: customNotesKey,
  customStorageKey: customCustomKey,
  bookmarkStorageKey: customBookmarkKey,
  defaultCompletedIds = [],
  allItems = [],
}: UseTableSyncOptions) {
  const { userEmail, customDbUrl } = useProfile();
  const toggleCompletion = useToggleCompletion();
  const saveNote = useSaveNote();
  const addCustomTopic = useAddCustomTopic();
  const deleteCustomTopic = useDeleteCustomTopic();

  const compKey = customCompletedKey ?? `${storagePrefix}-completed`;
  const noteKey = customNotesKey ?? `${storagePrefix}-notes`;
  const custKey = customCustomKey ?? `${storagePrefix}-custom-questions`;
  const bookmarkKey = customBookmarkKey ?? `${storagePrefix}-bookmarks`;

  const [completedMap, setCompletedMap] = useState<CompletedMap>({});
  const [notesMap, setNotesMap] = useState<NotesMap>({});
  const [customItems, setCustomItems] = useState<ItemWithId[]>([]);
  const [bookmarkMap, setBookmarkMap] = useState<BookmarkMap>({});
  const [dbConnected, setDbConnected] = useState(false);
  const synced = useRef(false);

  const getRequestHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    };
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
    return headers;
  }, [userEmail, customDbUrl]);

  const broadcastProgress = useCallback(() => {
    try {
      const bc = new BroadcastChannel('roadmap-progress');
      bc.postMessage({ storagePrefix, key: 'completed' });
      bc.close();
    } catch {}
  }, [storagePrefix]);

  const persistCompleted = useCallback((map: CompletedMap) => {
    saveLocalData(compKey, map);
    broadcastProgress();
  }, [compKey, broadcastProgress]);

  const persistNotes = useCallback((map: NotesMap) => {
    saveLocalData(noteKey, map);
  }, [noteKey]);

  const persistCustom = useCallback((items: ItemWithId[]) => {
    saveLocalData(custKey, items);
  }, [custKey]);

  const persistBookmarks = useCallback((map: BookmarkMap) => {
    saveLocalData(bookmarkKey, map);
  }, [bookmarkKey]);

  useEffect(() => {
    if (synced.current) return;
    const initialCompleted = loadLocalData<CompletedMap>(compKey, {});
    const initialNotes = loadLocalData<NotesMap>(noteKey, {});
    const initialBookmarks = loadLocalData<BookmarkMap>(bookmarkKey, {});
    let initialCustom: ItemWithId[] = [];
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(custKey);
      if (raw) {
        try { initialCustom = JSON.parse(raw); } catch {}
      }
    }

    if (defaultCompletedIds.length > 0 && Object.keys(initialCompleted).length === 0) {
      const timestamp = new Date().toISOString();
      defaultCompletedIds.forEach((id) => {
        initialCompleted[String(id)] = timestamp;
      });
      persistCompleted(initialCompleted);
    }

    setCompletedMap(initialCompleted);
    setNotesMap(initialNotes);
    setCustomItems(initialCustom);
    setBookmarkMap(initialBookmarks);

    async function syncWithDB() {
      try {
        const headers = getRequestHeaders();

        const compRes = await fetch(`/api/db/completions?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const compData = await compRes.json();
        if (compData.dbConnected) {
          setDbConnected(true);
          const dbComps = compData.data.filter((x: { storagePrefix: string }) => x.storagePrefix === compKey);
          const dbCompMap: CompletedMap = {};
          dbComps.forEach((x: { storagePrefix: string; itemId: string; completedAt?: string }) => {
            dbCompMap[x.itemId] = x.completedAt || '';
          });
          const mergedComps = { ...initialCompleted, ...dbCompMap };
          setCompletedMap(mergedComps);
          persistCompleted(mergedComps);

          for (const [id, dateStr] of Object.entries(initialCompleted)) {
            if (!dbCompMap[id]) {
              fetch('/api/db/completions', {
                method: 'POST',
                headers,
                body: JSON.stringify({ storagePrefix: compKey, itemId: id, completedAt: dateStr, userEmail }),
              }).catch(() => {});
            }
          }
        }

        const noteRes = await fetch(`/api/db/notes?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const noteData = await noteRes.json();
        if (noteData.dbConnected) {
          const dbNotes = noteData.data.filter((x: { storagePrefix: string }) => x.storagePrefix === noteKey);
          const dbNoteMap: NotesMap = {};
          dbNotes.forEach((x: { storagePrefix: string; itemId: string; note?: string }) => {
            dbNoteMap[x.itemId] = x.note || '';
          });
          const mergedNotes = { ...initialNotes, ...dbNoteMap };
          setNotesMap(mergedNotes);
          persistNotes(mergedNotes);

          for (const [id, noteText] of Object.entries(initialNotes)) {
            if (!dbNoteMap[id]) {
              const syncedItem = [...allItems, ...initialCustom].find(q => q.id === Number(id));
              fetch('/api/db/notes', {
                method: 'POST',
                headers,
                body: JSON.stringify({ storagePrefix: noteKey, itemId: id, note: noteText, userEmail, itemTitle: syncedItem?.title }),
              }).catch(() => {});
            }
          }
        }

        const customRes = await fetch(`/api/db/custom-topics?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const customData = await customRes.json();
        if (customData.dbConnected) {
          const dbCustoms = customData.data.filter((x: { storagePrefix: string }) => x.storagePrefix === custKey);
          const mergedCustoms = [...initialCustom];
          dbCustoms.forEach((dbItem: { storagePrefix: string; id: number; title: string; difficulty: string; link?: string }) => {
            if (!mergedCustoms.some((x) => x.id === dbItem.id)) {
              mergedCustoms.push({ id: dbItem.id, title: dbItem.title, difficulty: dbItem.difficulty || 'MEDIUM', link: dbItem.link || '' });
            }
          });
          setCustomItems(mergedCustoms);
          persistCustom(mergedCustoms);

          for (const item of initialCustom) {
            if (!dbCustoms.some((x: { storagePrefix: string; id: number }) => x.id === item.id)) {
              fetch('/api/db/custom-topics', {
                method: 'POST', headers,
                body: JSON.stringify({ storagePrefix: custKey, id: item.id, title: item.title, difficulty: item.difficulty || 'MEDIUM', link: item.link || '', userEmail }),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync with MongoDB:', err);
      }
    }

    syncWithDB();
    synced.current = true;
  }, [compKey, noteKey, custKey, userEmail, getRequestHeaders, defaultCompletedIds, persistCompleted, persistNotes, persistCustom, allItems, bookmarkKey, persistBookmarks]);

  const toggleCompleted = useCallback((id: number, extraTitle?: string) => {
    const key = String(id);
    const wasCompleted = !!completedMap[key];
    const nowCompleted = !wasCompleted;
    const compAtStr = nowCompleted ? new Date().toISOString() : '';

    setCompletedMap((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = compAtStr;
      persistCompleted(next);
      return next;
    });

    toggleCompletion.mutate({
      storagePrefix: compKey,
      itemId: String(id),
      completedAt: nowCompleted ? compAtStr : undefined,
      title: extraTitle,
    });
  }, [completedMap, persistCompleted, compKey, toggleCompletion]);

  const updateNote = useCallback((id: number, value: string) => {
    setNotesMap((prev) => {
      const key = String(id);
      const next = { ...prev, [key]: value };
      if (!value) delete next[key];
      persistNotes(next);
      return next;
    });

    const item = allItems.find(q => q.id === id);
    saveNote.mutate({ storagePrefix: noteKey, itemId: String(id), note: value || undefined, itemTitle: item?.title });
  }, [allItems, persistNotes, noteKey, saveNote]);

  const handleAddItem = useCallback((title: string, difficulty: string, link: string) => {
    const newId = Date.now();
    const newItem: ItemWithId = { id: newId, title, difficulty, link };
    const nextList = [...customItems, newItem];
    setCustomItems(nextList);
    persistCustom(nextList);
    addCustomTopic.mutate({ storagePrefix: custKey, id: newId, title, difficulty, link });
  }, [customItems, persistCustom, custKey, addCustomTopic]);

  const handleDeleteItem = useCallback((id: number) => {
    const nextList = customItems.filter((q) => q.id !== id);
    setCustomItems(nextList);
    persistCustom(nextList);

    setCompletedMap((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      persistCompleted(next);
      return next;
    });
    setNotesMap((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      persistNotes(next);
      return next;
    });
    setBookmarkMap((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      persistBookmarks(next);
      return next;
    });

    const deletedItem = customItems.find(q => q.id === id);
    deleteCustomTopic.mutate({ storagePrefix: custKey, id });
    toggleCompletion.mutate({ storagePrefix: compKey, itemId: String(id) });
    saveNote.mutate({ storagePrefix: noteKey, itemId: String(id), itemTitle: deletedItem?.title });
  }, [customItems, persistCustom, persistCompleted, persistNotes, custKey, compKey, noteKey, deleteCustomTopic, toggleCompletion, saveNote]);

  const resetAll = useCallback(() => {
    localStorage.removeItem(compKey);
    localStorage.removeItem(noteKey);
    localStorage.removeItem(custKey);
    localStorage.removeItem(bookmarkKey);
    setCompletedMap({});
    setNotesMap({});
    setCustomItems([]);
    setBookmarkMap({});
    broadcastProgress();
    synced.current = false;
  }, [compKey, noteKey, custKey, bookmarkKey, broadcastProgress]);

  const updateCompletionDate = useCallback((id: number, dateStr: string | null) => {
    setCompletedMap((prev) => {
      const next = { ...prev };
      if (dateStr) next[String(id)] = dateStr;
      else delete next[String(id)];
      persistCompleted(next);
      return next;
    });
  }, [persistCompleted]);

  const toggleBookmark = useCallback((id: number) => {
    setBookmarkMap((prev) => {
      const key = String(id);
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      persistBookmarks(next);
      return next;
    });
  }, [persistBookmarks]);

  const solvedCount = Object.keys(completedMap).length;

  return {
    completedMap,
    notesMap,
    customItems,
    bookmarkMap,
    dbConnected,
    solvedCount,
    setCompletedMap,
    setNotesMap,
    toggleCompleted,
    updateNote,
    handleAddItem,
    handleDeleteItem,
    resetAll,
    updateCompletionDate,
    toggleBookmark,
  };
}
