import type { DataTableSpec } from "@dashboard-kit/core";
import { escapeHtml, formatValue } from "./html.js";

export function renderDataTable(
  props: DataTableSpec["props"],
  rows: Record<string, unknown>[],
): string {
  if (rows.length === 0) {
    return `<div class="dk-table dk-empty" style="padding:var(--brand-space-md,16px);color:var(--brand-color-muted,#666)">${escapeHtml(props.emptyState ?? "No data")}</div>`;
  }

  const headers = props.columns
    .map(
      (column) =>
        `<th data-sortable="${escapeHtml(column.sortable)}" style="text-align:${escapeHtml(column.align)};padding:var(--brand-space-sm,8px);border-bottom:1px solid var(--brand-color-border,#ddd);color:var(--brand-color-text,#111);font-family:var(--brand-font-heading,sans-serif);font-weight:600">${escapeHtml(column.label)}</th>`,
    )
    .join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${props.columns
          .map(
            (column) =>
              `<td style="text-align:${escapeHtml(column.align)};padding:var(--brand-space-sm,8px);border-bottom:1px solid var(--brand-color-border,#eee);color:var(--brand-color-text,#111);font-family:var(--brand-font-body,sans-serif)">${formatValue(row[column.key], column.type)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const buttonStyle =
    "border:1px solid var(--brand-color-border,#ddd);background:var(--brand-color-surface,#fff);border-radius:var(--brand-radius-sm,4px);padding:2px 8px";

  return (
    `<div class="dk-table" style="background:var(--brand-color-surface,#fff);border:1px solid var(--brand-color-border,#ddd);border-radius:var(--brand-radius-md,8px);overflow:hidden">` +
    `<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>` +
    `<nav class="dk-pagination" style="display:flex;gap:var(--brand-space-sm,8px);padding:var(--brand-space-sm,8px) 0;align-items:center;color:var(--brand-color-muted,#666);font-family:var(--brand-font-body,sans-serif);font-size:12px">` +
    `<button disabled style="${escapeHtml(buttonStyle)}">Prev</button>` +
    `<span>Page 1 of ${escapeHtml(Math.ceil(rows.length / props.pageSize))}</span>` +
    `<button disabled style="${escapeHtml(buttonStyle)}">Next</button>` +
    `</nav></div>`
  );
}
