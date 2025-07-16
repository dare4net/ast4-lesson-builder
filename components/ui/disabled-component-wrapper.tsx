"use client"

import { cn } from "@/lib/utils"

interface DisabledComponentWrapperProps {
  isDisabled: boolean;
  children: React.ReactNode;
  className?: string;
}

export function DisabledComponentWrapper({
  isDisabled,
  children,
  className,
}: DisabledComponentWrapperProps) {
  if (!isDisabled) return <>{children}</>;

  return (
    <div className={cn(
      "relative",
      "disabled-component",
      className
    )}>
      {children}
    </div>
  );
}
