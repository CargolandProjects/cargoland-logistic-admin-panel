import { Construction } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

/** Placeholder for nav destinations that don't have a design yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Construction className="size-6" />
        </span>
        <div>
          <p className="font-semibold text-foreground">{title} is coming soon</p>
          <p className="text-sm text-muted-foreground">
            This section is scaffolded and ready — the screen will be built once its design is available.
          </p>
        </div>
      </Card>
    </div>
  );
}
