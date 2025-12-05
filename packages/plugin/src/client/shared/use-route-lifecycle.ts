"use client";

import { useEffect, useRef } from "react";
import { usePluginOverrides } from "@btst/stack/context";
import type { TodosPluginOverrides, RouteContext } from "../overrides";



interface UseRouteLifecycleOptions<TRouteName extends string> {
  routeName: TRouteName;
  context: RouteContext;
  beforeRenderHook?: (
    overrides: Partial<TodosPluginOverrides>,
    context: RouteContext
  ) => boolean | void | Promise<boolean | void>;
}

/**
 * Hook to handle route lifecycle events
 * Calls beforeRender hooks on mount and tracks render lifecycle
 */
export function useRouteLifecycle<TRouteName extends string>({
  routeName,
  context,
  beforeRenderHook,
}: UseRouteLifecycleOptions<TRouteName>) {
  const overrides = usePluginOverrides<
    TodosPluginOverrides,
    Partial<TodosPluginOverrides>
  >("todos", {});
  
  const hasCalledBeforeRender = useRef(false);

  useEffect(() => {
    if (!hasCalledBeforeRender.current && beforeRenderHook) {
      hasCalledBeforeRender.current = true;
      const result = beforeRenderHook(overrides, context);
      // Handle Promise if returned
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(`Error in beforeRenderHook in ${routeName}:`, error);
        });
      }
    }
  }, [beforeRenderHook, context, overrides, routeName]);

  return { overrides };
}

