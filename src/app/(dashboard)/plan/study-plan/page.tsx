'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { Loader2, Maximize, Minimize, Plus, Trash2, CloudOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBoardsQuery, useSaveWhiteboard, useDeleteWhiteboard } from '@/hooks/use-whiteboard';
import { parseScene, serializeScene } from '@/lib/whiteboard-scene';
import type { WhiteboardRecord } from '@/lib/services/whiteboard';

import '@excalidraw/excalidraw/index.css';

const Excalidraw = dynamic(async () => (await import('@excalidraw/excalidraw')).Excalidraw, {
  ssr: false,
}) as unknown as React.ComponentType<ExcalidrawProps>;

const ACTIVE_KEY = 'samundar-wb-active';
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type SceneChange = NonNullable<ExcalidrawProps['onChange']>;

interface SceneProps {
  board: WhiteboardRecord;
  onChange: SceneChange;
}

function Scene({ board, onChange }: SceneProps) {
  // initialData is only read on mount; remount per board via key. Scene changes after
  // autosave must not re-render the canvas, so the dep is intentionally boardId only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialData = React.useMemo(() => parseScene(board.scene), [board.boardId]);

  return (
    <Excalidraw
      initialData={initialData}
      onChange={onChange}
      theme="dark"
      UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false } }}
    />
  );
}

export default function WhiteboardPage() {
  const { data, isLoading } = useBoardsQuery();
  const saveBoard = useSaveWhiteboard();
  const deleteBoard = useDeleteWhiteboard();
  const boards = data?.data ?? [];

  const [activeId, setActiveId] = React.useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACTIVE_KEY);
  });
  const [fullscreen, setFullscreen] = React.useState(false);
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved' | 'offline'>('idle');
  const [nameDialog, setNameDialog] = React.useState<
    { mode: 'create' } | { mode: 'rename'; board: WhiteboardRecord } | null
  >(null);
  const [nameValue, setNameValue] = React.useState('');

  const containerRef = React.useRef<HTMLDivElement>(null);
  const activeIdRef = React.useRef<string | null>(activeId);
  const pendingRef = React.useRef<{ boardId: string; scene: string } | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveBoardRef = React.useRef(saveBoard);
  React.useEffect(() => {
    saveBoardRef.current = saveBoard;
  });

  const activeBoard = boards.find((b) => b.boardId === activeId) ?? boards[0] ?? null;

  React.useEffect(() => {
    activeIdRef.current = activeBoard?.boardId ?? null;
    if (activeBoard) window.localStorage.setItem(ACTIVE_KEY, activeBoard.boardId);
  }, [activeBoard]);

  React.useEffect(() => {
    document.title = activeBoard ? `${activeBoard.name} — Whiteboard` : 'Whiteboard';
  }, [activeBoard]);

  const flush = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pendingRef.current) return;
    const { boardId, scene } = pendingRef.current;
    pendingRef.current = null;
    setSaveState('saving');
    saveBoardRef.current.mutate(
      { boardId, scene },
      {
        onSuccess: () => setSaveState('saved'),
        onError: () => setSaveState('offline'),
      },
    );
  }, []);

  const flushRef = React.useRef(flush);
  React.useEffect(() => {
    flushRef.current = flush;
  });

  React.useEffect(() => {
    const onUnload = () => flushRef.current();
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      flushRef.current();
    };
  }, []);

  const handleSceneChange = React.useCallback<SceneChange>((elements, appState, files) => {
    const boardId = activeIdRef.current;
    if (!boardId) return;
    pendingRef.current = { boardId, scene: serializeScene(elements, appState, files) };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushRef.current, 1000);
  }, []);

  const selectBoard = (boardId: string) => {
    flushRef.current();
    setActiveId(boardId);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  React.useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const openCreate = () => {
    setNameValue('');
    setNameDialog({ mode: 'create' });
  };

  const openRename = (board: WhiteboardRecord) => {
    setNameValue(board.name);
    setNameDialog({ mode: 'rename', board });
  };

  const submitName = () => {
    if (!nameDialog) return;
    const name = nameValue.trim();
    setNameDialog(null);
    if (!name) return;
    if (nameDialog.mode === 'create') {
      const boardId = uid();
      saveBoard.mutate({ boardId, name }, { onSuccess: () => setActiveId(boardId) });
    } else if (name !== nameDialog.board.name) {
      saveBoard.mutate({ boardId: nameDialog.board.boardId, name });
    }
  };

  const removeBoard = (board: WhiteboardRecord) => {
    if (!window.confirm(`Delete "${board.name}"?`)) return;
    flushRef.current();
    deleteBoard.mutate({ boardId: board.boardId });
    if (activeId === board.boardId) setActiveId(null);
  };

  const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-zinc-500';

  const saveBadge =
    saveState === 'saving' ? (
      <span className="flex items-center gap-1 text-[10px] text-zinc-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    ) : saveState === 'saved' ? (
      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
        <Check className="h-3 w-3" /> Saved
      </span>
    ) : saveState === 'offline' ? (
      <span className="flex items-center gap-1 text-[10px] text-red-400">
        <CloudOff className="h-3 w-3" /> Save failed
      </span>
    ) : null;

  return (
    <div
      ref={containerRef}
      className="flex h-[calc(100dvh-56px)] flex-col overflow-hidden bg-background"
    >
      <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-950/90 px-2 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {boards.map((board) => (
            <div key={board.boardId} className="group relative flex items-center">
              <button
                onDoubleClick={() => openRename(board)}
                onClick={() => selectBoard(board.boardId)}
                title={`${board.name} (double-click to rename)`}
                className={
                  'flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ' +
                  (board.boardId === activeBoard?.boardId
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200') +
                  ' ' +
                  focusRing
                }
              >
                <span className="max-w-[10rem] truncate">{board.name}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBoard(board);
                }}
                aria-label={`Delete ${board.name}`}
                className={
                  'ml-0.5 flex h-7 w-7 items-center justify-center rounded text-zinc-600 opacity-50 transition-all hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100 ' +
                  focusRing
                }
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={openCreate}
            className={
              'flex h-8 shrink-0 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200 ' +
              focusRing
            }
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-2">
          {saveBadge}
          <button
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className={
              'flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100 ' +
              focusRing
            }
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : boards.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600">
            <p className="text-sm font-medium text-zinc-500">No whiteboards yet.</p>
            <button
              onClick={openCreate}
              className={
                'flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 ' +
                focusRing
              }
            >
              <Plus className="h-3.5 w-3.5" /> New board
            </button>
          </div>
        ) : activeBoard ? (
          <Scene board={activeBoard} onChange={handleSceneChange} />
        ) : null}
      </div>

      <Dialog open={nameDialog !== null} onOpenChange={(open) => { if (!open) setNameDialog(null); }}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {nameDialog?.mode === 'rename' ? 'Rename board' : 'New board'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitName();
            }}
            className="space-y-4"
          >
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="Board name"
              autoFocus
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-zinc-600 placeholder:text-zinc-700"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setNameDialog(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!nameValue.trim()}>
                {nameDialog?.mode === 'rename' ? 'Rename' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}