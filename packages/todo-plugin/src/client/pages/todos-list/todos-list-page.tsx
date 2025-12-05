"use client";

import { lazy } from "react";

import { usePluginOverrides } from "@btst/stack/context";
import { ComposedRoute } from "@btst/stack/client/components";

import type { TodosPluginOverrides } from "../../overrides";
import { DefaultError } from "../../shared/default-error";
import { TodosListLoading } from "../../shared/loading";
import { NotFoundPage } from "./404-page";

// Lazy load the internal component with actual page content
const TodosListPage = lazy(() =>
  import("./todos-list-page.internal").then((m) => ({
    default: m.TodosListPage,
  }))
);

// Exported wrapped component with error and loading boundaries
export function TodosListPageComponent() {
  const { onRouteError } = usePluginOverrides<TodosPluginOverrides>("todos");

  return (
    <ComposedRoute
      path="/todos"
      PageComponent={TodosListPage}
      ErrorComponent={DefaultError}
      LoadingComponent={TodosListLoading}
      NotFoundComponent={NotFoundPage}
      onError={(error) => {
        if (onRouteError) {
          onRouteError("todosList", error, {
            path: "/todos",
            isSSR: typeof window === "undefined",
          });
        }
      }}
    />
  );
}

