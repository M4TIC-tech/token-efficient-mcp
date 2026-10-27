import {
  DataTableSpec,
  MetricCardSpec,
  validateSpec,
  type BrandConfig,
} from "@dashboard-kit/core";
import { resolveDataRef } from "./data-ref.js";
import { renderDataTable } from "./data-table.js";
import { escapeHtml } from "./html.js";
import { renderMetricCard } from "./metric-card.js";
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

  const components = specs
    .map((spec) => {
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
      }

      return content;
    })
    .join("");

  return (
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dashboard Kit Preview</title><style>${styles}</style></head>` +
    `<body><div class="dk-grid">${components}</div></body></html>`
  );
}
