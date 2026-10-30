import type { DashboardGridSpec } from "@m4tic/core";
import { escapeHtml } from "./html.js";

type ChildSpec = DashboardGridSpec["props"]["children"][number]["spec"];

function cssValue(value: string): string {
  return escapeHtml(value.replace(/[\\;{}]/gu, (character) =>
    `\\${character.codePointAt(0)!.toString(16)} `,
  ));
}

function automaticRows(children: DashboardGridSpec["props"]["children"]): string {
  const metricRows: boolean[] = [];
  let usedColumns = 0;

  // Follow the row cursor of CSS grid's normal (non-dense) auto-placement.
  for (const child of children) {
    if (usedColumns === 0 || usedColumns + child.span > 12) {
      metricRows.push(true);
      usedColumns = 0;
    }
    if (child.spec.component !== "MetricCard") metricRows[metricRows.length - 1] = false;
    usedColumns = (usedColumns + child.span) % 12;
  }

  // Zero track minimums let panel scroll regions shrink instead of growing the page.
  return metricRows.map((onlyMetrics, index) =>
    index === 0 && metricRows.length > 1 && onlyMetrics ? "auto" : "minmax(0, 1fr)",
  ).join(" ");
}

export function renderDashboardGrid(
  props: DashboardGridSpec["props"],
  fixtures: Record<string, unknown[]>,
  renderSpec: (spec: ChildSpec, fixtures: Record<string, unknown[]>) => string,
): string {
  // Safety net for agent over-specification: KPI cards never occupy more than 4 columns.
  // Pack rows using the same effective spans that CSS will receive.
  const items = props.children.map((child) => ({
    ...child,
    span: child.spec.component === "MetricCard" ? Math.min(child.span, 4) : child.span,
  }));
  // A legacy height is a shrinkable preference, never a viewport-breaking minimum.
  const heightStyle = props.height
    ? ` --dk-grid-height: ${cssValue(props.height)};`
    : "";
  const rowsStyle = ` grid-template-rows: ${cssValue(props.rows || automaticRows(items))};`;
  const children = items.map((child) => {
    const isMetric = child.spec.component === "MetricCard";
    const childClass = isMetric ? "dk-grid-item dk-grid-item-metric" : "dk-grid-item";
    const alignment = isMetric ? " justify-self: stretch;" : "";
    return `<div class="${escapeHtml(childClass)}" style="grid-column: span ${escapeHtml(child.span)};${alignment}">${renderSpec(child.spec, fixtures)}</div>`;
  }).join("");

  return `<div class="dk-grid-container" style="display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--brand-space-${escapeHtml(props.gap)});${heightStyle}${rowsStyle}">${children}</div>`;
}
