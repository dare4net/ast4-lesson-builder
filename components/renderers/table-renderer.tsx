import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Component } from "@/types/lesson";

interface TableRendererProps {
  title?: string
  rows?: number
  columns?: number
  data?: string[][]
  component?: Component
  savedState?: any
  setComponentState?: (state: any) => void
  isEditing?: boolean
}

export function TableRenderer(props: TableRendererProps) {
  const {
    savedState,
    setComponentState,
    isEditing = false
  } = props

  // Support both direct props from ComponentRenderer and nested component.props
  const rawProps = props.component?.props || props
  const title = rawProps.title || "Summary Table"
  const rows = Number(rawProps.rows) || 2
  const columns = Number(rawProps.columns) || 2
  const rawData = rawProps.data

  const isAcknowledged = savedState?.status === "completed"

  const handleAcknowledge = () => {
    if (setComponentState) {
      setComponentState({ status: "completed" })
    }
  }

  // Always ensure data is a 2D array of correct size
  const safeData: string[][] = Array.from({ length: rows }).map((_, r) =>
    Array.from({ length: columns }).map((_, c) => (rawData?.[r]?.[c] ?? `Cell ${r + 1}-${c + 1}`))
  )

  return (
    <div className="w-full h-full min-h-[350px] flex flex-col bg-white px-6">
      {/* TOP SECTION: Meta */}
      <div className="shrink-0 pt-2 pb-2">
        <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Reference Data</span>
        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
      </div>

      {/* CENTER SECTION: Table Content */}
      <div className="flex-1 flex flex-col justify-center py-4">
        <div className="border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <tbody className="divide-y divide-emerald-50">
              {safeData.map((row, rowIdx) => (
                <tr key={rowIdx} className={cn(
                  "group/row transition-all duration-300",
                  rowIdx === 0 ? "" : "hover:bg-emerald-50/50"
                )}>
                  {row.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "px-4 py-3 text-left align-middle transition-all duration-300",
                        rowIdx === 0
                          ? "text-[8px] font-black text-white uppercase tracking-[0.2em] bg-slate-900 border-l border-white/5"
                          : "text-slate-900 text-sm font-bold tracking-tight bg-white group-hover/row:bg-emerald-50/50"
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
