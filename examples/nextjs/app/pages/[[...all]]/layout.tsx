"use client"
import { BetterStackProvider } from "@btst/stack/context"
import type { TodosPluginOverrides } from "@btst/todo-plugin/client"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Define the shape of all plugin overrides for type safety
type PluginOverrides = {
  todos: TodosPluginOverrides
  // Add other plugins here
}

export default function Layout({
    children
}: {
    children: React.ReactNode
}) {
  const router = useRouter()
  
  return (
    <BetterStackProvider<PluginOverrides>
      basePath="/pages"
      overrides={{
        todos: {
          // apiBaseURL: baseURL,
          // apiBasePath: "/api/data",
          Link: (props) => <Link {...props} />,
          navigate: (path) => router.push(path),
        }
      }}
    >
      {children}
    </BetterStackProvider>
  )
}