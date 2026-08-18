/**
 * lib/services/whiteboard.ts
 *
 * Typed fetch wrappers for /api/db/whiteboard.
 */

export interface WhiteboardRecord {
  boardId: string;
  name: string;
  scene: string;
  updatedAt?: string;
}

export interface FetchWhiteboardsResponse {
  dbConnected: boolean;
  data: WhiteboardRecord[];
  error?: string;
}

export interface SaveWhiteboardRequest {
  boardId: string;
  userEmail: string;
  /** Rename / create board. Omit when only saving the scene. */
  name?: string;
  /** Serialized Excalidraw scene JSON. Omit when only renaming. */
  scene?: string;
}

export interface SaveWhiteboardResponse {
  success: boolean;
  data?: WhiteboardRecord;
  deleted?: boolean;
  error?: string;
}

export interface DeleteWhiteboardRequest {
  boardId: string;
  userEmail: string;
}

export async function fetchWhiteboards(
  userEmail: string,
  headers: Record<string, string>,
): Promise<FetchWhiteboardsResponse> {
  const res = await fetch(`/api/db/whiteboard?userEmail=${encodeURIComponent(userEmail)}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `fetchWhiteboards failed: ${res.status}`,
    );
  }
  return res.json() as Promise<FetchWhiteboardsResponse>;
}

export async function saveWhiteboard(
  payload: SaveWhiteboardRequest,
  headers: Record<string, string>,
): Promise<SaveWhiteboardResponse> {
  const res = await fetch('/api/db/whiteboard', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `saveWhiteboard failed: ${res.status}`,
    );
  }
  return res.json() as Promise<SaveWhiteboardResponse>;
}

export async function deleteWhiteboard(
  payload: DeleteWhiteboardRequest,
  headers: Record<string, string>,
): Promise<SaveWhiteboardResponse> {
  const res = await fetch('/api/db/whiteboard', {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, delete: true }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `deleteWhiteboard failed: ${res.status}`,
    );
  }
  return res.json() as Promise<SaveWhiteboardResponse>;
}