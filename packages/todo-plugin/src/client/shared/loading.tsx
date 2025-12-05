"use client";

import { Item } from "@workspace/ui/components/item";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Loader2Icon } from "lucide-react";

export function PageLoading() {
  return (
    <div
      className="mx-auto max-w-2xl p-6 flex flex-col gap-6 items-center justify-center"
      data-test-id="todos-page-loading"
    >
      <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function TodosListLoading() {
  return (
    <div
      className="mx-auto max-w-2xl p-6 flex flex-col gap-6 items-center justify-center"
      data-test-id="todos-list-loading"
    >
      <Skeleton className="h-9 w-32" />
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
    </div>
  );
}

export function FormLoading() {
  return (
    <div
      className="mx-auto max-w-2xl p-6 flex flex-col gap-6"
      data-test-id="todos-form-loading"
    >
      <Skeleton className="h-9 w-40" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}

