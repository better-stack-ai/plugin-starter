import type { ComponentType, ReactNode } from "react";
import type { TodosLocalization } from "../localization";

export interface RouteContext {
  path: string;
  params?: Record<string, string>;
  isSSR: boolean;
}

/**
 * Context passed to lifecycle hooks
 */
export interface RouteContext {
	/** Current route path */
	path: string;
	/** Route parameters (e.g., { slug: "my-post" }) */
	params?: Record<string, string>;
	/** Whether rendering on server (true) or client (false) */
	isSSR: boolean;
	/** Additional context properties */
	[key: string]: any;
}

/**
 * Route names for the Todos plugin
 */
export type TodosRouteName = "todosList" | "addTodo";

/**
 * Overridable components and functions for the Todos plugin
 *
 * External consumers can provide their own implementations of these
 * to customize the behavior for their framework (Next.js, React Router, etc.)
 */
export interface TodosPluginOverrides {
  /**
   * Link component for navigation
   * Must accept href and children props at minimum
   */
  Link: ComponentType<{
    href: string;
    children: ReactNode;
    className?: string;
  }>;

  /**
   * Optional: Navigation function for programmatic navigation
   * Useful for redirects after actions
   */
  navigate?: (path: string) => void | Promise<void>;

  /**
   * Optional: Localization strings override
   */
  localization?: Partial<TodosLocalization>;

  /**
   * Optional: Called when a route encounters an error
   */
  onRouteError?: (
    routeName: TodosRouteName,
    error: Error,
    context: {
      path: string;
      isSSR: boolean;
      [key: string]: unknown;
    }
  ) => void;

  /**
   * Optional: Called before the todos list page is rendered
   * Return false to prevent rendering
   */
  onBeforeTodosListPageRendered?: (
    context: RouteContext
  ) => boolean | void | Promise<boolean | void>;

  /**
   * Optional: Called before the add todo page is rendered
   * Return false to prevent rendering
   */
  onBeforeAddTodoPageRendered?: (
    context: RouteContext
  ) => boolean | void | Promise<boolean | void>;
}
