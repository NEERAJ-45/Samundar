import { normalizeEntries, type SubtaskEntry, type Task } from './task-tree';

export type ImportFormat = 'text' | 'csv' | 'json';

let importerCounter = 0;

function makeImporter() {
    const now = Date.now().toString(36);
    return (prefix: string) => `${prefix}-${now}-${importerCounter++}`;
}

function parseEntry(entry: unknown, id: ReturnType<typeof makeImporter>): SubtaskEntry {
    if (entry && typeof entry === 'object' && 'entries' in entry) {
        const typedEntry = entry as { title?: string; checked?: boolean; entries?: unknown[] };
        return {
            id: id('se'),
            title: typedEntry.title || '',
            checked: !!typedEntry.checked,
            entries: normalizeEntries((typedEntry.entries || []).map((child) => parseEntry(child, id))),
        };
    }

    if (typeof entry === 'string') {
        return { id: id('se'), title: entry, checked: false, entries: [] };
    }

    const typedEntry = entry as { text?: string; title?: string; checked?: boolean } | null;
    return {
        id: id('se'),
        title: typedEntry?.text || typedEntry?.title || '',
        checked: !!typedEntry?.checked,
        entries: [],
    };
}

function parseImportText(text: string): Task[] {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    const tasks: Task[] = [];
    let task: Task | null = null;
    let group: SubtaskEntry | null = null;
    const id = makeImporter();

    for (const line of lines) {
        if (line.startsWith('☐') || line.startsWith('□')) {
            const title = line.replace(/^[☐□]\s*/, '').trim();
            if (title && group) {
                group.entries.push({ id: id('se'), title, checked: false, entries: [] });
            }
            continue;
        }

        if (/^\d+\.\d+\s/.test(line) || /^Chapter\s+\d+/i.test(line) || (!task && line)) {
            task = {
                id: id('task'),
                title: line,
                description: '',
                priority: 'medium',
                status: 'todo',
                category: 'General',
                createdAt: new Date().toISOString().slice(0, 10),
                dueDate: '',
                entries: [],
            };
            group = null;
            tasks.push(task);
            continue;
        }

        group = { id: id('se'), title: line, checked: false, entries: [] };
        if (task) {
            task.entries.push(group);
        }
    }

    return tasks.map((taskItem) => ({ ...taskItem, entries: normalizeEntries(taskItem.entries) }));
}

function parseCSVLine(line: string): string[] {
    const cols: string[] = [];
    let current = '';
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
        if (quoted) {
            if (line[i] === '"') {
                quoted = false;
            } else {
                current += line[i];
            }
            continue;
        }

        if (line[i] === '"') {
            quoted = true;
        } else if (line[i] === ',') {
            cols.push(current.trim());
            current = '';
        } else {
            current += line[i];
        }
    }

    cols.push(current.trim());
    return cols;
}

function parseImportCSV(text: string): Task[] {
    const id = makeImporter();
    const rows = text.split('\n').map((line) => line.trim()).filter(Boolean);

    if (rows.length < 2) {
        return [];
    }

    const headers = parseCSVLine(rows[0]).map((header) => header.toLowerCase());
    const findIdx = (names: string[]) => headers.findIndex((header) => names.includes(header));

    const titleIdx = findIdx(['title', 'task', 'name']);
    const groupIdx = findIdx(['group', 'category']);
    const itemIdx = findIdx(['item', 'checkpoint', 'text', 'description', 'todo']);
    const chIdx = findIdx(['chapter', 'ch']);
    const chNameIdx = findIdx(['chapter name', 'chapter_name', 'chaptername']);
    const secIdx = findIdx(['section']);

    const taskMap = new Map<string, Task>();

    function getOrCreate(key: string, title: string): Task {
        if (!taskMap.has(key)) {
            taskMap.set(key, {
                id: id('task'),
                title,
                description: '',
                priority: 'medium',
                status: 'todo',
                category: 'General',
                createdAt: new Date().toISOString().slice(0, 10),
                dueDate: '',
                entries: [],
            });
        }

        return taskMap.get(key)!;
    }

    for (let row = 1; row < rows.length; row++) {
        const cols = parseCSVLine(rows[row]);

        let taskKey: string;
        let taskTitle: string;

        if (titleIdx >= 0) {
            taskKey = taskTitle = cols[titleIdx] || '';
        } else if (chIdx >= 0 && chNameIdx >= 0 && secIdx >= 0) {
            const chapter = cols[chIdx] || '';
            const chapterName = cols[chNameIdx] || '';
            const section = cols[secIdx] || '';
            taskKey = `${chapter}|${chapterName}`;
            taskTitle = `Chapter ${chapter} — ${chapterName}`;
            const task = getOrCreate(taskKey, taskTitle);
            let levelOne = task.entries.find((entry) => entry.title === section);
            if (!levelOne) {
                levelOne = { id: id('se'), title: section, checked: false, entries: [] };
                task.entries.push(levelOne);
            }

            const category = groupIdx >= 0 ? (cols[groupIdx] || 'General') : 'General';
            let levelTwo = levelOne.entries.find((entry) => entry.title === category);
            if (!levelTwo) {
                levelTwo = { id: id('se'), title: category, checked: false, entries: [] };
                levelOne.entries.push(levelTwo);
            }

            const checkpoint = itemIdx >= 0 ? (cols[itemIdx] || '') : '';
            if (checkpoint) {
                levelTwo.entries.push({ id: id('se'), title: checkpoint, checked: false, entries: [] });
            }
            continue;
        } else if (chIdx >= 0 && chNameIdx >= 0) {
            const chapter = cols[chIdx] || '';
            const chapterName = cols[chNameIdx] || '';
            taskKey = `${chapter}|${chapterName}`;
            taskTitle = `Chapter ${chapter} — ${chapterName}`;
        } else if (chNameIdx >= 0 && secIdx >= 0) {
            const chapterName = cols[chNameIdx] || '';
            const section = cols[secIdx] || '';
            taskKey = `${chapterName}|${section}`;
            taskTitle = `${chapterName} — ${section}`;
        } else {
            taskKey = taskTitle = `Row ${row}`;
        }

        if (!taskKey) {
            continue;
        }

        const task = getOrCreate(taskKey, taskTitle);
        const groupName = groupIdx >= 0 ? (cols[groupIdx] || 'General') : 'General';
        const itemText = itemIdx >= 0 ? (cols[itemIdx] || '') : '';

        if (!itemText) {
            continue;
        }

        let group = task.entries.find((entry) => entry.title === groupName);
        if (!group) {
            group = { id: id('se'), title: groupName, checked: false, entries: [] };
            task.entries.push(group);
        }

        group.entries.push({ id: id('se'), title: itemText, checked: false, entries: [] });
    }

    return [...taskMap.values()].map((task) => ({ ...task, entries: normalizeEntries(task.entries) }));
}

function parseImportJSON(text: string): Task[] {
    const id = makeImporter();

    try {
        const raw = JSON.parse(text);
        if (!Array.isArray(raw)) {
            return [];
        }

        return raw.map((item: any) => {
            const task: Task = {
                id: id('task'),
                title: item.title || 'Untitled',
                description: '',
                priority: 'medium',
                status: 'todo',
                category: 'General',
                createdAt: new Date().toISOString().slice(0, 10),
                dueDate: '',
                entries: [],
            };

            if (item.entries) {
                task.entries = normalizeEntries(item.entries.map((entry: any) => parseEntry(entry, id)));
            } else if (item.groups) {
                task.entries = normalizeEntries(
                    item.groups.map((group: any) => ({
                        id: id('se'),
                        title: group.title || '',
                        checked: false,
                        entries: normalizeEntries((group.items || []).map((child: any) => parseEntry(child, id))),
                    }))
                );
            }

            return task;
        });
    } catch {
        return [];
    }
}

function parseIndentedHierarchy(text: string): SubtaskEntry[] {
    const id = makeImporter();
    const lines = text.split('\n');
    const stack: { indent: number; entry: SubtaskEntry }[] = [];
    const roots: SubtaskEntry[] = [];

    for (const raw of lines) {
        const indent = raw.search(/\S/);
        const trimmed = raw.trim();
        if (!trimmed) {
            continue;
        }

        const checked = /^[☐□✓✗]\s*/.test(trimmed);
        const title = trimmed.replace(/^[☐□✓✗\-*]\s*/, '').trim();
        if (!title) {
            continue;
        }

        const entry: SubtaskEntry = { id: id('se'), title, checked, entries: [] };

        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        if (stack.length === 0) {
            roots.push(entry);
        } else {
            stack[stack.length - 1].entry.entries.push(entry);
        }

        stack.push({ indent, entry });
    }

    return roots;
}

function parseFileAsTask(fileName: string, content: string, format: ImportFormat): Task[] {
    const id = makeImporter();
    const title = fileName.replace(/\.[^.]+$/, '');

    if (format === 'csv') {
        const csvTasks = parseImportCSV(content);
        if (csvTasks.length > 0) {
            const task: Task = {
                id: id('task'),
                title,
                description: '',
                priority: 'medium',
                status: 'todo',
                category: 'General',
                createdAt: new Date().toISOString().slice(0, 10),
                dueDate: '',
                entries: [],
            };

            for (const childTask of csvTasks) {
                const section: SubtaskEntry = { id: id('se'), title: childTask.title, checked: false, entries: childTask.entries };
                task.entries.push(section);
            }

            return [task];
        }

        return [];
    }

    if (format === 'json') {
        try {
            const raw = JSON.parse(content);
            const entries = Array.isArray(raw) ? raw.map((entry: any) => parseEntry(entry, id)) : [parseEntry(raw, id)];
            return [
                {
                    id: id('task'),
                    title,
                    description: '',
                    priority: 'medium',
                    status: 'todo',
                    category: 'General',
                    createdAt: new Date().toISOString().slice(0, 10),
                    dueDate: '',
                    entries: normalizeEntries(entries),
                },
            ];
        } catch {
            return [];
        }
    }

    const entries = parseIndentedHierarchy(content);
    if (entries.length === 0) {
        return [];
    }

    return [
        {
            id: id('task'),
            title,
            description: '',
            priority: 'medium',
            status: 'todo',
            category: 'General',
            createdAt: new Date().toISOString().slice(0, 10),
            dueDate: '',
            entries: normalizeEntries(entries),
        },
    ];
}

export function parseImport(text: string, format: ImportFormat): Task[] {
    if (format === 'csv') {
        return parseImportCSV(text);
    }

    if (format === 'json') {
        return parseImportJSON(text);
    }

    return parseImportText(text);
}

export { parseFileAsTask };