"use client";

import { useMemo, useState } from "react";
import { FieldHelp } from "@/components/forms/FieldHelp";
import { Toggle } from "@/components/ui/Toggle";
import {
  permissionActionColumns,
  type MatrixRow,
} from "@/lib/auth/permission-matrix";

export function PermissionMatrix({
  rows,
  initialSelected,
}: {
  rows: MatrixRow[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState(() => new Set(initialSelected));

  const allKeys = useMemo(
    () =>
      rows.flatMap((row) =>
        Object.values(row.cells)
          .filter(Boolean)
          .map((cell) => cell!.key),
      ),
    [rows],
  );

  function setKey(key: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleFull(row: MatrixRow, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const cell of Object.values(row.cells)) {
        if (!cell?.grantable) continue;
        if (on) next.add(cell.key);
        else next.delete(cell.key);
      }
      return next;
    });
  }

  function rowFullState(row: MatrixRow) {
    const grantable = Object.values(row.cells).filter(
      (cell): cell is NonNullable<typeof cell> => Boolean(cell?.grantable),
    );
    if (grantable.length === 0) return { checked: false, disabled: true };
    return {
      checked: grantable.every((cell) => selected.has(cell.key)),
      disabled: false,
    };
  }

  return (
    <>
      {allKeys.map((key) =>
        selected.has(key) ? (
          <input key={key} type="hidden" name="permissions" value={key} />
        ) : null,
      )}

      <div className="max-h-[min(28rem,65vh)] overflow-auto">
        <table className="w-full min-w-[26rem] table-fixed border-collapse text-[13px]">
          <colgroup>
            <col className="w-[40%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-line">
              <th
                scope="col"
                className="sticky left-0 z-20 bg-white px-3 py-2 text-left text-xs font-semibold text-navy sm:px-4"
              >
                <span className="inline-flex items-center gap-1.5">
                  Permissions
                  <FieldHelp label="Permissions" help="permission.matrix" />
                </span>
              </th>
              {permissionActionColumns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="px-1.5 py-2 text-center text-xs font-semibold text-navy"
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    {column.label}
                    <FieldHelp
                      label={column.label}
                      help={`permission.${column.id}`}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const full = rowFullState(row);
              return (
                <tr
                  key={row.label}
                  className="border-b border-line last:border-b-0"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-[1] bg-white px-3 py-2 text-left text-[13px] font-normal text-navy sm:px-4"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {row.label}
                      <FieldHelp label={row.label} help="permission.matrix" />
                    </span>
                  </th>

                  <td className="px-1.5 py-2 text-center align-middle">
                    <div className="flex justify-center">
                      <Toggle
                        label={`${row.label} full access`}
                        checked={full.checked}
                        disabled={full.disabled}
                        onChange={(on) => toggleFull(row, on)}
                      />
                    </div>
                  </td>

                  {(["view", "manage"] as const).map((action) => {
                    const cell = row.cells[action];
                    return (
                      <td
                        key={action}
                        className="px-1.5 py-2 text-center align-middle"
                      >
                        {cell ? (
                          <div className="flex justify-center">
                            <Toggle
                              label={`${row.label} ${action}`}
                              checked={selected.has(cell.key)}
                              disabled={!cell.grantable}
                              onChange={(on) => setKey(cell.key, on)}
                            />
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
