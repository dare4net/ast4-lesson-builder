"use client"

interface FallbackRendererProps {
  type?: string
  isEditing?: boolean
  [key: string]: any
}

export function FallbackRenderer({ type, isEditing, ...props }: FallbackRendererProps) {
  return (
    <div className="relative bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 md:p-10 overflow-hidden">
      <div className="relative text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">This activity isn’t available</h3>
        <p className="text-sm text-slate-600">
          {type
            ? `“${type}” can’t be shown in this lesson right now.`
            : "This part of the lesson can’t be shown right now."}
        </p>

        {isEditing && (
          <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 text-left">
            <pre className="text-xs font-mono text-slate-500 overflow-auto max-h-40">
              {JSON.stringify(props, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
