"use client"

interface FallbackRendererProps {
  type?: string
  isEditing?: boolean
  [key: string]: any
}

export function FallbackRenderer({ type, isEditing, ...props }: FallbackRendererProps) {
  return (
    <div className="p-4 border border-dashed rounded-md bg-muted/50">
      <div className="text-center text-muted-foreground">
        <p className="font-medium">{type || "Unknown"} Component</p>
        <p className="text-sm">This component type is not yet implemented</p>
        {isEditing && (
          <pre className="mt-2 text-xs text-left bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(props, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
