'use client';

import { useQuery } from '@tanstack/react-query';

export function useSafeQuery(queryKey, queryFn, options) {
  return useQuery({
    queryKey,
    queryFn,
    ...options
  });
}
