"use client";

import { lazy } from "react";

import { usePluginOverrides } from "@btst/stack/context";
import { ComposedRoute } from "@btst/stack/client/components";

import type { TodosPluginOverrides } from "../../overrides";
import { DefaultError } from "../../shared/default-error";
import { FormLoading } from "../../shared/loading";
import { NotFoundPage } from "./404-page";

// Lazy load the internal component with actual page content
const AddTodoPage = lazy(() =>
  import("./add-todo-page.internal").then((m) => ({
    default: m.AddTodoPage,
  }))
);

// Exported wrapped component with error and loading boundaries
export function AddTodoPageComponent() {
  const { onRouteError } = usePluginOverrides<TodosPluginOverrides>("todos");

  return (
    <ComposedRoute
      path="/todos/add"
      PageComponent={AddTodoPage}
      ErrorComponent={DefaultError}
      LoadingComponent={FormLoading}
      NotFoundComponent={NotFoundPage}
      onError={(error) => {
        if (onRouteError) {
          onRouteError("addTodo", error, {
            path: "/todos/add",
            isSSR: typeof window === "undefined",
          });
        }
      }}
    />
  );
}

