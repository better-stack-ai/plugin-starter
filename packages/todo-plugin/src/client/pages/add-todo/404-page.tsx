"use client";

import { useBasePath, usePluginOverrides } from "@btst/stack/context";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { FileQuestionIcon } from "lucide-react";
import type { TodosPluginOverrides } from "../../overrides";
import { TODOS_LOCALIZATION } from "../../../localization";

export function NotFoundPage() {
  const { Link, localization } = usePluginOverrides<
    TodosPluginOverrides,
    Partial<TodosPluginOverrides>
  >("todos", {
    localization: TODOS_LOCALIZATION,
  });
  const basePath = useBasePath();
  const loc = { ...TODOS_LOCALIZATION, ...localization };

  return (
    <Empty data-test-id="add-todo-not-found">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{loc.TODOS_NOT_FOUND_TITLE}</EmptyTitle>
        <EmptyDescription>{loc.TODOS_NOT_FOUND_DESCRIPTION}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={`${basePath}/todos`} data-test-id="add-todo-not-found-back">
            {loc.TODOS_NOT_FOUND_BACK}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

