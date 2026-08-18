import { describe, expect, it } from 'vitest';
import { parseScene, serializeScene } from '@/lib/whiteboard-scene';

function collaboratorsOf(scene: string): unknown {
  return (parseScene(scene).appState as Record<string, unknown>).collaborators;
}

const isIterableOrAbsent = (value: unknown) =>
  value === undefined || typeof (value as { forEach?: unknown }).forEach === 'function';

describe('whiteboard scene round-trip', () => {
  it('never yields a non-iterable collaborators after serialization', () => {
    const appState = { viewBackgroundColor: '#1e1e1e', collaborators: new Map() };
    const scene = serializeScene([], appState, {});

    expect(isIterableOrAbsent(collaboratorsOf(scene))).toBe(true);
  });

  it('sanitizes legacy scenes that stored a plain-object collaborators', () => {
    const legacy = JSON.stringify({
      elements: [],
      appState: { viewBackgroundColor: '#1e1e1e', collaborators: {} },
      files: {},
    });

    expect(isIterableOrAbsent(collaboratorsOf(legacy))).toBe(true);
  });

  it('preserves elements through a round-trip', () => {
    const elements = [{ id: 'x', type: 'rectangle' }] as unknown as Parameters<
      typeof serializeScene
    >[0];
    const scene = serializeScene(elements, { viewBackgroundColor: '#1e1e1e' }, {});

    expect(parseScene(scene).elements).toHaveLength(1);
  });
});