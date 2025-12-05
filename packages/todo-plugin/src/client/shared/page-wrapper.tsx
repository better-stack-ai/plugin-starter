"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export function PageWrapper({ children, className, testId }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-2xl p-6 flex flex-col items-center justify-center",
        className
      )}
      data-test-id={testId}
    >
      {children}
    </div>
  );
}

