import type { MetadataRoute } from "next"
import { QueryClient } from "@tanstack/react-query"
import { getStackClient } from "@/lib/better-stack-client"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const queryClient = new QueryClient()
  const stackClient = getStackClient(queryClient)
  return stackClient.generateSitemap()
}