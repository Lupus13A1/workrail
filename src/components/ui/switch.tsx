import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "group peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-foreground/75 p-0.5 transition-colors duration-150 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:border-foreground/55 disabled:data-[state=unchecked]:bg-muted",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none flex h-4 w-4 items-center justify-center rounded-full shadow-xs transition-transform duration-150 data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-foreground/80 data-[state=unchecked]:text-background group-disabled:data-[state=unchecked]:bg-foreground/65",
      )}
    >
      <Check
        aria-hidden="true"
        className="hidden h-2.5 w-2.5 stroke-[3] group-data-[state=checked]:block"
      />
      <Minus
        aria-hidden="true"
        className="hidden h-2.5 w-2.5 stroke-[3] group-data-[state=unchecked]:block"
      />
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
