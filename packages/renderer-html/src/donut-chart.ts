/**
 * Renderer is defensive beyond DonutChartSpec (which enforces 2–6 positive values).
 * Single-slice/0/empty are unit-tested directly and are intentionally not MCP-reachable today.
 * TODO: consider relaxing DonutChartSpec to 1–N positive in a future minor.
 *
 * Polar points start at -PI/2 (12 o'clock) and advance clockwise. Each filled wedge
 * joins an outer clockwise arc to an inner counterclockwise arc. A complete ring
 * uses two half-arcs per contour, since one arc cannot describe a full revolution.
 */
import type { DonutChartSpec } from "@m4tic/core";
import { escapeHtml, formatValue } from "./html.js";

const center = 50;
const outerRadius = 44;
const innerRadius = outerRadius * 0.6;
const turn = Math.PI * 2;
const firstAngle = -Math.PI / 2;

function polarToCartesian(cx: number, cy: number, radius: number, angle: number): string {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]
    .map((value) => Number(value.toFixed(6))).join(" ");
}

function ringPath(): string {
  return [outerRadius, innerRadius].map((radius, index) => {
    const top = polarToCartesian(center, center, radius, firstAngle);
    const bottom = polarToCartesian(center, center, radius, firstAngle + Math.PI);
    const sweep = index === 0 ? 1 : 0;
    return `M ${top} A ${radius} ${radius} 0 0 ${sweep} ${bottom} A ${radius} ${radius} 0 0 ${sweep} ${top} Z`;
  }).join(" ");
}

function wedgePath(start: number, end: number): string {
  if (end - start >= turn) return ringPath();
  const largeArc = end - start > Math.PI ? 1 : 0;
  const outerStart = polarToCartesian(center, center, outerRadius, start);
  const outerEnd = polarToCartesian(center, center, outerRadius, end);
  const innerEnd = polarToCartesian(center, center, innerRadius, end);
  const innerStart = polarToCartesian(center, center, innerRadius, start);
  return `M ${outerStart} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd} L ${innerEnd} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart} Z`;
}

export function renderDonutChart(props: DonutChartSpec["props"]): string {
  const format = (value: number): string => props.format === "percent"
    ? escapeHtml(`${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`)
    : formatValue(value, props.format);
  // Clamp negative/non-finite values to zero; zero values contribute no visible slice.
  const points = props.data.map((point, index) => ({
    ...point,
    index,
    value: Number.isFinite(point.value) && point.value > 0 ? point.value : 0,
  }));
  const maximum = points.reduce((largest, point) => Math.max(largest, point.value), 0);
  // Normalizing before summing prevents overflow for large finite values.
  const slices = points.map((point) => ({
    ...point, weight: maximum > 0 ? point.value / maximum : 0,
  })).filter((point) => point.weight > 0);
  const total = slices.reduce((sum, point) => sum + point.weight, 0);
  let angle = firstAngle;
  const segments = slices.length === 0
    ? `<path class="dk-donut-track" d="${escapeHtml(ringPath())}" fill="var(--brand-color-border,#ddd)" fill-rule="evenodd"><title>No positive data</title></path>`
    : slices.map((point, index) => {
        const end = index === slices.length - 1
          ? firstAngle + turn
          : angle + point.weight / total * turn;
        const path = wedgePath(angle, end);
        angle = end;
        return `<path class="dk-donut-segment dk-donut-color-${escapeHtml(point.index % 6)}" d="${escapeHtml(path)}" fill="var(--dk-donut-color, var(--brand-color-accent,#0a7))" fill-rule="evenodd"><title>${escapeHtml(point.label)}: ${format(point.value)}</title></path>`;
      }).join("");
  const title = props.title === undefined
    ? ""
    : `<div class="dk-chart-title">${escapeHtml(props.title)}</div>`;
  const legend = props.showLegend && points.length > 0
    ? `<ul class="dk-donut-legend">${points.map((point) =>
        `<li class="dk-donut-legend-item"><span class="dk-donut-swatch dk-donut-color-${escapeHtml(point.index % 6)}" aria-hidden="true"></span><span class="dk-donut-legend-label" title="${escapeHtml(point.label)}">${escapeHtml(point.label)}</span><span class="dk-donut-legend-value">${format(point.value)}</span></li>`,
      ).join("")}</ul>`
    : "";
  const chartName = props.title ?? "Category distribution";
  const contentClass = legend
    ? "dk-donut-content dk-donut-with-legend"
    : "dk-donut-content";

  return `<div class="dk-card dk-donut-card">${title}<div class="${escapeHtml(contentClass)}"><div class="dk-donut"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(chartName)}"><title>${escapeHtml(chartName)}</title>${segments}</svg></div>${legend}</div></div>`;
}
