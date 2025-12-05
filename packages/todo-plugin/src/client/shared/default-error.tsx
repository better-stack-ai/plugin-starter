"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

interface DefaultErrorProps {
  error: Error;
  reset?: () => void;
}

export function DefaultError({ error, reset }: DefaultErrorProps) {
  return (
    <Empty data-test-id="todos-error">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircleIcon className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          {error.message || "An unexpected error occurred"}
        </EmptyDescription>
      </EmptyHeader>
      {reset && (
        <EmptyContent>
          <Button onClick={reset} variant="outline">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
