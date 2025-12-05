import { describe, it, expect, vi, beforeEach } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import { todosClientPlugin, todosLoader, createTodosMeta, createAddTodoMeta } from "../client/client"
import type { Todo } from "../types"
import type { TodosClientConfig } from "../client/client"

// Mock the API client
vi.mock("@btst/stack/plugins/client", async () => {
  const actual = await vi.importActual("@btst/stack/plugins/client")
  return {
    ...actual,
    createApiClient: vi.fn(),
  }
})

describe("todosClientPlugin", () => {
  let queryClient: QueryClient
  let config: TodosClientConfig

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    config = {
      queryClient,
      apiBaseURL: "https://api.example.com",
      apiBasePath: "/api/data",
      siteBaseURL: "https://example.com",
      siteBasePath: "",
    }
  })

  describe("todosLoader", () => {
    it("should skip prefetching on client side", async () => {
      // Mock window to exist (client side)
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      })

      const loader = todosLoader(config)
      const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery")

      await loader()

      // Should not prefetch on client side
      expect(prefetchSpy).not.toHaveBeenCalled()

      // Cleanup
      delete (global as any).window
    })

    it("should prefetch todos on server side", async () => {
      // Ensure window is undefined (server side)
      const originalWindow = global.window
      delete (global as any).window

      const { createApiClient } = await import("@btst/stack/plugins/client")
      const mockClientFn = vi.fn().mockResolvedValue({
        data: [
          { id: "1", title: "Test", completed: false, createdAt: new Date() },
        ],
      })
      vi.mocked(createApiClient).mockReturnValue(mockClientFn as any)

      const loader = todosLoader(config)
      await loader()

      expect(createApiClient).toHaveBeenCalledWith({
        baseURL: config.apiBaseURL,
        basePath: config.apiBasePath,
      })
      expect(mockClientFn).toHaveBeenCalledWith("/todos", {
        method: "GET",
      })

      // Check that data was prefetched
      const cachedData = queryClient.getQueryData<Todo[]>(["todos"])
      expect(cachedData).toEqual([
        { id: "1", title: "Test", completed: false, createdAt: expect.any(Date) },
      ])

      // Restore window
      global.window = originalWindow
    })

    it("should return empty array on error", async () => {
      const originalWindow = global.window
      delete (global as any).window

      const { createApiClient } = await import("@btst/stack/plugins/client")
      const mockClientFn = vi.fn().mockRejectedValue(new Error("API Error"))
      vi.mocked(createApiClient).mockReturnValue(mockClientFn as any)

      const loader = todosLoader(config)

      // Should not throw
      await loader()

      // Should have cached empty array
      const cachedData = queryClient.getQueryData<Todo[]>(["todos"])
      expect(cachedData).toEqual([])

      global.window = originalWindow
    })
  })

  describe("createTodosMeta", () => {
    it("should generate meta tags with correct todo count", () => {
      const todos: Todo[] = [
        { id: "1", title: "First", completed: false, createdAt: new Date() },
        { id: "2", title: "Second", completed: true, createdAt: new Date() },
      ]

      queryClient.setQueryData(["todos"], todos)

      const metaFn = createTodosMeta(config, "/todos")
      const result = metaFn()

      expect(result).toEqual(
        expect.arrayContaining([
          { name: "title", content: "2 Todos" },
          { name: "description", content: "Track 2 todos. Add, toggle and delete." },
          { name: "keywords", content: "todos, tasks, productivity" },
          { property: "og:title", content: "2 Todos" },
          { property: "og:description", content: "Track 2 todos. Add, toggle and delete." },
          { property: "og:type", content: "website" },
          { property: "og:url", content: "https://example.com/todos" },
          { name: "twitter:card", content: "summary" },
          { name: "twitter:title", content: "2 Todos" },
          { name: "twitter:description", content: "Track 2 todos. Add, toggle and delete." },
        ])
      )
    })

    it("should handle empty todos array", () => {
      queryClient.setQueryData(["todos"], [])

      const metaFn = createTodosMeta(config, "/todos")
      const result = metaFn()

      expect(result).toEqual(
        expect.arrayContaining([
          { name: "title", content: "0 Todos" },
          { name: "description", content: "Track 0 todos. Add, toggle and delete." },
        ])
      )
    })

    it("should handle missing todos data", () => {
      queryClient.removeQueries({ queryKey: ["todos"] })

      const metaFn = createTodosMeta(config, "/todos")
      const result = metaFn()

      expect(result).toEqual(
        expect.arrayContaining([
          { name: "title", content: "0 Todos" },
        ])
      )
    })

    it("should construct correct URL with siteBasePath", () => {
      const configWithPath: TodosClientConfig = {
        ...config,
        siteBasePath: "/app",
      }

      queryClient.setQueryData(["todos"], [])

      const metaFn = createTodosMeta(configWithPath, "/todos")
      const result = metaFn()

      const ogUrl = result.find((tag) => tag.property === "og:url")
      expect(ogUrl).toEqual({
        property: "og:url",
        content: "https://example.com/app/todos",
      })
    })
  })

  describe("createAddTodoMeta", () => {
    it("should generate correct meta tags for add todo page", () => {
      const metaFn = createAddTodoMeta(config, "/todos/add")
      const result = metaFn()

      expect(result).toEqual([
        { name: "title", content: "Add Todo" },
        { name: "description", content: "Create a new todo item." },
        { name: "keywords", content: "add todo, create task" },
        { property: "og:title", content: "Add Todo" },
        { property: "og:description", content: "Create a new todo item." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://example.com/todos/add" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "Add Todo" },
        { name: "twitter:description", content: "Create a new todo item." },
      ])
    })

    it("should construct correct URL with siteBasePath", () => {
      const configWithPath: TodosClientConfig = {
        ...config,
        siteBasePath: "/app",
      }

      const metaFn = createAddTodoMeta(configWithPath, "/todos/add")
      const result = metaFn()

      const ogUrl = result.find((tag) => tag.property === "og:url")
      expect(ogUrl).toEqual({
        property: "og:url",
        content: "https://example.com/app/todos/add",
      })
    })
  })

  describe("sitemap", () => {
    it("should generate correct sitemap entries", async () => {
      const plugin = todosClientPlugin(config)
      const sitemap = await plugin.sitemap?.()

      expect(sitemap).toBeDefined()
      expect(sitemap).toEqual([
        {
          url: "https://example.com/todos",
          lastModified: expect.any(Date),
          priority: 0.7,
        },
        {
          url: "https://example.com/todos/add",
          lastModified: expect.any(Date),
          priority: 0.6,
        },
      ])
    })

    it("should use siteBasePath in URLs", async () => {
      const configWithPath: TodosClientConfig = {
        ...config,
        siteBasePath: "/app",
      }

      const plugin = todosClientPlugin(configWithPath)
      const sitemap = await plugin.sitemap?.()

      expect(sitemap).toBeDefined()
      if (sitemap) {
        expect(sitemap[0]?.url).toBe("https://example.com/app/todos")
        expect(sitemap[1]?.url).toBe("https://example.com/app/todos/add")
      }
    })

    it("should generate fresh dates", async () => {
      const before = new Date()
      await new Promise((resolve) => setTimeout(resolve, 10))

      const plugin = todosClientPlugin(config)
      const sitemap = await plugin.sitemap?.()

      const after = new Date()

      expect(sitemap).toBeDefined()
      if (sitemap && sitemap[0]) {
        const lastModified = sitemap[0].lastModified
        const lastModifiedDate = lastModified instanceof Date ? lastModified : new Date(lastModified as any)
        expect(lastModifiedDate.getTime()).toBeGreaterThanOrEqual(
          before.getTime()
        )
        expect(lastModifiedDate.getTime()).toBeLessThanOrEqual(
          after.getTime()
        )
      }
    })
  })
})
