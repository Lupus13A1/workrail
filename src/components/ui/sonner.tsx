import * as React from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:font-sans",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-sans text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-sans group-[.toast]:rounded-full group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-foreground group-[.toast]:font-sans group-[.toast]:rounded-full group-[.toast]:text-xs group-[.toast]:font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
