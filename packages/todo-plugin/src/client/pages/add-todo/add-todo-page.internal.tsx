"use client";

import { useBasePath, usePluginOverrides } from "@btst/stack/context";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";

import { useCreateTodo } from "../../hooks";
import type { TodosPluginOverrides } from "../../overrides";
import { PageHeader } from "../../shared/page-header";
import { PageWrapper } from "../../shared/page-wrapper";
import { useRouteLifecycle } from "../../shared/use-route-lifecycle";
import { TODOS_LOCALIZATION } from "../../../localization";

// Internal component with actual page content
export function AddTodoPage() {
  const { localization } = usePluginOverrides<
    TodosPluginOverrides,
    Partial<TodosPluginOverrides>
  >("todos", {
    localization: TODOS_LOCALIZATION,
  });
  const basePath = useBasePath();
  const { navigate, Link } = usePluginOverrides<TodosPluginOverrides>("todos");
  const loc = { ...TODOS_LOCALIZATION, ...localization };

  // Call lifecycle hooks
  useRouteLifecycle({
    routeName: "addTodo",
    context: {
      path: "/todos/add",
      isSSR: typeof window === "undefined",
    },
    beforeRenderHook: (overrides, context) => {
      if (overrides.onBeforeAddTodoPageRendered) {
        return overrides.onBeforeAddTodoPageRendered(context);
      }
      return true;
    },
  });

  const createTodoMutation = useCreateTodo();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;

    try {
      await createTodoMutation.mutateAsync({ title });
      toast.success(loc.TODOS_ADD_SUCCESS);
      // Navigate to list after success
      if (navigate) {
        navigate(`${basePath}/todos`);
      }
    } catch (error) {
      toast.error(loc.TODOS_ADD_ERROR);
      console.error(error);
    }

    form.reset();
  };

  return (
    <PageWrapper className="gap-6" testId="add-todo-page">
      <PageHeader title={loc.TODOS_ADD_TITLE} description={loc.TODOS_ADD_DESCRIPTION} titleTestId="add-todo-title" />

      <form onSubmit={handleSubmit} className="space-y-4 w-full" data-test-id="add-todo-form">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">{loc.TODOS_FORM_TITLE_LABEL}</FieldLabel>
            <Input
              id="title"
              type="text"
              name="title"
              placeholder={loc.TODOS_FORM_TITLE_PLACEHOLDER}
              required
              data-test-id="add-todo-title-input"
            />
          </Field>
        </FieldGroup>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="hover:cursor-pointer"
            disabled={createTodoMutation.isPending}
            data-test-id="add-todo-submit"
          >
            {createTodoMutation.isPending ? loc.TODOS_FORM_SAVING : loc.TODOS_FORM_SAVE}
          </Button>

          <Button variant="outline" asChild>
            <Link href={`${basePath}/todos`} data-test-id="add-todo-cancel">
              {loc.TODOS_FORM_CANCEL}
            </Link>
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}

