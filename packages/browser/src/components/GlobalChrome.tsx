"use client";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { EventBridge } from "@/components/EventBridge";

export function GlobalChrome() {
  return (
    <>
      <EventBridge />
      <CommandPalette />
    </>
  );
}
