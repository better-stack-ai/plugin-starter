/**
 * Default localization strings for the Todos plugin
 * These can be overridden via plugin overrides
 */
export const TODOS_LOCALIZATION = {
  // Page titles
  TODOS_LIST_TITLE: "Todos",
  TODOS_LIST_DESCRIPTION: "Manage your tasks",
  TODOS_ADD_TITLE: "Add Todo",
  TODOS_ADD_DESCRIPTION: "Create a new todo item",
  
  // List page
  TODOS_EMPTY_TITLE: "No Todos",
  TODOS_EMPTY_DESCRIPTION: "No todos found",
  TODOS_ADD_LINK: "Add a todo",
  TODOS_ADD_BUTTON: "Add Todo",
  
  // Form
  TODOS_FORM_TITLE_LABEL: "Title",
  TODOS_FORM_TITLE_PLACEHOLDER: "Buy groceries",
  TODOS_FORM_SAVE: "Save",
  TODOS_FORM_SAVING: "Saving...",
  TODOS_FORM_CANCEL: "Cancel",
  
  // Actions
  TODOS_DELETE: "Delete",
  TODOS_TOGGLE_SUCCESS: "Todo has been toggled",
  TODOS_TOGGLE_ERROR: "Error toggling todo",
  TODOS_DELETE_SUCCESS: "Todo has been deleted",
  TODOS_DELETE_ERROR: "Error deleting todo",
  TODOS_ADD_SUCCESS: "Todo has been added",
  TODOS_ADD_ERROR: "Error adding todo",
  
  // Errors
  TODOS_ERROR_TITLE: "Something went wrong",
  TODOS_ERROR_TRY_AGAIN: "Try again",
  TODOS_NOT_FOUND_TITLE: "Page Not Found",
  TODOS_NOT_FOUND_DESCRIPTION: "The page you're looking for doesn't exist",
  TODOS_NOT_FOUND_BACK: "Go back to Todos",
} as const;

export type TodosLocalization = typeof TODOS_LOCALIZATION;

