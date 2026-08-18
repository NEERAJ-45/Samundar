import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useProfile } from '@/components/providers/ProfileProvider';
import {
  fetchWhiteboards,
  saveWhiteboard,
  deleteWhiteboard,
  type FetchWhiteboardsResponse,
  type SaveWhiteboardResponse,
  type WhiteboardRecord,
} from '@/lib/services/whiteboard';

function useWhiteboardHeaders() {
  const { userEmail, customDbUrl } = useProfile();
  return useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    };
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
    return headers;
  }, [userEmail, customDbUrl]);
}

function useWhiteboardCache() {
  const queryClient = useQueryClient();
  return useCallback(
    (updater: (prev: WhiteboardRecord[]) => WhiteboardRecord[]) => {
      queryClient.setQueryData<FetchWhiteboardsResponse>(['whiteboards'], (prev) => ({
        dbConnected: prev?.dbConnected ?? true,
        data: updater(prev?.data ?? []),
      }));
    },
    [queryClient],
  );
}

export function useBoardsQuery() {
  const { userEmail } = useProfile();
  const getHeaders = useWhiteboardHeaders();

  return useQuery<FetchWhiteboardsResponse>({
    queryKey: ['whiteboards'],
    queryFn: () => fetchWhiteboards(userEmail, getHeaders()),
    enabled: !!userEmail,
    staleTime: 60 * 1000,
  });
}

export function useSaveWhiteboard() {
  const { userEmail } = useProfile();
  const getHeaders = useWhiteboardHeaders();
  const updateCache = useWhiteboardCache();

  return useMutation<SaveWhiteboardResponse, Error, { boardId: string; name?: string; scene?: string }>({
    mutationFn: ({ boardId, name, scene }) =>
      saveWhiteboard({ boardId, name, scene, userEmail }, getHeaders()),
    onSuccess: (result, { boardId, name, scene }) => {
      if (!result.data) return;
      updateCache((list) => {
        const existing = list.find((b) => b.boardId === boardId);
        if (!existing) return [...list, result.data!];
        return list.map((b) =>
          b.boardId === boardId
            ? {
                ...b,
                ...(name !== undefined ? { name } : {}),
                ...(scene !== undefined ? { scene } : {}),
                updatedAt: result.data?.updatedAt ?? b.updatedAt,
              }
            : b,
        );
      });
    },
  });
}

export function useDeleteWhiteboard() {
  const { userEmail } = useProfile();
  const getHeaders = useWhiteboardHeaders();
  const updateCache = useWhiteboardCache();

  return useMutation<SaveWhiteboardResponse, Error, { boardId: string }>({
    mutationFn: ({ boardId }) => deleteWhiteboard({ boardId, userEmail }, getHeaders()),
    onSuccess: (_result, { boardId }) => {
      updateCache((list) => list.filter((b) => b.boardId !== boardId));
    },
  });
}