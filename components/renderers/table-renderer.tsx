import React from "react";
import type { Component } from "@/types/lesson";

export function TableRenderer({ component }: { component: Component }) {
  if (!component || !component.props) {
    return <div className="text-muted-foreground text-sm">No table data.</div>;
  }
  const { rows = 2, columns = 2, data } = component.props;
  // Always ensure data is a 2D array of correct size
  const safeData: string[][] = Array.from({ length: rows }).map((_, r) =>
    Array.from({ length: columns }).map((_, c) => (data?.[r]?.[c] ?? ""))
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-muted rounded text-sm">
        <tbody>
          {safeData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className="border px-3 py-2 text-left align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
