// IMPORTANT: Memory adapter is used for development and testing only
import { betterStack } from "@btst/stack"
import { createMemoryAdapter } from "@btst/adapter-memory"
import { todosBackendPlugin } from "@btst/todo-plugin/api"

const { handler, dbSchema } = betterStack({
  basePath: "/api/data",
  plugins: {
    todos: todosBackendPlugin
  },
  adapter: (db) => createMemoryAdapter(db)({})
})

export { handler, dbSchema }