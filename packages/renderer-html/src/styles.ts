// note: danger is an optional brand token; negative trends retain a fallback.
export const stylesheet = `
*, *::before, *::after {
  box-sizing: border-box;
}

body {
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
  max-width: 1200px;
  margin: 0 auto;
}

.dk-card {
  background: var(--brand-color-surface, #fff);
  border: 1px solid var(--brand-color-border, #ddd);
  border-radius: var(--brand-radius-md, 8px);
  box-shadow: var(--brand-shadow-md, 0 1px 3px rgba(0,0,0,0.1));
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.dk-card:hover {
  box-shadow: var(--brand-shadow-lg, 0 4px 6px rgba(0,0,0,0.05));
}

.dk-table-scroll {
  overflow-x: auto;
}

.dk-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.dk-th {
  padding: var(--brand-space-sm, 8px) var(--brand-space-md, 16px);
  border-bottom: 2px solid var(--brand-color-border, #ddd);
  color: var(--brand-color-muted, #666);
  font-family: var(--brand-font-heading, sans-serif);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

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

@media (prefers-reduced-motion: reduce) {
  .dk-card, .dk-table tbody tr { transition: none; }
}
`;
