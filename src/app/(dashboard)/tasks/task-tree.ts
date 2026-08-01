export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in-progress' | 'done';

export interface SubtaskEntry {
    id: string;
    title: string;
    checked: boolean;
    entries: SubtaskEntry[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    category: string;
    createdAt: string;
    dueDate: string;
    entries: SubtaskEntry[];
}

export function normalizeEntries(entries: SubtaskEntry[]): SubtaskEntry[] {
    return entries.map((entry) => normalizeEntry(entry));
}

function normalizeEntry(entry: SubtaskEntry): SubtaskEntry {
    const entries = normalizeEntries(entry.entries ?? []);
    const checked = entries.length === 0 ? !!entry.checked : entries.every((child) => child.checked);
    return { ...entry, checked, entries };
}

export function normalizeTask(task: Task): Task {
    return { ...task, entries: normalizeEntries(task.entries ?? []) };
}

export function countEntries(entries: SubtaskEntry[]): { done: number; total: number } {
    let done = 0;
    let total = 0;

    for (const entry of entries) {
        total++;
        if (entry.checked) done++;

        const sub = countEntries(entry.entries);
        done += sub.done;
        total += sub.total;
    }

    return { done, total };
}

export function updateEntry(entries: SubtaskEntry[], id: string, fn: (entry: SubtaskEntry) => SubtaskEntry): SubtaskEntry[] {
    let changed = false;

    const nextEntries = entries.map((entry) => {
        if (entry.id === id) {
            changed = true;
            return fn(entry);
        }

        if (entry.entries.length === 0) {
            return entry;
        }

        const childEntries = updateEntry(entry.entries, id, fn);
        if (childEntries === entry.entries) {
            return entry;
        }

        changed = true;
        return {
            ...entry,
            entries: childEntries,
            checked: childEntries.length > 0 ? childEntries.every((child) => child.checked) : entry.checked,
        };
    });

    return changed ? nextEntries : entries;
}

function setAllChecked(entries: SubtaskEntry[], checked: boolean): SubtaskEntry[] {
    return entries.map((entry) => ({
        ...entry,
        checked,
        entries: setAllChecked(entry.entries, checked),
    }));
}

export function addEntry(entries: SubtaskEntry[], parentId: string | null, title: string): SubtaskEntry[] {
    const entry: SubtaskEntry = {
        id: `se-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        checked: false,
        entries: [],
    };

    if (!parentId) {
        return [...entries, entry];
    }

    return updateEntry(entries, parentId, (current) => ({
        ...current,
        entries: [...current.entries, entry],
        checked: false,
    }));
}

export function deleteEntry(entries: SubtaskEntry[], id: string): SubtaskEntry[] {
    return entries.reduce<SubtaskEntry[]>((acc, entry) => {
        if (entry.id === id) {
            return acc;
        }

        if (entry.entries.length > 0) {
            const childEntries = deleteEntry(entry.entries, id);
            acc.push({
                ...entry,
                entries: childEntries,
                checked: childEntries.length > 0 ? childEntries.every((child) => child.checked) : entry.checked,
            });
            return acc;
        }

        acc.push(entry);
        return acc;
    }, []);
}

export function renameEntry(entries: SubtaskEntry[], id: string, title: string): SubtaskEntry[] {
    return updateEntry(entries, id, (entry) => ({ ...entry, title }));
}

export function toggleEntryChecked(entries: SubtaskEntry[], id: string): SubtaskEntry[] {
    const target = findEntry(entries, id);
    const nextChecked = target ? !target.checked : true;
    return setEntryChecked(entries, id, nextChecked);
}

function setEntryChecked(entries: SubtaskEntry[], id: string, checked: boolean): SubtaskEntry[] {
    let changed = false;

    const nextEntries = entries.map((entry) => {
        if (entry.id === id) {
            changed = true;
            return {
                ...entry,
                checked,
                entries: setAllChecked(entry.entries, checked),
            };
        }

        if (entry.entries.length === 0) {
            return entry;
        }

        const childEntries = setEntryChecked(entry.entries, id, checked);
        if (childEntries === entry.entries) {
            return entry;
        }

        changed = true;
        return {
            ...entry,
            entries: childEntries,
            checked: childEntries.length > 0 ? childEntries.every((child) => child.checked) : entry.checked,
        };
    });

    return changed ? nextEntries : entries;
}

function findEntry(entries: SubtaskEntry[], id: string): SubtaskEntry | null {
    for (const entry of entries) {
        if (entry.id === id) {
            return entry;
        }

        const match = findEntry(entry.entries, id);
        if (match) {
            return match;
        }
    }

    return null;
}