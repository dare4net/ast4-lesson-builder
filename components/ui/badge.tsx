import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary"
}

function Badge({
  className,
  variant = "primary",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "duo-badge",
        variant === "primary" && "duo-badge-primary",
        variant === "secondary" && "duo-badge-secondary",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
