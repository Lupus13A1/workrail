import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.Group>) => (
  <ResizablePrimitive.Group
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.Separator
    aria-label={ariaLabel || "Resize pane — use arrow keys to adjust width"}
    className={cn(
      "group/handle relative flex w-px items-center justify-center bg-border transition-colors hover:bg-brand/50 data-[resize-handle-state=drag]:bg-brand after:absolute after:inset-y-0 after:left-1/2 after:w-6 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-6 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:bg-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-8 w-4 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs transition-colors group-hover/handle:border-brand/50 group-hover/handle:text-foreground group-focus-visible/handle:border-brand group-focus-visible/handle:text-brand">
        <GripVertical className="h-3.5 w-3.5" />
      </div>
    )}
  </ResizablePrimitive.Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
