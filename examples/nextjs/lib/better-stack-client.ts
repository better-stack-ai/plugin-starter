import { createStackClient } from "@btst/stack/client"
import { todosClientPlugin } from "@btst/todo-plugin/client"
import { QueryClient } from "@tanstack/react-query"

const getBaseURL = () => 
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_BASE_URL || window.location.origin)
    : (process.env.BASE_URL || "http://localhost:3000")

export const getStackClient = (queryClient: QueryClient) => {
  const baseURL = getBaseURL()
  return createStackClient({
    plugins: {
      // Add your client plugins here
      todos: todosClientPlugin({
        queryClient: queryClient,
        apiBaseURL: baseURL,
        apiBasePath: "/api/data",
        siteBaseURL: baseURL,
        siteBasePath: "/pages",
      }),
    }
  })
}