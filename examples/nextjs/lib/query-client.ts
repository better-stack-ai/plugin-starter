import { QueryClient, isServer } from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: isServer ? 60 * 1000 : 0,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false
      },
      dehydrate: {
        // Include both successful and error states to avoid refetching on the client
        // This prevents loading states when there's an error in prefetched data
        shouldDehydrateQuery: () => {
            return true
        }
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getOrCreateQueryClient() {
    if (isServer) {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}