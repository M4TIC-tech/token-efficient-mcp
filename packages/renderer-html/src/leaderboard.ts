import type { LeaderboardSpec } from "@m4tic/core";
import { escapeHtml, formatValue } from "./html.js";

export function renderLeaderboard(props: LeaderboardSpec["props"]): string {
  const format = (value: number): string => props.format === "percent"
    ? escapeHtml(`${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`)
    : formatValue(value, props.format);
  const title = props.title === undefined
    ? ""
    : `<div class="dk-chart-title">${escapeHtml(props.title)}</div>`;
  // Preserve the supplied ranking; this component does not silently sort the data.
  const items = props.items.map((item, index) => {
    const rank = props.showRank
      ? `<span class="dk-leaderboard-rank">${escapeHtml(index + 1)}</span>`
      : "";
    const glyph = item.trend === undefined ? "" : { up: "▲", down: "▼", flat: "■" }[item.trend];
    const trend = item.trend === undefined
      ? ""
      : `<span class="dk-leaderboard-trend dk-trend-${escapeHtml(item.trend)}" aria-label="${escapeHtml(item.trend)}">${escapeHtml(glyph)}</span>`;
    const value = format(item.value);

    return `<li class="dk-leaderboard-item">${rank}<span class="dk-leaderboard-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span><span class="dk-leaderboard-value" title="${value}">${value}</span>${trend}</li>`;
  }).join("");

  return `<div class="dk-card dk-leaderboard">${title}<ul class="dk-leaderboard-list">${items}</ul></div>`;
}
