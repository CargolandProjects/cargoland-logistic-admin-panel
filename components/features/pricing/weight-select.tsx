"use client";

import { useState, type FocusEvent, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Common shipping weight breakpoints (kg). "Custom…" swaps in a free number input.
const PRESETS = [0, 1, 2, 5, 10, 20, 30, 50, 100, 200, 500, 1000];
const CUSTOM = "__custom__";

/**
 * A kg picker: a preset dropdown plus a "Custom…" escape hatch to a number
 * input. Always yields a number via `onChange`. An open-topped bracket is just
 * a deliberately large number — there is no "unlimited".
 */
export function WeightSelect({
  value,
  onChange,
  placeholder = "Weight",
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [custom, setCustom] = useState(
    () => Number.isFinite(value) && !PRESETS.includes(value),
  );

  const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => e.currentTarget.select();
  const blockNegativeKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  if (custom) {
    return (
      <Input
        type="number"
        step="any"
        min={0}
        aria-label={ariaLabel}
        onFocus={selectOnFocus}
        onKeyDown={blockNegativeKeys}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="h-8 w-full border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0"
        placeholder={placeholder}
      />
    );
  }

  return (
    <Select
      value={PRESETS.includes(value) ? String(value) : ""}
      onValueChange={(v) => {
        if (v === CUSTOM) {
          setCustom(true);
          return;
        }
        onChange(Number(v));
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "h-8 w-full border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0",
        )}
      >
        <SelectValue>{(v) => (v ? `${v as string} kg` : placeholder)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PRESETS.map((p) => (
          <SelectItem key={p} value={String(p)}>
            {p} kg
          </SelectItem>
        ))}
        <SelectItem value={CUSTOM}>Custom…</SelectItem>
      </SelectContent>
    </Select>
  );
}
