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
    // note: danger is an optional brand token
    const color = {
      up: "var(--brand-color-accent,#0a7)",
      down: "var(--brand-color-danger, #c33)",
      flat: "var(--brand-color-muted,#666)",
    }[props.trend.direction];

    trend =
      `<div class="dk-trend" style="display:flex;gap:4px;align-items:center;font-size:12px;font-family:var(--brand-font-body,sans-serif);color:${escapeHtml(color)}">` +
      `<span>${escapeHtml(glyph)}</span><span>${escapeHtml(props.trend.value + "%")}</span></div>`;
  }

  const comparison =
    props.comparison !== undefined
      ? `<div style="font-size:11px;color:var(--brand-color-muted,#666);font-family:var(--brand-font-body,sans-serif)">${escapeHtml(props.comparison)}</div>`
      : "";

  return (
    `<div class="dk-metric" style="background:var(--brand-color-surface,#fff);border:1px solid var(--brand-color-border,#ddd);border-radius:var(--brand-radius-md,8px);padding:var(--brand-space-md,16px);display:flex;flex-direction:column;gap:4px">` +
    `<div style="font-size:12px;color:var(--brand-color-muted,#666);font-family:var(--brand-font-body,sans-serif)">${escapeHtml(props.label)}</div>` +
    `<div style="font-size:24px;font-weight:600;color:var(--brand-color-text,#111);font-family:var(--brand-font-heading,sans-serif)">${value}</div>` +
    trend +
    comparison +
    `</div>`
  );
}
