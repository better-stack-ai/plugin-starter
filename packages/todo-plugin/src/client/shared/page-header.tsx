"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  titleTestId?: string;
}

export function PageHeader({ title, description, titleTestId }: PageHeaderProps) {
  return (
    <div className="mb-6 text-center">
      <h1 className="font-bold text-3xl" data-test-id={titleTestId || "page-title"}>
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-2" data-test-id="page-description">
          {description}
        </p>
      )}
    </div>
  );
}

