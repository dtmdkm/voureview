import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest transition-colors border",
  {
    variants: {
      variant: {
        default: "bg-indigo-50 text-indigo-600 border-indigo-100",
        secondary: "bg-slate-100 text-slate-500 border-slate-200",
        destructive: "bg-red-50 text-red-600 border-red-100",
        success: "bg-emerald-50 text-emerald-600 border-emerald-100",
        outline: "border-slate-200 text-slate-600 bg-transparent",
        warning: "bg-amber-50 text-amber-600 border-amber-100",
        info: "bg-blue-50 text-blue-600 border-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
