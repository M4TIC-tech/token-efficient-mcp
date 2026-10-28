import type { DashboardGridSpec } from "@dashboard-kit/core";
import { escapeHtml } from "./html.js";

type ChildSpec = DashboardGridSpec["props"]["children"][number]["spec"];

export function renderDashboardGrid(
  props: DashboardGridSpec["props"],
  fixtures: Record<string, unknown[]>,
  renderSpec: (spec: ChildSpec, fixtures: Record<string, unknown[]>) => string,
): string {
  // CSS applies the configured height and shrinkable tracks only on desktop.
  const heightStyle = props.height
    ? ` --dk-grid-height: ${escapeHtml(props.height.replace(/[\\;{}]/gu, (character) =>
        `\\${character.codePointAt(0)!.toString(16)} `,
      ))};`
    : "";
  const gridClass = props.height ? "dk-grid-container dk-grid-fixed" : "dk-grid-container";
  const children = props.children.map((child) =>
    `<div style="grid-column: span ${escapeHtml(child.span)};">${renderSpec(child.spec, fixtures)}</div>`,
  ).join("");

  return `<div class="${escapeHtml(gridClass)}" style="display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--brand-space-${escapeHtml(props.gap)});${heightStyle}">${children}</div>`;
}
