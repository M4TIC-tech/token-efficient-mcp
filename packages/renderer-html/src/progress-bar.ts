import type { ProgressBarSpec } from "@m4tic/core";
import { escapeHtml, formatValue } from "./html.js";

export function renderProgressBar(props: ProgressBarSpec["props"]): string {
  const format = (value: number): string => props.format === "percent"
    ? escapeHtml(`${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`)
    : formatValue(value, props.format);
  // Keep both the visual fill and the accessible range valid for over/under goals.
  const percentage = Math.max(0, Math.min(100, props.value / props.max * 100));
  const current = Math.max(0, Math.min(props.max, props.value));
  const value = props.showValue
    ? `<span class="dk-progress-value">${format(props.value)} / ${format(props.max)}</span>`
    : "";

  return `<div class="dk-card dk-progress"><div class="dk-progress-label-row"><span class="dk-progress-label">${escapeHtml(props.label)}</span>${value}</div><div class="dk-progress-track" role="progressbar" aria-label="${escapeHtml(props.label)}" aria-valuenow="${escapeHtml(current)}" aria-valuemax="${escapeHtml(props.max)}" aria-valuemin="0"><div class="dk-progress-fill" style="width: ${escapeHtml(Number(percentage.toFixed(6)))}%;"></div></div></div>`;
}
