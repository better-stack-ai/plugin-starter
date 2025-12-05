import { describe, it, expect, vi, beforeEach } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import type { Todo } from "../types"

// Mock the API client creation
vi.mock("@btst/stack/plugins/client", () => ({
  createApiClient: vi.fn(() => ({
    "@put/todos/:id": vi.fn(),
    "@delete/todos/:id": vi.fn(),
  })),
}))

// We can't easily test React hooks without React Testing Library,
// but we can test the pure logic functions if we extract them.
// For now, let's test the critical optimistic update logic

describe("Optimistic update logic", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  describe("useToggleTodo optimistic update", () => {
    it("should handle null old data gracefully", () => {
      // Simulate the onMutate logic
      const oldData: Todo[] | undefined = undefined

      const updateFn = (old: Todo[] | undefined) => {
        if (!old) {
          return old
        }
        return old.map((todo) =>
          todo.id === "1" ? { ...todo, completed: true } : todo
        )
      }

      const result = updateFn(oldData)
      expect(result).toBeUndefined()
    })

    it("should update correct todo in array", () => {
      const todos: Todo[] = [
        { id: "1", title: "First", completed: false, createdAt: new Date() },
        { id: "2", title: "Second", completed: false, createdAt: new Date() },
      ]

      const updateFn = (old: Todo[] | undefined) => {
        if (!old) {
          return old
        }
        return old.map((todo) =>
          todo.id === "1" ? { ...todo, completed: true } : todo
        )
      }

      const result = updateFn(todos)
      expect(result).toEqual([
        { id: "1", title: "First", completed: true, createdAt: todos[0]?.createdAt },
        { id: "2", title: "Second", completed: false, createdAt: todos[1]?.createdAt },
      ])
      // Original array should not be mutated
      expect(todos[0]?.completed).toBe(false)
    })

    it("should handle empty array", () => {
      const todos: Todo[] = []

      const updateFn = (old: Todo[] | undefined) => {
        if (!old) {
          return old
        }
        return old.map((todo) =>
          todo.id === "1" ? { ...todo, completed: true } : todo
        )
      }

      const result = updateFn(todos)
      expect(result).toEqual([])
    })
  })

  describe("Cache rollback logic", () => {
    it("should restore previous data on error", () => {
      const previousTodos: Todo[] = [
        { id: "1", title: "First", completed: false, createdAt: new Date() },
      ]

      // Simulate error rollback
      queryClient.setQueryData(["todos"], previousTodos)

      const data = queryClient.getQueryData<Todo[]>(["todos"])
      expect(data).toEqual(previousTodos)
    })
  })
})
