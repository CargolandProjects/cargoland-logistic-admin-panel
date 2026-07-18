import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PreviewBanner } from "@/components/layout/preview-banner";
import { AccessGuard } from "@/components/layout/access-guard";

/**
 * Admin shell shared by every authenticated page. New pages added under
 * `(app)/` automatically get the sidebar + topbar — no wiring needed.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <PreviewBanner />
        <main className="flex-1 p-6">
          <AccessGuard>{children}</AccessGuard>
        </main>
      </div>
    </div>
  );
}
