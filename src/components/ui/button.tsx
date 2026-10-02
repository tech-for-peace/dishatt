import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Square outlined control beside the results heading (back, sort).
        chip: "h-9 gap-1.5 rounded-none border border-border/60 bg-card/80 px-3 text-foreground/80 hover:border-border hover:text-foreground",
        // White chip floating on the hero gradient (language, theme).
        header:
          "h-5 gap-1 border border-gray-300 bg-white px-1 text-gray-800 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl md:h-10 md:px-3",
      },
    },
    defaultVariants: {
      variant: "chip",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";

export { Button };
