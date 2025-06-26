import React from "react";
import { Input } from "@/components/ui/input";
import type { Component } from "@/types/lesson";

interface TableEditorProps {
  component: Component;
  updateComponent: (props: Record<string, any>) => void;
}

export function TableEditor({ component, updateComponent }: TableEditorProps) {
  const { rows = 2, columns = 2, data } = component.props || {};
  // Always ensure data is a 2D array of correct size
  const safeData: string[][] = Array.from({ length: rows }).map((_, r) =>
    Array.from({ length: columns }).map((_, c) => (data?.[r]?.[c] ?? ""))
  );

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const newData = safeData.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? value : cell)) : row
    );
    updateComponent({ rows, columns, data: newData });
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = Math.max(1, Math.min(10, Number(e.target.value)));
    let newData = [...safeData];
    while (newData.length < newRows) newData.push(Array(columns).fill(""));
    while (newData.length > newRows) newData.pop();
    updateComponent({ rows: newRows, columns, data: newData });
  };

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCols = Math.max(1, Math.min(10, Number(e.target.value)));
    let newData = safeData.map((row) => {
      let newRow = [...row];
      while (newRow.length < newCols) newRow.push("");
      while (newRow.length > newCols) newRow.pop();
      return newRow;
    });
    updateComponent({ rows, columns: newCols, data: newData });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <label className="block text-xs mb-1">Rows</label>
          <Input type="number" min={1} max={10} value={rows} onChange={handleRowsChange} className="w-16" />
        </div>
        <div>
          <label className="block text-xs mb-1">Columns</label>
          <Input type="number" min={1} max={10} value={columns} onChange={handleColumnsChange} className="w-16" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <tbody>
            {safeData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="border p-1">
                    <Input
                      value={cell}
                      onChange={e => handleCellChange(rowIdx, colIdx, e.target.value)}
                      className="w-24 px-2 py-1 text-xs"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
