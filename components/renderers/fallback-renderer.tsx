"use client"

interface FallbackRendererProps {
  type?: string
  isEditing?: boolean
  [key: string]: any
}

export function FallbackRenderer({ type, isEditing, ...props }: FallbackRendererProps) {
  return (
    <div className="relative bg-rose-50 border-4 border-rose-500 rounded-[3rem] p-8 md:p-14 overflow-hidden group/fallback transition-all duration-500">
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />

      <div className="relative text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white text-rose-600 rounded-full border-2 border-rose-200 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Misalignment</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">{type || "Null"} Fragment</h3>
          <p className="text-base font-black text-rose-600/60 tracking-wider uppercase">Technical specification: Synchronization Failed</p>
        </div>

        {isEditing && (
          <div className="mt-8 p-8 bg-white rounded-[2rem] border-4 border-rose-100 text-left relative overflow-hidden group/code">
            <div className="absolute top-0 left-0 w-2 h-full bg-rose-500/20" />
            <pre className="text-xs font-black font-mono text-slate-400 overflow-auto max-h-40 selection:bg-rose-500/10">
              {JSON.stringify(props, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
