import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { getOrCreateQueryClient } from "@/lib/query-client"
import { getStackClient } from "@/lib/better-stack-client"
import { metaElementsToObject, normalizePath } from "@btst/stack/client"
import { Metadata } from "next"

export default async function Page({ params }: { params: Promise<{ all: string[] }> }) {
  const pathParams = await params
  const path = normalizePath(pathParams?.all)
  
  const queryClient = getOrCreateQueryClient()
  const stackClient = getStackClient(queryClient)
  const route = stackClient.router.getRoute(path)
  
  // Prefetch data server-side if the route has a loader
  if (route?.loader) await route.loader()
  
  // Serialize React Query cache for client hydration
  const dehydratedState = dehydrate(queryClient)
  
  return (
    <HydrationBoundary state={dehydratedState}>
      {route && route.PageComponent ? <route.PageComponent /> : notFound()}
    </HydrationBoundary>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ all: string[] }> }): Promise<Metadata> {
  const pathParams = await params
  const path = normalizePath(pathParams?.all)
  
  const queryClient = getOrCreateQueryClient()
  const stackClient = getStackClient(queryClient)
  const route = stackClient.router.getRoute(path)
  
  if (!route) return notFound()
  if (route?.loader) await route.loader()
  
  // Convert plugin meta elements to Next.js Metadata format
  return route.meta ? metaElementsToObject(route.meta()) satisfies Metadata : { title: "No meta" }
}
