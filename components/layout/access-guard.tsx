"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/lib/query/hooks/use-access";
import { pageKeyForPath } from "@/types/permissions";

/**
 * Gates the current route by the effective role. When blocked it renders ONLY a
 * non-dismissible popup (not the page), so the gated page's data hooks never
 * mount. Fails open while loading and always allows the dashboard (no lockout).
 */
export function AccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, can } = useAccess();

  const blocked = ready && !can(pageKeyForPath(pathname));

  if (blocked) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>You do not have access to this screen</DialogTitle>
            <DialogDescription>
              Your role doesn&apos;t have permission to view this page. Contact a Super
              Admin if you believe you need access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-brand-red text-white"
              onClick={() => router.replace("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
}
