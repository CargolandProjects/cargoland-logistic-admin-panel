import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { readApiError } from "@/lib/api/client";

/**
 * Map a backend error onto react-hook-form fields and return a banner message
 * for the form. Field-level errors (`{ errors: [{ field, message }] }`) are
 * attached to the matching inputs; the top-level message is returned.
 */
export function applyApiFormErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fallback = "Something went wrong. Please try again.",
): string {
  const body = readApiError(err);
  if (!body) return fallback;

  if (body.errors && body.errors.length > 0) {
    for (const e of body.errors) {
      if (e.field) {
        setError(e.field as Path<T>, { type: "server", message: e.message });
      }
    }
    return body.message || "Please correct the highlighted fields.";
  }

  return body.message || fallback;
}

/** Show a toast for a non-form error surface (lists, actions, etc.). */
export function toastApiError(err: unknown, fallback = "Something went wrong.") {
  const body = readApiError(err);
  if (body?.errors?.length) {
    toast.error(body.errors[0].message);
    return;
  }
  if (body?.message) {
    toast.error(body.message);
    return;
  }
  toast.error(fallback);
}
