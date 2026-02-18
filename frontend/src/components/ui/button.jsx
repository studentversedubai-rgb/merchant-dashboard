import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-sv-purple text-white hover:bg-sv-purple-dark focus-visible:ring-sv-purple",
                gold:
                    "bg-sv-gold text-white hover:bg-sv-gold-dark focus-visible:ring-sv-gold",
                outline:
                    "border-2 border-sv-purple text-sv-purple bg-white hover:bg-sv-purple hover:text-white",
                ghost:
                    "text-gray-600 hover:bg-gray-100",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600",
            },
            size: {
                default: "h-11 px-6 py-2",
                lg: "h-14 px-8 text-base rounded-xl",
                sm: "h-9 px-4",
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
