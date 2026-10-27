import type { MetricCardSpec } from "@dashboard-kit/core";
import { escapeHtml, formatValue } from "./html.js";

export function renderMetricCard(props: MetricCardSpec["props"]): string {
  const value =
    props.format === "percent"
      ? escapeHtml(
          `${Number(props.value).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`,
        )
      : formatValue(props.value, props.format);
  let trend = "";

  if (props.trend) {
    const glyph = { up: "▲", down: "▼", flat: "■" }[props.trend.direction];
    const trendClass = {
      up: "dk-trend-up",
      down: "dk-trend-down",
      flat: "dk-trend-flat",
    }[props.trend.direction];

    trend =
      `<div class="dk-trend ${escapeHtml(trendClass)}">` +
      `<span>${escapeHtml(glyph)}</span><span>${escapeHtml(props.trend.value + "%")}</span></div>`;
  }

  const comparison =
    props.comparison !== undefined
      ? `<div class="dk-metric-comparison">${escapeHtml(props.comparison)}</div>`
      : "";

  return (
    `<div class="dk-card dk-metric">` +
    `<div class="dk-metric-label">${escapeHtml(props.label)}</div>` +
    `<div class="dk-metric-value">${value}</div>` +
    trend +
    comparison +
    `</div>`
  );
}
