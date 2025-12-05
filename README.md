# Better-Stack Plugin Starter

A monorepo template for creating plugins for [Better-Stack](https://github.com/better-stack). This starter includes everything you need to build, test, and integrate plugins with Better-Stack applications.

## Overview

This repository provides:
- A complete plugin development environment
- Example plugin (`todo-plugin`) demonstrating best practices
- Shared UI components package
- Next.js example application showing plugin integration
- E2E testing setup with Playwright
- TypeScript configuration and ESLint setup

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
│   ├── todo-plugin/          # Example plugin (reference implementation)
│   │   ├── src/
│   │   │   ├── api/          # Backend plugin (API endpoints)
│   │   │   ├── client/       # Client plugin (React components, routes)
│   │   │   ├── schema.ts     # Database schema definition
│   │   │   └── types.ts      # TypeScript types
│   │   └── package.json
│   ├── ui/                    # Shared UI components (shadcn/ui)
│   └── eslint-config/         # Shared ESLint configuration
├── examples/
│   └── nextjs/                # Next.js example app showing plugin usage
├── e2e/                       # End-to-end tests
└── package.json               # Root package.json with workspace scripts
```

## Tutorial: Building a Better-Stack Plugin

This tutorial walks you through creating a complete Better-Stack plugin. We'll use the `todo-plugin` as a reference, but you can follow these steps to create your own plugin.

### Step 1: Create Your Plugin Package

Create a new directory in `packages/` for your plugin:

```bash
mkdir packages/my-plugin
cd packages/my-plugin
```

Initialize a `package.json`:

```json
{
  "name": "@btst/my-plugin",
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

### Step 2: Define Your Database Schema

Create `src/schema.ts` to define your database models:

```typescript
import { createDbPlugin } from "@btst/stack/plugins/api"

export const myPluginSchema = createDbPlugin("my-plugin", {
  item: {
    modelName: "item",
    fields: {
      name: {
        type: "string",
        required: true
      },
      description: {
        type: "string",
        required: false
      },
      createdAt: {
        type: "date",
        defaultValue: () => new Date()
      }
    }
  }
})
```

### Step 3: Create TypeScript Types

Create `src/types.ts`:

```typescript
export type Item = {
  id: string
  name: string
  description?: string
  createdAt: Date
}
```

### Step 4: Build the Backend Plugin

Create `src/api/backend.ts`:

```typescript
import { type Adapter, defineBackendPlugin, createEndpoint } from "@btst/stack/plugins/api"
import { z } from "zod"
import { myPluginSchema as dbSchema } from "../schema"
import type { Item } from "../types"

// Validation schemas
export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
})

export const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
})

/**
 * Backend plugin - provides API endpoints
 */
export const myPluginBackendPlugin = defineBackendPlugin({
  name: "my-plugin",
  dbPlugin: dbSchema,
  
  routes: (adapter: Adapter) => {
    // GET /items - List all items
    const listItems = createEndpoint(
      "/items",
      { method: "GET" },
      async () => {
        const items = await adapter.findMany<Item>({
          model: "item",
          sortBy: {
            field: "createdAt",
            direction: "desc"
          }
        })
        return items || []
      }
    )

    // POST /items - Create a new item
    const createItem = createEndpoint(
      "/items",
      {
        method: "POST",
        body: createItemSchema
      },
      async (ctx) => {
        const { name, description } = ctx.body
        const newItem = await adapter.create<Item>({
          model: "item",
          data: {
            name,
            description,
            createdAt: new Date()
          }
        })
        return newItem
      }
    )

    // PUT /items/:id - Update an item
    const updateItem = createEndpoint(
      "/items/:id",
      {
        method: "PUT",
        body: updateItemSchema
      },
      async (ctx) => {
        const updated = await adapter.update({
          model: "item",
          where: [{ field: "id", value: ctx.params.id }],
          update: ctx.body
        })
        if (!updated) {
          throw new Error("Item not found")
        }
        return updated
      }
    )

    // DELETE /items/:id - Delete an item
    const deleteItem = createEndpoint(
      "/items/:id",
      { method: "DELETE" },
      async (ctx) => {
        await adapter.delete({
          model: "item",
          where: [{ field: "id", value: ctx.params.id }]
        })
        return { success: true }
      }
    )

    return {
      listItems,
      createItem,
      updateItem,
      deleteItem
    } as const
  }
})

export type MyPluginApiRouter = ReturnType<typeof myPluginBackendPlugin.routes>
```

Create `src/api/index.ts`:

```typescript
export * from "./backend"
```

### Step 5: Build the Client Plugin

Create `src/client/client.tsx`:

```typescript
import { createApiClient, defineClientPlugin, createRoute } from "@btst/stack/plugins/client"
import type { QueryClient } from "@tanstack/react-query"
import type { MyPluginApiRouter } from "../api/backend"
import { lazy } from "react"

export interface MyPluginClientConfig {
  queryClient: QueryClient
  apiBaseURL: string
  apiBasePath: string
  siteBaseURL: string
  siteBasePath: string
  context?: Record<string, unknown>
}

// SSR loader for prefetching data
function itemsLoader(config: MyPluginClientConfig) {
  return async () => {
    if (typeof window === "undefined") {
      const { queryClient, apiBasePath, apiBaseURL } = config
      
      await queryClient.prefetchQuery({
        queryKey: ["items"],
        queryFn: async () => {
          const client = createApiClient<MyPluginApiRouter>({
            baseURL: apiBaseURL,
            basePath: apiBasePath,
          })
          const response = await client("/items", { method: "GET" })
          return response.data
        },
      })
    }
  }
}

// Meta generator for SEO
function createItemsMeta(config: MyPluginClientConfig, path: string) {
  return () => {
    const { queryClient, siteBaseURL, siteBasePath } = config
    const items = queryClient.getQueryData<any[]>(["items"]) ?? []
    const fullUrl = `${siteBaseURL}${siteBasePath}${path}`
    
    return [
      { name: "title", content: `${items.length} Items` },
      { name: "description", content: `Manage ${items.length} items.` },
      { property: "og:title", content: `${items.length} Items` },
      { property: "og:url", content: fullUrl },
    ]
  }
}

export const myPluginClientPlugin = (config: MyPluginClientConfig) =>
  defineClientPlugin({
    name: "my-plugin",
    
    routes: () => ({
      itemsList: createRoute("/items", () => {
        const ItemsListPageComponent = lazy(() =>
          import("./pages/items-list").then((m) => ({
            default: m.ItemsListPageComponent,
          }))
        )
        
        return {
          PageComponent: ItemsListPageComponent,
          loader: itemsLoader(config),
          meta: createItemsMeta(config, "/items"),
        }
      }),
    }),
    
    sitemap: async () => {
      return [
        { 
          url: `${config.siteBaseURL}${config.siteBasePath}/items`, 
          lastModified: new Date(), 
          priority: 0.7 
        },
      ]
    },
  })
```

Create `src/client/hooks.tsx`:

```typescript
"use client"
import { createApiClient } from "@btst/stack/plugins/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import type { MyPluginApiRouter } from "../api/backend"

export function useItems() {
  const client = createApiClient<MyPluginApiRouter>({
    baseURL: "/api/data"
  })

  return useSuspenseQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await client("/items", { method: "GET" })
      return response.data
    }
  })
}

export function useCreateItem() {
  const client = createApiClient<MyPluginApiRouter>({
    baseURL: "/api/data"
  })
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await client("@post/items", {
        method: "POST",
        body: data
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    }
  })
}
```

Create `src/client/index.ts`:

```typescript
export * from "./client"
export * from "./hooks"
```

### Step 6: Create Page Components

Create `src/client/pages/items-list/items-list-page.tsx`:

```typescript
"use client"
import { PageWrapper } from "../../shared/page-wrapper"
import { PageHeader } from "../../shared/page-header"
import { useItems, useCreateItem } from "../../hooks"
import { Button } from "@workspace/ui/components/button"

export function ItemsListPageComponent() {
  const { data: items } = useItems()
  const createItem = useCreateItem()

  return (
    <PageWrapper>
      <PageHeader title="Items" />
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
        <Button onClick={() => createItem.mutate({ name: "New Item" })}>
          Add Item
        </Button>
      </div>
    </PageWrapper>
  )
}
```

### Step 7: Add Styles

Create `src/style.css`:

```css
/* Your plugin-specific styles */
.my-plugin-container {
  /* styles */
}
```

### Step 8: Configure Build

Create `build.config.ts`:

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

**Backend Integration** (`examples/nextjs/lib/better-stack.ts`):

```typescript
import { betterStack } from "@btst/stack"
import { createMemoryAdapter } from "@btst/adapter-memory"
import { myPluginBackendPlugin } from "@btst/my-plugin/api"

const { handler, dbSchema } = betterStack({
  basePath: "/api/data",
  plugins: {
    "my-plugin": myPluginBackendPlugin
  },
  adapter: (db) => createMemoryAdapter(db)({})
})

export { handler, dbSchema }
```

**Client Integration** (`examples/nextjs/lib/better-stack-client.ts`):

```typescript
import { createStackClient } from "@btst/stack"
import { myPluginClientPlugin } from "@btst/my-plugin/client"

export const getStackClient = (queryClient: QueryClient) => {
  return createStackClient({
    plugins: {
      "my-plugin": myPluginClientPlugin({
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
@import "@btst/my-plugin/css";
```

### Step 10: Build and Test

```bash
# Build your plugin
pnpm --filter @btst/my-plugin build

# Run type checking
pnpm --filter @btst/my-plugin typecheck

# Run linting
pnpm --filter @btst/my-plugin lint
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

Build a specific package:
```bash
pnpm --filter @btst/todo-plugin build
```

Run tests for a specific package:
```bash
pnpm --filter @btst/todo-plugin test
```

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

For every plugin, you need to import its CSS in your application's global CSS file:

```css
@import "@btst/todo-plugin/css";
@import "@btst/my-plugin/css";
```

### Tailwind Configuration

The project uses Tailwind CSS v4. Plugin styles are automatically included when you import the plugin's CSS.

## Testing

### Unit Tests

Plugins can include unit tests using Vitest:

```bash
pnpm --filter @btst/todo-plugin test
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

## Example Plugin

The `todo-plugin` package serves as a complete reference implementation. Study it to understand:
- Database schema definition
- Backend API endpoints
- Client-side React components
- React Query hooks
- Route configuration
- SSR and meta generation

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
