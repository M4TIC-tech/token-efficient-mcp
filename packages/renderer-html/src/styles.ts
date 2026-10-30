// note: danger is an optional brand token; negative trends retain a fallback.
export const stylesheet = `
*, *::before, *::after {
  box-sizing: border-box;
}

html { min-height: 100%; }

body {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: var(--brand-space-lg, 24px);
  background-color: var(--brand-color-background, #f8fafc);
  color: var(--brand-color-text, #111);
  font-family: var(--brand-font-body, sans-serif);
  -webkit-font-smoothing: antialiased;
}

.dk-grid {
  display: flex;
  flex-direction: column;
  gap: var(--brand-space-md, 16px);
  width: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 0;
}

.dk-shell { overflow: auto; }

.dk-item {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  flex: 0 0 auto;
}

.dk-item-panel { flex: 1 1 0; }

.dk-grid-container {
  align-content: stretch;
  min-width: 0;
  min-height: 0;
  flex: 1 1 var(--dk-grid-height, 0px);
  overflow: auto;
}

.dk-grid-item-metric { align-self: start; }

.dk-grid-item > .dk-card, .dk-item > .dk-card {
  flex: 1 1 0;
}

.dk-grid-item > .dk-metric, .dk-item > .dk-metric {
  flex: 0 1 auto;
  align-self: start;
  width: 100%;
}

.dk-card {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--brand-color-surface, #fff);
  border: 1px solid var(--brand-color-border, #ddd);
  border-radius: var(--brand-radius-md, 8px);
  box-shadow: var(--brand-shadow-md, 0 1px 3px rgba(0,0,0,0.1));
  overflow: visible;
  transition: box-shadow 0.2s ease;
}

.dk-grid-container > * {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.dk-card:hover {
  box-shadow: var(--brand-shadow-lg, 0 4px 6px rgba(0,0,0,0.05));
}

.dk-table-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dk-table-scroll {
  border-radius: inherit;
  flex: 1 1 0;
  min-height: 0;
  overflow-x: auto;
  overflow-y: auto;
}

.dk-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.dk-th {
  padding: var(--brand-space-sm, 8px) var(--brand-space-md, 16px);
  position: sticky;
  top: 0;
  background-color: var(--brand-color-surface, #fff);
  z-index: 10;
  box-shadow: inset 0 -1px 0 var(--brand-color-border, #ddd);
  color: var(--brand-color-muted, #666);
  font-family: var(--brand-font-heading, sans-serif);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dk-th[data-sortable="true"] {
  cursor: pointer;
  user-select: none;
}

.dk-th[data-sortable="true"]:hover {
  color: var(--brand-color-text, #111);
}

.dk-th[data-sortable="true"]:focus-visible {
  outline: 2px solid var(--brand-color-accent, #0a7);
  outline-offset: -2px;
}

.dk-th[aria-sort="ascending"]::after { content: " ▲"; }
.dk-th[aria-sort="descending"]::after { content: " ▼"; }

.dk-td {
  padding: var(--brand-space-sm, 8px) var(--brand-space-md, 16px);
  border-bottom: 1px solid var(--brand-color-border, #ddd);
  font-family: var(--brand-font-body, sans-serif);
  font-size: 0.875rem;
}

.dk-table tbody tr {
  transition: background-color 0.15s ease;
}

.dk-table tbody tr:hover {
  background-color: var(--brand-color-hover, rgba(0,0,0,0.04));
}

.dk-text-left { text-align: left; }
.dk-text-right { text-align: right; font-variant-numeric: tabular-nums; }
.dk-text-center { text-align: center; }

.dk-pagination {
  flex-shrink: 0;
  margin-top: auto;
  display: flex;
  gap: var(--brand-space-sm, 8px);
  padding: var(--brand-space-sm, 8px) var(--brand-space-md, 16px);
  align-items: center;
  justify-content: flex-end;
  color: var(--brand-color-muted, #666);
  font-family: var(--brand-font-body, sans-serif);
  font-size: 0.75rem;
}

.dk-pagination-button {
  border: 1px solid var(--brand-color-border, #ddd);
  background: var(--brand-color-surface, #fff);
  border-radius: var(--brand-radius-sm, 4px);
  padding: var(--brand-space-xs, 4px) var(--brand-space-sm, 8px);
  color: inherit;
  font: inherit;
}

.dk-pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dk-empty {
  align-items: center;
  padding: var(--brand-space-lg, 24px);
  text-align: center;
  color: var(--brand-color-muted, #666);
  font-family: var(--brand-font-body, sans-serif);
  font-size: 0.875rem;
}

.dk-empty-icon {
  margin-bottom: var(--brand-space-sm, 8px);
}

.dk-metric {
  padding: var(--brand-space-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--brand-space-sm, 8px);
  overflow: auto;
}

.dk-metric-label {
  font-size: 0.875rem;
  color: var(--brand-color-muted, #666);
  font-family: var(--brand-font-body, sans-serif);
  font-weight: 500;
}

.dk-metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--brand-color-text, #111);
  font-family: var(--brand-font-heading, sans-serif);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.dk-trend {
  display: flex;
  gap: var(--brand-space-xs, 4px);
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--brand-font-body, sans-serif);
}

.dk-trend-up { color: var(--brand-color-accent, #0a7); }
.dk-trend-down { color: var(--brand-color-danger, #c33); }
.dk-trend-flat { color: var(--brand-color-muted, #666); }

.dk-metric-comparison {
  font-size: 0.75rem;
  color: var(--brand-color-muted, #666);
  font-family: var(--brand-font-body, sans-serif);
}

.dk-chart {
  display: flex;
  flex-direction: column;
  padding: var(--brand-space-md, 16px);
}

.dk-chart-title {
  margin-bottom: var(--brand-space-sm, 8px);
  color: var(--brand-color-muted, #666);
  font-family: var(--brand-font-heading, sans-serif);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dk-chart-body {
  min-width: 0;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dk-chart-scroll {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.dk-chart-svg {
  display: block;
  flex: 1 0 auto;
  min-height: 200px;
  min-width: 100%;
}

.dk-chart-grid {
  stroke: var(--brand-color-border, #ddd);
  stroke-width: 1;
}

.dk-chart-label {
  fill: var(--brand-color-muted, #666);
  font-family: var(--brand-font-body, sans-serif);
  font-size: 11px;
}

.dk-chart-x-label-rotated {
  transform-box: view-box;
  transform: rotate(45deg);
}

.dk-chart-bar, .dk-chart-point { fill: var(--brand-color-accent, #0a7); }
.dk-chart-bar { transition: opacity 0.2s ease; }
.dk-chart-bar:hover { opacity: 0.8; }

.dk-chart-line {
  stroke: var(--brand-color-accent, #0a7);
  vector-effect: non-scaling-stroke;
}

@media (min-width: 768px) {
  body { height: 100dvh; overflow: hidden; }
  .dk-metric { max-height: 180px; }
  .dk-table-wrapper { max-height: 700px; }
  .dk-table-scroll { max-height: var(--dk-table-max-height, none); }
}

@media (max-width: 767px) {
  .dk-grid { flex: 0 0 auto; }
  .dk-shell { overflow: visible; }
  .dk-item-panel { flex: 0 0 auto; min-height: 0; }
  .dk-grid-container {
    flex: 0 0 auto;
    min-height: 0;
    grid-template-columns: 1fr !important;
    grid-template-rows: none !important;
    grid-auto-rows: auto;
    overflow: visible;
  }
  .dk-grid-container > * {
    height: auto;
    grid-column: span 1 !important;
  }
  .dk-grid-item > .dk-card, .dk-item > .dk-card { flex: 0 1 auto; }
  .dk-card, .dk-table-scroll { max-height: none; }
  .dk-table-scroll { flex: 0 1 auto; }
  .dk-chart-body { flex: 0 0 auto; height: var(--dk-chart-height, 400px); }
}

@media (prefers-reduced-motion: reduce) {
  .dk-card, .dk-table tbody tr, .dk-chart-bar { transition: none; }
}
`;
