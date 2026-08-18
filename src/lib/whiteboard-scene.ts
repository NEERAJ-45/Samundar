import { restore, serializeAsJSON } from '@excalidraw/excalidraw';
import type { ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';

export const DARK_BG = '#1e1e1e';

// serializeAsJSON is Excalidraw's official serializer: it strips ephemeral appState
// fields (e.g. collaborators: Map) that break on a JSON round-trip.
export function serializeScene(
  elements: Parameters<typeof serializeAsJSON>[0],
  appState: Parameters<typeof serializeAsJSON>[1],
  files: Parameters<typeof serializeAsJSON>[2],
): string {
  return serializeAsJSON(elements, appState, files, 'database');
}

// restore sanitizes a parsed scene back into a valid Excalidraw state.
export function parseScene(scene: string | undefined): ExcalidrawInitialDataState {
  const fallback: ExcalidrawInitialDataState = {
    elements: [],
    appState: { viewBackgroundColor: DARK_BG },
    files: {},
  };
  if (!scene) return fallback;
  try {
    const parsed = JSON.parse(scene);
    const parsedAppState = { ...(parsed.appState ?? {}) };
    // Legacy scenes saved the raw appState, whose Map/Set fields (collaborators, pointers,
    // followedBy, imageCache) JSON-stringify to plain objects and crash Excalidraw's
    // internal iterators. They are ephemeral live state — safe to drop.
    for (const ephemeral of ['collaborators', 'pointers', 'followedBy', 'imageCache']) {
      delete parsedAppState[ephemeral];
    }
    const { elements, appState, files } = restore(
      { elements: parsed.elements, appState: parsedAppState, files: parsed.files ?? {} },
      null,
      null,
    );
    return {
      elements,
      appState,
      files: files ?? {},
    };
  } catch {
    return fallback;
  }
}