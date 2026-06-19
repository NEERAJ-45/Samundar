import { create } from 'zustand';
import type { KnowledgeNode, MasteryRecord, MasteryLevel } from '@/lib/types/knowledge';

interface KnowledgeState {
  nodes: KnowledgeNode[];
  masteryRecords: Map<string, MasteryRecord>;
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  searchQuery: string;

  setNodes: (nodes: KnowledgeNode[]) => void;
  setMasteryRecords: (records: MasteryRecord[]) => void;
  toggleNode: (id: string) => void;
  expandToNode: (id: string) => void;
  collapseAll: () => void;
  selectNode: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredNodes: () => KnowledgeNode[];
  getNodeMastery: (nodeId: string) => MasteryLevel;
  getChildren: (parentId: string) => KnowledgeNode[];
  getAncestors: (nodeId: string) => KnowledgeNode[];
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  nodes: [],
  masteryRecords: new Map(),
  expandedNodes: new Set(),
  selectedNodeId: null,
  searchQuery: '',

  setNodes: (nodes) => set({ nodes }),

  setMasteryRecords: (records) => {
    const map = new Map<string, MasteryRecord>();
    for (const record of records) {
      map.set(record.knowledgeNodeId, record);
    }
    set({ masteryRecords: map });
  },

  toggleNode: (id) =>
    set((state) => {
      const next = new Set(state.expandedNodes);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedNodes: next };
    }),

  expandToNode: (id) =>
    set((state) => {
      const next = new Set(state.expandedNodes);
      const ancestors = state.getAncestors(id);
      for (const node of ancestors) {
        next.add(node.id);
      }
      next.add(id);
      return { expandedNodes: next };
    }),

  collapseAll: () => set({ expandedNodes: new Set() }),

  selectNode: (id) => set({ selectedNodeId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredNodes: () => {
    const state = get();
    if (!state.searchQuery) {
      return state.nodes;
    }
    const lower = state.searchQuery.toLowerCase();
    return state.nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(lower) ||
        (n.description && n.description.toLowerCase().includes(lower))
    );
  },

  getNodeMastery: (nodeId) => {
    const record = get().masteryRecords.get(nodeId);
    return record?.level ?? 0;
  },

  getChildren: (parentId) => {
    return get().nodes.filter((n) => n.parentId === parentId);
  },

  getAncestors: (nodeId) => {
    const { nodes } = get();
    const ancestors: KnowledgeNode[] = [];
    let current = nodes.find((n) => n.id === nodeId);
    while (current?.parentId) {
      const parent = nodes.find((n) => n.id === current!.parentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return ancestors;
  },
}));
