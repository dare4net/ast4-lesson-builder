import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Component } from "@/types/lesson";

export function TableRenderer({
  component,
  savedState,
  setComponentState,
  isEditing = false
}: {
  component: Component,
  savedState?: any,
  setComponentState?: (state: any) => void,
  isEditing?: boolean
}) {
  if (!component || !component.props) {
    return <div className="text-muted-foreground text-sm">No table data.</div>;
  }

  const isAcknowledged = savedState?.status === "completed"

  const handleAcknowledge = () => {
    if (setComponentState) {
      setComponentState({ status: "completed" })
    }
  }

  const { rows = 2, columns = 2, data } = component.props;
  // Always ensure data is a 2D array of correct size
  const safeData: string[][] = Array.from({ length: rows }).map((_, r) =>
    Array.from({ length: columns }).map((_, c) => (data?.[r]?.[c] ?? ""))
  );

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col bg-white px-6">
      {/* TOP SECTION: Meta */}
      <div className="shrink-0 pt-2 pb-2">
        <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Reference Data</span>
        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">Summary Table</h3>
      </div>

      {/* CENTER SECTION: Table Content */}
      <div className="flex-1 flex flex-col justify-center py-6">
        <div className={cn(
          "border-2 border-slate-100 rounded-2xl overflow-hidden transition-all duration-700 shadow-sm",
          !isAcknowledged && "blur-[3px] opacity-20 scale-[0.98]"
        )}>
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

      {/* BOTTOM SECTION: Feedback & Buttons */}
      <div className="shrink-0 space-y-4 pb-6">
        <div className="min-h-[60px] flex flex-col justify-end">
          {!isAcknowledged && !isEditing && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">New Content Available</span>
            </div>
          )}
          {isAcknowledged && !isEditing && (
            <div className="p-6 rounded-2xl border-2 bg-emerald-50/50 border-emerald-500/20 animate-in slide-in-from-top-2 duration-500 shadow-emerald-500/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Content Reviewed</span>
              </div>
              <p className="text-sm font-black text-slate-900 mt-1 italic">Review finished.</p>
            </div>
          )}
        </div>

        <div className="w-full">
          {!isAcknowledged && !isEditing && (
            <Button
              onClick={handleAcknowledge}
              className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
            >
              Mark as Reviewed
            </Button>
          )}
          {isAcknowledged && !isEditing && (
            <Button
              className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-100 shadow-lg shadow-emerald-500/20"
              disabled
            >
              Completed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
