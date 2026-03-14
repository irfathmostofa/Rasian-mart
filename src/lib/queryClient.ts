// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // data stays fresh for 5 min
      gcTime: 10 * 60 * 1000, // kept in memory 10 min after unused
      retry: 1,
      refetchOnWindowFocus: false, // don't refetch just because user switched tabs
    },
  },
});
