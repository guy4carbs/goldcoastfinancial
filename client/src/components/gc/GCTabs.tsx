import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

/**
 * GC-tokened tabs. Visual contract:
 *  - List: GC surface card (radius-md, border, padding-1).
 *  - Trigger inactive: muted text, transparent.
 *  - Trigger active: surface-2 background, primary text, gold underline accent.
 *
 * API mirrors shadcn — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` —
 * so existing call sites can swap imports without other changes.
 */

export const GCTabs = TabsPrimitive.Root;

export const GCTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className = "", style, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`gc-tabs-list inline-flex items-center gap-1 ${className}`.trim()}
    style={{
      backgroundColor: "var(--gc-surface)",
      border: "1px solid var(--gc-border)",
      borderRadius: "var(--gc-radius-md)",
      padding: 4,
      fontFamily: "var(--gc-font-body)",
      ...style,
    }}
    {...props}
  />
));
GCTabsList.displayName = "GCTabsList";

export const GCTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className = "", style, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={
      `gc-tab-trigger inline-flex items-center gap-2 whitespace-nowrap font-medium transition-colors ` +
      `disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none ` +
      `data-[state=active]:!bg-[var(--gc-surface-2)] data-[state=active]:!text-[var(--gc-text-primary)] ` +
      `text-[var(--gc-text-muted)] hover:text-[var(--gc-text-primary)] ` +
      className
    }
    style={{
      padding: "6px 14px",
      borderRadius: "var(--gc-radius-sm)",
      fontSize: "var(--gc-text-sm)",
      backgroundColor: "transparent",
      ...style,
    }}
    {...props}
  />
));
GCTabsTrigger.displayName = "GCTabsTrigger";

export const GCTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = "", ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`mt-4 focus-visible:outline-none ${className}`.trim()}
    {...props}
  />
));
GCTabsContent.displayName = "GCTabsContent";
