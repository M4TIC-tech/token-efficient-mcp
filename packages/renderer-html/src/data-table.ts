import type { DataTableSpec } from "@dashboard-kit/core";
import { escapeHtml, formatValue } from "./html.js";

export function renderDataTable(
  props: DataTableSpec["props"],
  rows: Record<string, unknown>[],
): string {
  if (rows.length === 0) {
    return (
      `<div class="dk-card dk-empty">` +
      `<svg class="dk-empty-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>` +
      `<br/>${escapeHtml(props.emptyState ?? "No data")}</div>`
    );
  }

  const headers = props.columns
    .map(
      (column) =>
        `<th class="dk-th dk-text-${escapeHtml(column.align)}" data-sortable="${escapeHtml(column.sortable)}" data-type="${escapeHtml(column.type)}">${escapeHtml(column.label)}</th>`,
    )
    .join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${props.columns
          .map(
            (column) =>
              `<td class="dk-td dk-text-${escapeHtml(column.align)}">${formatValue(row[column.key], column.type)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const maxHeight = props.maxHeight === undefined ? "none" : `${props.maxHeight}px`;
  return (
    `<div class="dk-card dk-table-wrapper"><div class="dk-table-scroll" style="max-height: ${escapeHtml(maxHeight)};">` +
    `<table class="dk-table"><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table></div>` +
    `<nav class="dk-pagination" aria-label="Table pagination">` +
    `<button class="dk-pagination-button" disabled>Prev</button>` +
    `<span>Page 1 of ${escapeHtml(Math.ceil(rows.length / props.pageSize))}</span>` +
    `<button class="dk-pagination-button" disabled>Next</button>` +
    `</nav></div>`
  );
}
