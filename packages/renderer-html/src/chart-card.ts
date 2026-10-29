import type { ChartCardSpec } from "@m4tic/core";
import { escapeHtml, formatValue } from "./html.js";

function coordinate(value: number): string {
  return escapeHtml(Number(value.toFixed(2)));
}

export function renderChartCard(props: ChartCardSpec["props"]): string {
  const data = [...props.data];
  if (props.sort === "asc") {
    data.sort((a, b) => a.value - b.value);
  } else if (props.sort === "desc") {
    data.sort((a, b) => b.value - a.value);
  }

  const format = (value: number): string => props.format === "percent"
    ? escapeHtml(`${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`)
    : formatValue(value, props.format);
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    ...(props.format === "currency" ? { style: "currency", currency: "USD" } : {}),
  });
  const formatLabel = (value: number): string =>
    escapeHtml(compact.format(value) + (props.format === "percent" ? "%" : ""));
  const tickFormat = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumSignificantDigits: 3,
    ...(props.format === "currency" ? { style: "currency", currency: "USD" } : {}),
  });

  // Normalize before subtracting extrema so even large finite values stay finite.
  const magnitude = Math.max(...data.map((point) => Math.abs(point.value))) || 1;
  const values = data.map((point) => point.value / magnitude);
  const minimum = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const paddedMax = maxValue > 0 ? maxValue * 1.15 : minimum < 0 ? 0.15 : 1;
  // Round upward to two significant digits in normalized units to avoid overflow.
  const magnitudeLog = Math.log10(magnitude);
  const stepExponent = Math.floor(magnitudeLog + Math.log10(paddedMax)) - 1;
  const step = 10 ** (stepExponent - magnitudeLog);
  const domainMax = Math.ceil(paddedMax / step) * step;
  const range = domainMax - minimum;
  const ticks = Array.from({ length: 5 }, (_, index) => minimum + range * index / 4);
  const tickLabels = ticks.map((tick) => escapeHtml(
    tickFormat.format(Math.min(Number.MAX_VALUE, tick * magnitude)) +
      (props.format === "percent" ? "%" : ""),
  ));

  const averageLabelLength = data.reduce((total, point) => total + point.label.length, 0) / data.length;
  const rotateLabels = averageLabelLength > 5 || data.length > 20;
  const left = Math.min(160, Math.max(80, ...tickLabels.map((label) => label.length * 6.5 + 12)));
  const right = 24;
  const width = 800;
  const height = props.height;
  const top = Math.min(16, height * 0.1);
  const bottom = Math.min(rotateLabels ? 80 : 36, height * 0.4);
  const plotHeight = height - top - bottom;
  const slotWidth = (width - left - right) / data.length;
  const x = (index: number): number => left + (index + 0.5) * slotWidth;
  const y = (value: number): number => top + (domainMax - value) / range * plotHeight;
  // Percentage geometry fills the viewport without a viewBox scaling text or circles.
  const xPercent = (value: number): string => `${coordinate(value / width * 100)}%`;
  const yPercent = (value: number): string => `${coordinate(value / height * 100)}%`;
  const zeroY = y(0);
  const labelY = height - bottom + Math.min(18, bottom * 0.6);

  const grid = ticks.map((tick, index) =>
    `<line class="dk-chart-grid" x1="${xPercent(left)}" y1="${yPercent(y(tick))}" x2="${xPercent(width - right)}" y2="${yPercent(y(tick))}"/>` +
    `<text class="dk-chart-label" x="${xPercent(left - 10)}" y="${yPercent(y(tick))}" text-anchor="end" dominant-baseline="middle">${tickLabels[index]}</text>`,
  ).join("");

  const labels = data.map((point, index) => {
    const visibleLabel = rotateLabels && point.label.length > 12
      ? `${point.label.slice(0, 11)}…`
      : point.label;
    const rotationClass = rotateLabels ? " dk-chart-x-label-rotated" : "";
    const rotationOrigin = rotateLabels
      ? ` style="transform-origin: ${xPercent(x(index))} ${yPercent(labelY)};"`
      : "";
    return `<text class="dk-chart-label dk-chart-x-label${rotationClass}" x="${xPercent(x(index))}" y="${yPercent(labelY)}" text-anchor="${rotateLabels ? "start" : "middle"}"${rotationOrigin}><title>${escapeHtml(point.label)}</title>${escapeHtml(visibleLabel)}</text>`;
  }).join("");

  const marks = props.type === "bar"
    ? data.map((point, index) => {
        const pointY = y(values[index]);
        const barY = Math.min(zeroY, pointY);
        const valueLabel = props.showLabels
          ? `<text class="dk-chart-data-label" x="${xPercent(x(index))}" y="${yPercent(barY)}" dy="-6" text-anchor="middle" font-size="10" fill="var(--brand-color-text)">${formatLabel(point.value)}</text>`
          : "";
        return `<rect class="dk-chart-bar" x="${xPercent(x(index) - slotWidth * 0.32)}" y="${yPercent(barY)}" width="${xPercent(slotWidth * 0.64)}" height="${yPercent(Math.abs(zeroY - pointY))}" rx="2"><title>${escapeHtml(point.label)}: ${format(point.value)}</title></rect>${valueLabel}`;
      }).join("")
    : data.slice(1).map((_, index) =>
        `<line class="dk-chart-line" x1="${xPercent(x(index))}" y1="${yPercent(y(values[index]))}" x2="${xPercent(x(index + 1))}" y2="${yPercent(y(values[index + 1]))}" stroke-width="2"/>`,
      ).join("") +
      data.map((point, index) =>
        `<circle class="dk-chart-point" cx="${xPercent(x(index))}" cy="${yPercent(y(values[index]))}" r="3"><title>${escapeHtml(point.label)}: ${format(point.value)}</title></circle>`,
      ).join("");

  const title = props.title !== undefined
    ? `<div class="dk-chart-title">${escapeHtml(props.title)}</div>`
    : "";
  const chartName = props.title ?? (props.type === "bar" ? "Bar chart" : "Line chart");

  return `<div class="dk-card dk-chart">${title}<div class="dk-chart-body"><div class="dk-chart-scroll"><svg class="dk-chart-svg" xmlns="http://www.w3.org/2000/svg" width="${coordinate(width)}" height="${coordinate(height)}" style="width: 100%; height: 100%; min-width: max(100%, calc(${escapeHtml(data.length)} * 80px), 600px);" role="img" aria-label="${escapeHtml(chartName)}"><title>${escapeHtml(chartName)}</title>${grid}${marks}${labels}</svg></div></div></div>`;
}
