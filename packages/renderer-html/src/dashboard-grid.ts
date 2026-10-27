import type { DashboardGridSpec } from "@dashboard-kit/core";
import { escapeHtml } from "./html.js";

type ChildSpec = DashboardGridSpec["props"]["children"][number]["spec"];

export function renderDashboardGrid(
  props: DashboardGridSpec["props"],
  fixtures: Record<string, unknown[]>,
  renderSpec: (spec: ChildSpec, fixtures: Record<string, unknown[]>) => string,
): string {
  const children = props.children.map((child) =>
    `<div style="grid-column: span ${escapeHtml(child.span)};">${renderSpec(child.spec, fixtures)}</div>`,
  ).join("");

  return `<div class="dk-grid-container" style="display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--brand-space-${escapeHtml(props.gap)});">${children}</div>`;
}
