import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Adapter } from "@btst/stack/plugins/api"
import { todosBackendPlugin } from "../api/backend"
import type { Todo } from "../types"

describe("todosBackendPlugin", () => {
  let mockAdapter: Adapter

  beforeEach(() => {
    mockAdapter = {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as Adapter
  })

  describe("listTodos", () => {
    it("should return empty array when adapter returns null", async () => {
      vi.mocked(mockAdapter.findMany).mockResolvedValue(null as any)

      const routes = todosBackendPlugin.routes(mockAdapter)
      const result = await routes.listTodos({} as any)

      expect(result).toEqual([])
      expect(mockAdapter.findMany).toHaveBeenCalledWith({
        model: "todo",
        sortBy: {
          field: "createdAt",
          direction: "desc",
        },
      })
    })

    it("should return empty array when adapter returns undefined", async () => {
      vi.mocked(mockAdapter.findMany).mockResolvedValue(undefined as any)

      const routes = todosBackendPlugin.routes(mockAdapter)
      const result = await routes.listTodos({} as any)

      expect(result).toEqual([])
    })

    it("should return todos when adapter returns array", async () => {
      const todos: Todo[] = [
        {
          id: "1",
          title: "First",
          completed: false,
          createdAt: new Date("2024-01-01"),
        },
      ]

      vi.mocked(mockAdapter.findMany).mockResolvedValue(todos)

      const routes = todosBackendPlugin.routes(mockAdapter)
      const result = await routes.listTodos({} as any)

      expect(result).toEqual(todos)
    })
  })

  describe("createTodo", () => {
    it("should apply default completed value when not provided", async () => {
      const newTodo: Todo = {
        id: "1",
        title: "Test",
        completed: false,
        createdAt: new Date(),
      }

      vi.mocked(mockAdapter.create).mockResolvedValue(newTodo)

      const routes = todosBackendPlugin.routes(mockAdapter)
      const result = await routes.createTodo({ body: { title: "Test" } } as any)

      expect(mockAdapter.create).toHaveBeenCalledWith({
        model: "todo",
        data: {
          title: "Test",
          completed: false,
          createdAt: expect.any(Date),
        },
      })
      expect(result).toEqual(newTodo)
    })

    it("should use explicit completed value when provided", async () => {
      const newTodo: Todo = {
        id: "1",
        title: "Test",
        completed: true,
        createdAt: new Date(),
      }

      vi.mocked(mockAdapter.create).mockResolvedValue(newTodo)

      const routes = todosBackendPlugin.routes(mockAdapter)
      await routes.createTodo({ body: { title: "Test", completed: true } } as any)

      expect(mockAdapter.create).toHaveBeenCalledWith({
        model: "todo",
        data: {
          title: "Test",
          completed: true,
          createdAt: expect.any(Date),
        },
      })
    })
  })

  describe("updateTodo", () => {
    it("should throw error when adapter returns null", async () => {
      vi.mocked(mockAdapter.update).mockResolvedValue(null as any)

      const routes = todosBackendPlugin.routes(mockAdapter)

      await expect(
        routes.updateTodo({
          params: { id: "999" },
          body: { completed: true },
        } as any)
      ).rejects.toThrow("Todo not found")
    })

    it("should throw error when adapter returns undefined", async () => {
      vi.mocked(mockAdapter.update).mockResolvedValue(undefined as any)

      const routes = todosBackendPlugin.routes(mockAdapter)

      await expect(
        routes.updateTodo({
          params: { id: "999" },
          body: { completed: true },
        } as any)
      ).rejects.toThrow("Todo not found")
    })

    it("should return updated todo when found", async () => {
      const updatedTodo: Todo = {
        id: "1",
        title: "Updated",
        completed: true,
        createdAt: new Date(),
      }

      vi.mocked(mockAdapter.update).mockResolvedValue(updatedTodo)

      const routes = todosBackendPlugin.routes(mockAdapter)
      const result = await routes.updateTodo({
        params: { id: "1" },
        body: { completed: true },
      } as any)

      expect(result).toEqual(updatedTodo)
    })
  })

  describe("deleteTodo", () => {
    it("should return success after deletion", async () => {
      vi.mocked(mockAdapter.delete).mockResolvedValue(undefined)

      const routes = todosBackendPlugin.routes(mockAdapter)
      const result = await routes.deleteTodo({ params: { id: "1" } } as any)

      expect(mockAdapter.delete).toHaveBeenCalledWith({
        model: "todo",
        where: [{ field: "id", value: "1" }],
      })
      expect(result).toEqual({ success: true })
    })
  })
})
