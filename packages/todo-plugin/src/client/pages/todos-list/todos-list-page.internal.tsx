"use client";

import { useBasePath, usePluginOverrides } from "@btst/stack/context";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { cn } from "@workspace/ui/lib/utils";
import { Item } from "@workspace/ui/components/item";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ListIcon, Loader2Icon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";

import { useDeleteTodo, useTodos, useToggleTodo } from "../../hooks";
import type { TodosPluginOverrides } from "../../overrides";
import { PageHeader } from "../../shared/page-header";
import { PageWrapper } from "../../shared/page-wrapper";
import { useRouteLifecycle } from "../../shared/use-route-lifecycle";
import { TODOS_LOCALIZATION } from "../../../localization";

// Internal component with actual page content
export function TodosListPage() {
  const { localization } = usePluginOverrides<
    TodosPluginOverrides,
    Partial<TodosPluginOverrides>
  >("todos", {
    localization: TODOS_LOCALIZATION,
  });
  const loc = { ...TODOS_LOCALIZATION, ...localization };

  // Call lifecycle hooks
  useRouteLifecycle({
    routeName: "todosList",
    context: {
      path: "/todos",
      isSSR: typeof window === "undefined",
    },
    beforeRenderHook: (overrides, context) => {
      if (overrides.onBeforeTodosListPageRendered) {
        return overrides.onBeforeTodosListPageRendered(context);
      }
      return true;
    },
  });

  return (
    <PageWrapper className="gap-6" testId="todos-list-page">
      <PageHeader title={loc.TODOS_LIST_TITLE} description={loc.TODOS_LIST_DESCRIPTION} titleTestId="todos-list-title" />
      <Suspense fallback={<TodosListSkeleton />}>
        <TodosList />
      </Suspense>
    </PageWrapper>
  );
}

function TodosList() {
  const { data: todos } = useTodos();
  const { localization } = usePluginOverrides<
    TodosPluginOverrides,
    Partial<TodosPluginOverrides>
  >("todos", {
    localization: TODOS_LOCALIZATION,
  });
  const loc = { ...TODOS_LOCALIZATION, ...localization };

  const toggleTodoMutation = useToggleTodo({
    onSuccess: () => {
      toast.success(loc.TODOS_TOGGLE_SUCCESS);
    },
    onError: () => {
      toast.error(loc.TODOS_TOGGLE_ERROR);
    },
  });
  const deleteTodoMutation = useDeleteTodo({
    onSuccess: () => {
      toast.success(loc.TODOS_DELETE_SUCCESS);
    },
    onError: () => {
      toast.error(loc.TODOS_DELETE_ERROR);
    },
  });
  const { Link } = usePluginOverrides<TodosPluginOverrides>("todos");
  const basePath = useBasePath();

  return (
    <>
      <div className="space-y-2 w-full" data-test-id="todos-list">
        {todos?.map((todo) => (
          <Item
            key={todo.id}
            className="flex items-center gap-3 border border-border rounded-md p-3"
            data-test-id={`todo-item-${todo.id}`}
          >
            <Checkbox
              id={todo.id}
              value={todo.id}
              checked={todo.completed}
              data-test-id={`todo-checkbox-${todo.id}`}
              onCheckedChange={() => {
                toggleTodoMutation.mutate({
                  id: todo.id,
                  completed: !todo.completed,
                });
              }}
            />
            <Label
              htmlFor={todo.id}
              className={cn(
                "flex-1",
                todo.completed && "text-muted-foreground line-through"
              )}
              data-test-id={`todo-title-${todo.id}`}
            >
              {todo.title}
            </Label>
            <Button
              variant="destructive"
              className="hover:cursor-pointer"
              data-test-id={`todo-delete-${todo.id}`}
              onClick={() => deleteTodoMutation.mutate(todo.id)}
            >
              {deleteTodoMutation.isPending ? <Loader2Icon /> : <TrashIcon />}
              {loc.TODOS_DELETE}
            </Button>
          </Item>
        ))}

        {todos?.length === 0 && (
          <Empty data-test-id="todos-empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListIcon />
              </EmptyMedia>
              <EmptyTitle>{loc.TODOS_EMPTY_TITLE}</EmptyTitle>
              <EmptyDescription>{loc.TODOS_EMPTY_DESCRIPTION}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href={`${basePath}/todos/add`} data-test-id="todos-add-link">
                  {loc.TODOS_ADD_LINK}
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>

      {todos && todos.length > 0 && (
        <Button asChild>
          <Link href={`${basePath}/todos/add`} data-test-id="todos-add-link">
            <PlusCircleIcon />
            {loc.TODOS_ADD_BUTTON}
          </Link>
        </Button>
      )}
    </>
  );
}

function TodosListSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: 3 }).map((_, index) => (
        <Item
          key={`todo-skeleton-${index}`}
          className="flex items-center gap-3 border border-border rounded-md p-3 w-full"
        >
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-8 w-24" />
        </Item>
      ))}
    </div>
  );
}

