import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sv-azure focus-visible:ring-offset-2 focus-visible:ring-offset-sv-navy disabled:pointer-events-none",
    {
        variants: {
            variant: {
                default: "sv-btn-primary",
                gold: "sv-btn-gold",
                outline: "sv-btn-secondary",
                ghost: "sv-btn-ghost",
                destructive: "sv-btn-danger",
            },
            size: {
                default: "h-11 px-6 py-2",
                lg: "h-14 px-8 text-base",
                sm: "h-9 px-4 text-xs",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
