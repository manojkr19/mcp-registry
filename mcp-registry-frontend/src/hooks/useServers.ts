import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SearchFilters } from '@/lib/types';

// Hook for fetching servers with pagination
export function useServers(filters: SearchFilters = {}) {
  return useQuery({
    queryKey: ['servers', filters],
    queryFn: () => api.getServers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for infinite scroll pagination
export function useInfiniteServers(filters: SearchFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['servers-infinite', filters],
    queryFn: ({ pageParam }) => 
      api.getServers({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.metadata?.next_cursor,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for fetching a single server
export function useServer(id: string) {
  return useQuery({
    queryKey: ['server', id],
    queryFn: () => api.getServerById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for searching servers
export function useSearchServers(query: string, filters: SearchFilters = {}) {
  return useQuery({
    queryKey: ['search-servers', query, filters],
    queryFn: () => api.searchServers(query, filters),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for health check
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 1000, // 1 minute
  });
}