'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/components/providers/ProfileProvider';
import { createBook } from '@/lib/actions/books';

export interface BookData {
  _id?: string;
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'TO_READ' | 'READING' | 'COMPLETED' | 'REFERENCE';
  progress: number;
  rating: number;
  userEmail?: string;
  hasPdf?: boolean;
  pdfPath?: string;
  pdfUrl?: string;
}

export type BookStatus = BookData['status'];
export const BOOK_STATUSES: BookStatus[] = ['TO_READ', 'READING', 'COMPLETED', 'REFERENCE'];

function getHeaders(customDbUrl?: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
  return headers;
}

export function useBooksQuery() {
  const { userEmail, customDbUrl } = useProfile();

  return useQuery<{ books: BookData[] }>({
    queryKey: ['books', userEmail],
    queryFn: async () => {
      const res = await fetch(`/api/db/books?userEmail=${encodeURIComponent(userEmail!)}`, {
        headers: getHeaders(customDbUrl),
      });
      if (!res.ok) throw new Error('Failed to fetch books');
      return res.json();
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddBook() {
  const { userEmail, customDbUrl } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookData: Omit<BookData, 'id' | 'userEmail'> | FormData) => {
      if (bookData instanceof FormData) {
        bookData.append('userEmail', userEmail!);
        const result = await createBook(bookData);
        if (result.error) throw new Error(result.error);
        return result;
      }
      const res = await fetch('/api/db/books', {
        method: 'POST',
        headers: getHeaders(customDbUrl),
        body: JSON.stringify({ ...bookData, userEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add book');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const { customDbUrl } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BookData> & { id: string }) => {
      const res = await fetch(`/api/db/books?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getHeaders(customDbUrl),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update book');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const { customDbUrl } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/db/books?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders(customDbUrl),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete book');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
