import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/components/providers/ProfileProvider';
import { useCallback } from 'react';

interface StatItem {
  icon?: React.ElementType;
  value: string;
  label: string;
  sub: string;
}

interface FocusItem {
  label: string;
  value: string;
  badge: string;
}

interface ProjectItem {
  name: string;
  status: string;
  progress: string;
}

interface ActivityItem {
  text: string;
  createdAt: string;
}

export interface DashboardData {
  stats: StatItem[];
  focusItems: FocusItem[];
  projects: ProjectItem[];
  activities: ActivityItem[];
}

export function useCommandCenterQuery() {
  const { userEmail, customDbUrl } = useProfile();

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userEmail) headers['x-user-email'] = userEmail;
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
    return headers;
  }, [userEmail, customDbUrl]);

  return useQuery<DashboardData>({
    queryKey: ['command-center', userEmail],
    queryFn: async () => {
      const headers = getHeaders();
      const res = await fetch(`/api/db/command-center?userEmail=${encodeURIComponent(userEmail || '')}`, { headers });
      const json = await res.json();

      if (json.dbConnected) {
        return {
          stats: json.stats.map((s: { label: string; value: string; sub: string }) => ({
            ...s,
            icon: undefined as unknown as React.ElementType,
          })),
          focusItems: json.focusItems,
          projects: json.projects,
          activities: json.activities,
        };
      }

      throw new Error('DB not connected');
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    placeholderData: () => {
      const cached = localStorage.getItem(`samundar-command-center-${userEmail}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const activities = parsed.activities?.map((a: string | { text: string; createdAt: string }) =>
            typeof a === 'string' ? { text: a, createdAt: new Date().toISOString() } : a
          ) ?? [];
          return { ...parsed, activities };
        } catch { }
      }
      return undefined;
    },
  });
}

export function useUpdateFocusItem() {
  const { userEmail, customDbUrl } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ label, value, badge }: { label: string; value: string; badge: string }) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;

      const body: Record<string, string> = {};
      if (label === 'Active Pillar') {
        body.activePillar = value;
        body.activeCategory = badge;
      } else if (label === 'Next Learning Unit') {
        body.nextLearningUnit = value;
        body.nextLearningDuration = badge;
      }

      const res = await fetch('/api/db/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update');
      return { label, value, badge };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['command-center', userEmail] });
    },
  });
}
