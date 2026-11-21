import type { DataTableSpec } from "@m4tic/core";
import { escapeHtml, formatValue } from "./html.js";

const paginationScript = String.raw`<script>
(() => {
  const card = document.currentScript.closest(".dk-table-wrapper");
  const tbody = card.querySelector("tbody");
  const pageSize = Number(card.dataset.pageSize);
  const prev = card.querySelector("[data-page-prev]");
  const next = card.querySelector("[data-page-next]");
  const label = card.querySelector("[data-page-label]");
  let page = 0;
  function showPage() {
    const rows = Array.from(tbody.rows), pages = Math.ceil(rows.length / pageSize);
    page = Math.max(0, Math.min(page, pages - 1));
    rows.forEach((row, index) => {
      row.hidden = index < page * pageSize || index >= (page + 1) * pageSize;
      row.dataset.rowIndex = String(index);
    });
    label.textContent = "Page " + (page + 1) + " of " + pages;
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
  }
  prev.addEventListener("click", () => { page--; showPage(); });
  next.addEventListener("click", () => { page++; showPage(); });
  new MutationObserver(() => { page = 0; showPage(); }).observe(tbody, { childList: true });
  showPage();
})();
</script>`;

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

  const pageSize = props.pageSize ?? rows.length;
  const paginated = Number.isInteger(pageSize) && pageSize > 0 && pageSize < rows.length;
  const columns = props.columns.map((column) => ({
    ...column,
    align: column.align ?? (column.type === "number" || column.type === "currency" ? "right" : "left"),
  }));
  const headers = columns
    .map(
      (column) =>
        `<th class="dk-th dk-text-${escapeHtml(column.align)}" data-sortable="${escapeHtml(column.sortable)}" data-type="${escapeHtml(column.type)}">${escapeHtml(column.label)}</th>`,
    )
    .join("");
  const body = rows
    .map(
      (row, index) =>
        `<tr${paginated ? ` data-row-index="${escapeHtml(index)}"${index >= pageSize ? " hidden" : ""}` : ""}>${columns
          .map(
            (column) =>
              `<td class="dk-td dk-text-${escapeHtml(column.align)}">${formatValue(row[column.key], column.type)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const maxHeight = props.maxHeight === undefined ? "none" : `${props.maxHeight}px`;
  const pagination = paginated
    ? `<nav class="dk-pagination" aria-label="Table pagination">` +
      `<button class="dk-pagination-button" type="button" data-page-prev disabled>Prev</button>` +
      `<span data-page-label aria-live="polite">Page 1 of ${escapeHtml(Math.ceil(rows.length / pageSize))}</span>` +
      `<button class="dk-pagination-button" type="button" data-page-next>Next</button>` +
      `</nav>${paginationScript}`
    : "";
  return (
    `<div class="dk-card dk-table-wrapper"${paginated ? ` data-page-size="${escapeHtml(pageSize)}"` : ""}><div class="dk-table-scroll" style="--dk-table-max-height: ${escapeHtml(maxHeight)};">` +
    `<table class="dk-table"><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table></div>` +
    `${pagination}</div>`
  );
}
