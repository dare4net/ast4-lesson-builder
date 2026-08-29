import React from "react";
import { Input } from "@/components/ui/input";
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor";
import type { Component } from "@/types/lesson";

interface TableEditorProps {
  component: Component;
  updateComponent: (props: Record<string, any>) => void;
}

export function TableEditor({ component, updateComponent }: TableEditorProps) {
  const { title = "Summary Table", rows = 2, columns = 2, data } = component.props || {};
  // Always ensure data is a 2D array of correct size
  const safeData: string[][] = Array.from({ length: rows }).map((_, r) =>
    Array.from({ length: columns }).map((_, c) => (data?.[r]?.[c] ?? ""))
  );

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const newData = safeData.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? value : cell)) : row
    );
    updateComponent({ title, rows, columns, data: newData });
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = Math.max(1, Math.min(10, Number(e.target.value)));
    const newData = [...safeData];
    while (newData.length < newRows) newData.push(Array(columns).fill(""));
    while (newData.length > newRows) newData.pop();
    updateComponent({ title, rows: newRows, columns, data: newData });
  };

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCols = Math.max(1, Math.min(10, Number(e.target.value)));
    const newData = safeData.map((row) => {
      const newRow = [...row];
      while (newRow.length < newCols) newRow.push("");
      while (newRow.length > newCols) newRow.pop();
      return newRow;
    });
    updateComponent({ title, rows, columns: newCols, data: newData });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Table Title</label>
        <WYSIWYGInput
          value={title}
          onChange={val => updateComponent({ title: val })}
          placeholder="Enter table title..."
        />
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">Rows</label>
          <Input type="number" min={1} max={10} value={rows} onChange={handleRowsChange} className="w-20" />
        </div>
        <div>
          <label className="block text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">Columns</label>
          <Input type="number" min={1} max={10} value={columns} onChange={handleColumnsChange} className="w-20" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <tbody>
            {safeData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="border p-1 min-w-[120px]">
                    <WYSIWYGInput
                      value={cell}
                      onChange={val => handleCellChange(rowIdx, colIdx, val)}
                      placeholder={`Cell ${rowIdx + 1}-${colIdx + 1}`}
                      className="text-xs"
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
