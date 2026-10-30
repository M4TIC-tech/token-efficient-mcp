import {
  DataTableSpec,
  MetricCardSpec,
  ChartCardSpec,
  DashboardGridSpec,
  validateSpec,
  type BrandConfig,
} from "@m4tic/core";
import { resolveDataRef } from "./data-ref.js";
import { renderDataTable } from "./data-table.js";
import { escapeHtml } from "./html.js";
import { renderMetricCard } from "./metric-card.js";
import { renderChartCard } from "./chart-card.js";
import { renderDashboardGrid } from "./dashboard-grid.js";
import { sortingScript } from "./scripts.js";
import { stylesheet } from "./styles.js";

function cssKey(value: string): string {
  return escapeHtml(
    value.replace(/[^a-zA-Z0-9_-]/gu, (character) =>
      `\\${character.codePointAt(0)!.toString(16)} `,
    ),
  );
}

function cssValue(value: string): string {
  return escapeHtml(
    value.replace(/[<>&"'\\;{}\u0000-\u001f\u007f]/gu, (character) =>
      `\\${character.codePointAt(0)!.toString(16)} `,
    ),
  );
}

function fontValue(value: string): string {
  const fontList =
    value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
  const escaped = escapeHtml(
    fontList.replace(/[<>&;{}\u0000-\u001f\u007f]/gu, (character) =>
      `\\${character.codePointAt(0)!.toString(16)} `,
    ),
  );

  // Quotes delimit individual CSS font names inside a style block.
  return escaped.replace(/&quot;/g, '"');
}

export function renderShell(
  specs: unknown[],
  brand: BrandConfig,
  fixtures: Record<string, unknown[]>,
): string {
  const validation = validateSpec(specs, brand);

  if (!validation.ok) {
    return `<!doctype html><html><body><pre>${escapeHtml(validation.errors.join("\n"))}</pre></body></html>`;
  }

  const variables = [
    ...Object.entries(brand.colors ?? {}).flatMap(
      ([key, value]) => value === undefined
        ? []
        : [`--brand-color-${cssKey(key)}:${cssValue(value)};`],
    ),
    ...Object.entries(brand.fonts ?? {}).flatMap(
      ([key, value]) => value === undefined
        ? []
        : [`--brand-font-${cssKey(key)}:${fontValue(value)};`],
    ),
    ...Object.entries(brand.spacing ?? {}).map(
      ([key, value]) => `--brand-space-${cssKey(key)}:${cssValue(value)};`,
    ),
    ...Object.entries(brand.radius ?? {}).map(
      ([key, value]) => `--brand-radius-${cssKey(key)}:${cssValue(value)};`,
    ),
    ...Object.entries(brand.shadows ?? {}).map(
      ([key, value]) => `--brand-shadow-${cssKey(key)}:${cssValue(value)};`,
    ),
  ].join("");
  const styles = `:root{${variables}}${stylesheet}`;

  function renderComponent(spec: unknown, fixtures: Record<string, unknown[]>): string {
    const component =
      typeof spec === "object" && spec !== null && "props" in spec
        ? "component" in spec
          ? spec.component
          : undefined
        : "<invalid spec>";
    let content = `<div class="dk-unknown">Unknown component: ${escapeHtml(component)}</div>`;

    if (component === "DataTable") {
      const { props } = DataTableSpec.parse(spec);
      content = renderDataTable(props, resolveDataRef(props.dataRef, fixtures));
    } else if (component === "MetricCard") {
      const { props } = MetricCardSpec.parse(spec);
      content = renderMetricCard(props);
    } else if (component === "ChartCard") {
      const { props } = ChartCardSpec.parse(spec);
      content = renderChartCard(props);
    }

    return content;
  }

  const components = specs
    .map((spec) => {
      if (typeof spec === "object" && spec !== null && "component" in spec &&
          spec.component === "DashboardGrid") {
        const { props } = DashboardGridSpec.parse(spec);
        return renderDashboardGrid(props, fixtures, renderComponent);
      }

      const component = typeof spec === "object" && spec !== null && "component" in spec
        ? spec.component
        : undefined;
      const itemClass = component === "DataTable" || component === "ChartCard"
        ? "dk-item dk-item-panel"
        : "dk-item";
      return `<div class="${escapeHtml(itemClass)}">${renderComponent(spec, fixtures)}</div>`;
    })
    .join("");

  return (
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dashboard Kit Preview</title><style>${styles}</style></head>` +
    `<body><main class="dk-grid dk-shell">${components}</main><script>${sortingScript}</script></body></html>`
  );
}
