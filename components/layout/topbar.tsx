"use client";

import { Search, Bell } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Sticky top bar: global search + notifications. Present on every app page. */
export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
      <div className="relative w-full max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search…"
          className="h-10 w-full rounded-full bg-card pl-9"
          aria-label="Search"
        />
      </div>
      <div className="ml-auto">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Button>
      </div>
    </header>
  );
}
