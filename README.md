# Better-Stack Plugin Starter

A monorepo template for creating plugins for [Better-Stack](https://github.com/better-stack). This starter includes everything you need to build, test, and integrate plugins with Better-Stack applications.

## Overview

This repository provides:
- A complete plugin development environment
- Starter plugin (`todo-plugin`) that you'll modify and publish to npm
- Shared UI components package
- Next.js example application showing plugin integration
- E2E testing setup with Playwright
- TypeScript configuration and ESLint setup

**Getting Started:** Clone this repository, modify the `todo-plugin` package to match your needs, update the package name in `package.json`, and publish it to npm under your own account.

## Getting Started

### Prerequisites

- Node.js >= 20 (use `.nvmrc` for the correct version)
- pnpm >= 10.4.1

### Installation

1. **Clone the repository** (or use this as a template):
   ```bash
   git clone <your-repo-url>
   cd plugin-starter
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Use the correct Node version**:
   ```bash
   nvm use
   ```

4. **Build all packages**:
   ```bash
   pnpm build
   ```

5. **Start the development server**:
   ```bash
   pnpm dev
   ```

The example Next.js application will be available at `http://localhost:3000`.

## Project Structure

```
plugin-starter/
├── packages/
│   ├── todo-plugin/          # Your plugin (modify this and publish to npm)
│   │   ├── src/
│   │   │   ├── api/          # Backend plugin (API endpoints)
│   │   │   ├── client/       # Client plugin (React components, routes)
│   │   │   ├── schema.ts     # Database schema definition
│   │   │   └── types.ts      # TypeScript types
│   │   └── package.json      # Update name here before publishing
│   ├── ui/                    # Shared UI components (shadcn/ui)
│   └── eslint-config/         # Shared ESLint configuration
├── examples/
│   └── nextjs/                # Next.js example app showing plugin usage
├── e2e/                       # End-to-end tests
└── package.json               # Root package.json with workspace scripts
```

## Tutorial: Building Your Better-Stack Plugin

This tutorial walks you through customizing the `todo-plugin` to build your own Better-Stack plugin. You'll modify the existing plugin and publish it to npm under your own account.

### Step 1: Update Package Configuration

First, update `packages/todo-plugin/package.json` with your own package name and npm account:

```json
{
  "name": "@your-username/your-plugin-name",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "unbuild",
    "dev": "unbuild --watch",
    "typecheck": "tsc --project tsconfig.json --noEmit",
    "lint": "eslint . --max-warnings 0"
  },
  "sideEffects": ["./dist/style.css"],
  "exports": {
    "./css": "./dist/style.css",
    "./api": {
      "types": "./dist/api/index.d.ts",
      "import": "./dist/api/index.mjs",
      "default": "./dist/api/index.mjs"
    },
    "./client": {
      "types": "./dist/client/index.d.ts",
      "import": "./dist/client/index.mjs",
      "default": "./dist/client/index.mjs"
    }
  },
  "peerDependencies": {
    "@btst/stack": "catalog:",
    "@tanstack/react-query": ">=5.66.0",
    "react": ">=18.0.0",
    "zod": ">=3.24.0"
  }
}
```

**Note:** Make sure to update all references to `@btst/todo-plugin` throughout the codebase to match your new package name.

### Step 2: Define Your Database Schema

Modify `packages/todo-plugin/src/schema.ts` to define your database models. The existing file shows how to define models:

```typescript
import { createDbPlugin } from "@btst/stack/plugins/api"

export const todoPluginSchema = createDbPlugin("todo-plugin", {
  todo: {
    modelName: "todo",
    fields: {
      title: {
        type: "string",
        required: true
      },
      completed: {
        type: "boolean",
        defaultValue: false
      },
      createdAt: {
        type: "date",
        defaultValue: () => new Date()
      }
    }
  }
})
```

Update the plugin name and model definitions to match your use case.

### Step 3: Update TypeScript Types

Modify `packages/todo-plugin/src/types.ts` to match your data models:

```typescript
export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}
```

### Step 4: Build the Backend Plugin

Modify `packages/todo-plugin/src/api/backend.ts`:

```typescript
import { type Adapter, defineBackendPlugin, createEndpoint } from "@btst/stack/plugins/api"
import { z } from "zod"
import { todoPluginSchema as dbSchema } from "../schema"
import type { Todo } from "../types"

// Validation schemas
export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional()
})

/**
 * Backend plugin - provides API endpoints
 */
export const todoPluginBackendPlugin = defineBackendPlugin({
  name: "todo-plugin",
  dbPlugin: dbSchema,
  
  routes: (adapter: Adapter) => {
    // GET /todos - List all todos
    const listTodos = createEndpoint(
      "/todos",
      { method: "GET" },
      async () => {
        const todos = await adapter.findMany<Todo>({
          model: "todo",
          sortBy: {
            field: "createdAt",
            direction: "desc"
          }
        })
        return todos || []
      }
    )

    // POST /todos - Create a new todo
    const createTodo = createEndpoint(
      "/todos",
      {
        method: "POST",
        body: createTodoSchema
      },
      async (ctx) => {
        const { title } = ctx.body
        const newTodo = await adapter.create<Todo>({
          model: "todo",
          data: {
            title,
            completed: false,
            createdAt: new Date()
          }
        })
        return newTodo
      }
    )

    // PUT /todos/:id - Update a todo
    const updateTodo = createEndpoint(
      "/todos/:id",
      {
        method: "PUT",
        body: updateTodoSchema
      },
      async (ctx) => {
        const updated = await adapter.update({
          model: "todo",
          where: [{ field: "id", value: ctx.params.id }],
          update: ctx.body
        })
        if (!updated) {
          throw new Error("Todo not found")
        }
        return updated
      }
    )

    // DELETE /todos/:id - Delete a todo
    const deleteTodo = createEndpoint(
      "/todos/:id",
      { method: "DELETE" },
      async (ctx) => {
        await adapter.delete({
          model: "todo",
          where: [{ field: "id", value: ctx.params.id }]
        })
        return { success: true }
      }
    )

    return {
      listTodos,
      createTodo,
      updateTodo,
      deleteTodo
    } as const
  }
})

export type TodoPluginApiRouter = ReturnType<typeof todoPluginBackendPlugin.routes>
```

The `src/api/index.ts` file already exports everything you need.

### Step 5: Build the Client Plugin

Modify `packages/todo-plugin/src/client/client.tsx`:

```typescript
import { createApiClient, defineClientPlugin, createRoute } from "@btst/stack/plugins/client"
import type { QueryClient } from "@tanstack/react-query"
import type { TodoPluginApiRouter } from "../api/backend"
import { lazy } from "react"

export interface TodoPluginClientConfig {
  queryClient: QueryClient
  apiBaseURL: string
  apiBasePath: string
  siteBaseURL: string
  siteBasePath: string
  context?: Record<string, unknown>
}

// SSR loader for prefetching data
function todosLoader(config: TodoPluginClientConfig) {
  return async () => {
    if (typeof window === "undefined") {
      const { queryClient, apiBasePath, apiBaseURL } = config
      
      await queryClient.prefetchQuery({
        queryKey: ["todos"],
        queryFn: async () => {
          const client = createApiClient<TodoPluginApiRouter>({
            baseURL: apiBaseURL,
            basePath: apiBasePath,
          })
          const response = await client("/todos", { method: "GET" })
          return response.data
        },
      })
    }
  }
}

// Meta generator for SEO
function createTodosMeta(config: TodoPluginClientConfig, path: string) {
  return () => {
    const { queryClient, siteBaseURL, siteBasePath } = config
    const todos = queryClient.getQueryData<any[]>(["todos"]) ?? []
    const fullUrl = `${siteBaseURL}${siteBasePath}${path}`
    
    return [
      { name: "title", content: `${todos.length} Todos` },
      { name: "description", content: `Manage ${todos.length} todos.` },
      { property: "og:title", content: `${todos.length} Todos` },
      { property: "og:url", content: fullUrl },
    ]
  }
}

export const todoPluginClientPlugin = (config: TodoPluginClientConfig) =>
  defineClientPlugin({
    name: "todo-plugin",
    
    routes: () => ({
      todosList: createRoute("/todos", () => {
        const TodosListPageComponent = lazy(() =>
          import("./pages/todos-list").then((m) => ({
            default: m.TodosListPageComponent,
          }))
        )
        
        return {
          PageComponent: TodosListPageComponent,
          loader: todosLoader(config),
          meta: createTodosMeta(config, "/todos"),
        }
      }),
    }),
    
    sitemap: async () => {
      return [
        { 
          url: `${config.siteBaseURL}${config.siteBasePath}/todos`, 
          lastModified: new Date(), 
          priority: 0.7 
        },
      ]
    },
  })
```

Modify `packages/todo-plugin/src/client/hooks.tsx`:

```typescript
"use client"
import { createApiClient } from "@btst/stack/plugins/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import type { TodoPluginApiRouter } from "../api/backend"

export function useTodos() {
  const client = createApiClient<TodoPluginApiRouter>({
    baseURL: "/api/data"
  })

  return useSuspenseQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await client("/todos", { method: "GET" })
      return response.data
    }
  })
}

export function useCreateTodo() {
  const client = createApiClient<TodoPluginApiRouter>({
    baseURL: "/api/data"
  })
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string }) => {
      const response = await client("@post/todos", {
        method: "POST",
        body: data
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    }
  })
}
```

The `src/client/index.ts` file already exports everything you need.

### Step 6: Create Page Components

Modify `packages/todo-plugin/src/client/pages/todos-list/todos-list-page.tsx`:

```typescript
"use client"
import { PageWrapper } from "../../shared/page-wrapper"
import { PageHeader } from "../../shared/page-header"
import { useTodos, useCreateTodo } from "../../hooks"
import { Button } from "@workspace/ui/components/button"

export function TodosListPageComponent() {
  const { data: todos } = useTodos()
  const createTodo = useCreateTodo()

  return (
    <PageWrapper>
      <PageHeader title="Todos" />
      <div className="space-y-4">
        {todos.map((todo) => (
          <div key={todo.id}>{todo.title}</div>
        ))}
        <Button onClick={() => createTodo.mutate({ title: "New Todo" })}>
          Add Todo
        </Button>
      </div>
    </PageWrapper>
  )
}
```

### Step 7: Add Styles

Modify `packages/todo-plugin/src/style.css` to add your plugin-specific styles:

```css
/* Your plugin-specific styles */
.todo-plugin-container {
  /* styles */
}
```

### Step 8: Configure Build

The `packages/todo-plugin/build.config.ts` file is already configured:

```typescript
import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  entries: [
    "src/api/index",
    "src/client/index",
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
```

### Step 9: Integrate in Your App

After publishing your plugin to npm, integrate it in your Better-Stack application:

**Backend Integration** (`examples/nextjs/lib/better-stack.ts`):

```typescript
import { betterStack } from "@btst/stack"
import { createMemoryAdapter } from "@btst/adapter-memory"
import { todoPluginBackendPlugin } from "@your-username/your-plugin-name/api"

const { handler, dbSchema } = betterStack({
  basePath: "/api/data",
  plugins: {
    "todo-plugin": todoPluginBackendPlugin
  },
  adapter: (db) => createMemoryAdapter(db)({})
})

export { handler, dbSchema }
```

**Client Integration** (`examples/nextjs/lib/better-stack-client.ts`):

```typescript
import { createStackClient } from "@btst/stack"
import { todoPluginClientPlugin } from "@your-username/your-plugin-name/client"

export const getStackClient = (queryClient: QueryClient) => {
  return createStackClient({
    plugins: {
      "todo-plugin": todoPluginClientPlugin({
        queryClient: queryClient,
        apiBaseURL: baseURL,
        apiBasePath: "/api/data",
        siteBaseURL: baseURL,
        siteBasePath: "/pages",
      }),
    }
  })
}
```

**Add CSS** (`examples/nextjs/app/globals.css`):

```css
@import "@your-username/your-plugin-name/css";
```

### Step 10: Build and Publish

```bash
# Build your plugin
pnpm --filter @your-username/your-plugin-name build

# Run type checking
pnpm --filter @your-username/your-plugin-name typecheck

# Run linting
pnpm --filter @your-username/your-plugin-name lint

# Publish to npm (make sure you're logged in: npm login)
cd packages/todo-plugin
npm publish --access public
```

## Commands

### Root Level Commands

- `pnpm build` - Build all packages
- `pnpm dev` - Start development servers in watch mode
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages
- `pnpm e2e:smoke` - Run end-to-end smoke tests
- `pnpm format` - Format code with Prettier

### Package-Specific Commands

Build your plugin:
```bash
pnpm --filter @your-username/your-plugin-name build
```

Run tests for your plugin:
```bash
pnpm --filter @your-username/your-plugin-name test
```

**Note:** Replace `@your-username/your-plugin-name` with your actual package name from `package.json`.

## Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components, shared via the `@workspace/ui` package.

### Adding Components

To add shadcn components, run the command at the root of your `ui` package:

```bash
cd packages/ui
pnpm dlx shadcn@latest add button
```

This pattern allows you to share components between multiple plugins.

### Using Components

Import components from the `ui` package in your plugins:

```tsx
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
```

## Styling

### Importing Plugin Styles

After publishing your plugin, import its CSS in your application's global CSS file:

```css
@import "@your-username/your-plugin-name/css";
```

### Tailwind Configuration

The project uses Tailwind CSS v4. Plugin styles are automatically included when you import the plugin's CSS.

## Testing

### Unit Tests

Your plugin includes unit tests using Vitest:

```bash
pnpm --filter @your-username/your-plugin-name test
```

### E2E Tests

End-to-end tests are located in the `e2e/` directory and use Playwright:

```bash
pnpm e2e:smoke
```

## Project Structure Best Practices

1. **Separate API and Client**: Keep backend (`api/`) and frontend (`client/`) code separate
2. **Type Safety**: Export TypeScript types for your API router and data models
3. **Schema Validation**: Use Zod schemas for request/response validation
4. **SSR Support**: Implement loaders for server-side rendering
5. **SEO**: Provide meta generators for each route
6. **Error Handling**: Include error boundaries and loading states
7. **Shared Components**: Use the `@workspace/ui` package for reusable UI

## Reference Implementation

The `todo-plugin` package is your starting point and serves as a complete reference implementation. Study it to understand:
- Database schema definition
- Backend API endpoints
- Client-side React components
- React Query hooks
- Route configuration
- SSR and meta generation

Modify the `todo-plugin` to build your own plugin, then publish it to npm under your own account.

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
