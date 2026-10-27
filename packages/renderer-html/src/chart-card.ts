import type { ChartCardSpec } from "@dashboard-kit/core";
import { escapeHtml, formatValue } from "./html.js";

function coordinate(value: number): string {
  return escapeHtml(Number(value.toFixed(2)));
}

export function renderChartCard(props: ChartCardSpec["props"]): string {
  const format = (value: number): string => props.format === "percent"
    ? escapeHtml(`${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`)
    : formatValue(value, props.format);

  // Normalize before subtracting extrema so even large finite values stay finite.
  const magnitude = Math.max(1, ...props.data.map((point) => Math.abs(point.value)));
  const values = props.data.map((point) => point.value / magnitude);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values) || (minimum === 0 ? 1 : 0);
  const range = maximum - minimum;
  const ticks = Array.from({ length: 5 }, (_, index) => minimum + range * index / 4);
  const tickLabels = ticks.map((tick) => format(tick * magnitude));

  const rotateLabels = props.data.length > 7;
  const left = Math.min(160, Math.max(80, ...tickLabels.map((label) => label.length * 6.5 + 12)));
  const right = 24;
  const width = Math.max(720, left + right + props.data.length * 48);
  const height = props.height;
  const top = Math.min(16, height * 0.1);
  const bottom = Math.min(rotateLabels ? 80 : 36, height * 0.4);
  const plotHeight = height - top - bottom;
  const slotWidth = (width - left - right) / props.data.length;
  const x = (index: number): number => left + (index + 0.5) * slotWidth;
  const y = (value: number): number => top + (maximum - value) / range * plotHeight;
  const zeroY = y(0);
  const labelY = height - bottom + Math.min(18, bottom * 0.6);

  const grid = ticks.map((tick, index) =>
    `<line class="dk-chart-grid" x1="${coordinate(left)}" y1="${coordinate(y(tick))}" x2="${coordinate(width - right)}" y2="${coordinate(y(tick))}"/>` +
    `<text class="dk-chart-label" x="${coordinate(left - 10)}" y="${coordinate(y(tick))}" text-anchor="end" dominant-baseline="middle">${tickLabels[index]}</text>`,
  ).join("");

  const labels = props.data.map((point, index) => {
    const visibleLabel = rotateLabels && point.label.length > 12
      ? `${point.label.slice(0, 11)}…`
      : point.label;
    const transform = rotateLabels
      ? ` transform="rotate(45 ${coordinate(x(index))} ${coordinate(labelY)})"`
      : "";
    return `<text class="dk-chart-label dk-chart-x-label" x="${coordinate(x(index))}" y="${coordinate(labelY)}" text-anchor="${rotateLabels ? "start" : "middle"}"${transform}><title>${escapeHtml(point.label)}</title>${escapeHtml(visibleLabel)}</text>`;
  }).join("");

  const marks = props.type === "bar"
    ? props.data.map((point, index) => {
        const pointY = y(values[index]);
        return `<rect class="dk-chart-bar" x="${coordinate(x(index) - slotWidth * 0.32)}" y="${coordinate(Math.min(zeroY, pointY))}" width="${coordinate(slotWidth * 0.64)}" height="${coordinate(Math.abs(zeroY - pointY))}" rx="2"><title>${escapeHtml(point.label)}: ${format(point.value)}</title></rect>`;
      }).join("")
    : `<polyline class="dk-chart-line" points="${props.data.map((_, index) => `${coordinate(x(index))},${coordinate(y(values[index]))}`).join(" ")}" stroke-width="2" fill="none"/>` +
      props.data.map((point, index) =>
        `<circle class="dk-chart-point" cx="${coordinate(x(index))}" cy="${coordinate(y(values[index]))}" r="3"><title>${escapeHtml(point.label)}: ${format(point.value)}</title></circle>`,
      ).join("");

  const title = props.title !== undefined
    ? `<div class="dk-chart-title">${escapeHtml(props.title)}</div>`
    : "";
  const chartName = props.title ?? (props.type === "bar" ? "Bar chart" : "Line chart");

  return `<div class="dk-card dk-chart">${title}<div class="dk-chart-scroll"><svg class="dk-chart-svg" xmlns="http://www.w3.org/2000/svg" width="${coordinate(width)}" height="${coordinate(height)}" viewBox="0 0 ${coordinate(width)} ${coordinate(height)}" role="img" aria-label="${escapeHtml(chartName)}"><title>${escapeHtml(chartName)}</title>${grid}${marks}${labels}</svg></div></div>`;
}
