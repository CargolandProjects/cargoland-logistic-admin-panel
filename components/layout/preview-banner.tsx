"use client";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAccess } from "@/lib/query/hooks/use-access";
import { useAccessStore } from "@/stores/access-store";
import { ROLE_LABELS } from "@/types/auth";

/** Amber strip shown while previewing the app as another role (session-only). */
export function PreviewBanner() {
  const { isPreview, effectiveRole } = useAccess();
  const clearPreviewRole = useAccessStore((s) => s.clearPreviewRole);

  if (!isPreview || !effectiveRole) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-100 px-6 py-2 text-sm text-amber-900">
      <span className="inline-flex items-center gap-2">
        <Eye className="size-4 shrink-0" />
        Previewing as <strong>{ROLE_LABELS[effectiveRole] ?? effectiveRole}</strong> —
        access is limited to this role.
      </span>
      <Button size="sm" variant="outline" onClick={clearPreviewRole}>
        Exit preview
      </Button>
    </div>
  );
}
