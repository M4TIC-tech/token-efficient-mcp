import type { DonutChartSpec } from "@m4tic/core";
import { escapeHtml, formatValue } from "./html.js";

export function renderDonutChart(props: DonutChartSpec["props"]): string {
  const format = (value: number): string => props.format === "percent"
    ? escapeHtml(`${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`)
    : formatValue(value, props.format);
  // Normalize before summing so even large finite values cannot overflow the total.
  const maximum = Math.max(...props.data.map((point) => point.value));
  const weights = props.data.map((point) => point.value / maximum);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const circumference = 1_000_000;
  let cumulative = 0;
  let offset = 0;

  const segments = props.data.map((point, index) => {
    cumulative += weights[index] / total;
    // Round cumulative endpoints, not individual lengths. The last endpoint closes
    // the ring exactly; butt caps keep adjacent segments from overlapping.
    const end = index === props.data.length - 1
      ? circumference
      : Math.min(circumference, Math.round(cumulative * circumference));
    const length = end - offset;
    const segment = `<circle class="dk-donut-segment dk-donut-color-${escapeHtml(index)}" cx="50" cy="50" r="36" fill="none" stroke-width="16" stroke-linecap="butt" stroke="var(--dk-donut-color, var(--brand-color-accent,#0a7))" pathLength="1000000" stroke-dasharray="${escapeHtml(length)} ${escapeHtml(circumference - length)}" stroke-dashoffset="${escapeHtml(-offset)}" transform="rotate(-90 50 50)"><title>${escapeHtml(point.label)}: ${format(point.value)}</title></circle>`;
    offset = end;
    return segment;
  }).join("");
  const title = props.title === undefined
    ? ""
    : `<div class="dk-chart-title">${escapeHtml(props.title)}</div>`;
  const legend = props.showLegend
    ? `<ul class="dk-donut-legend">${props.data.map((point, index) =>
        `<li class="dk-donut-legend-item"><span class="dk-donut-swatch dk-donut-color-${escapeHtml(index)}" aria-hidden="true"></span><span class="dk-donut-legend-label" title="${escapeHtml(point.label)}">${escapeHtml(point.label)}</span><span class="dk-donut-legend-value">${format(point.value)}</span></li>`,
      ).join("")}</ul>`
    : "";
  const chartName = props.title ?? "Category distribution";
  const contentClass = props.showLegend
    ? "dk-donut-content dk-donut-with-legend"
    : "dk-donut-content";

  return `<div class="dk-card dk-donut-card">${title}<div class="${escapeHtml(contentClass)}"><div class="dk-donut"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(chartName)}"><title>${escapeHtml(chartName)}</title>${segments}</svg></div>${legend}</div></div>`;
}
