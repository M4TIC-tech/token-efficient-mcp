# Changelog

## 0.1.5

### Added
- `mode` field (`"light" | "dark"`) is now exposed on the `validate_spec` and `render_preview` MCP tool schemas. Agents can request dark mode without supplying a brand file path. Brand file overrides still take precedence when provided.
- DataTable client-side pagination. When `pageSize < totalRows`, the renderer emits working Prev/Next controls with a lightweight inline script that slices rows without a full page reload. Sorting is preserved across pages. Single-page, empty, and omitted-`pageSize` tables render no pagination UI at all.

### Internal
- 27 tests passing (13 donut edge cases, 8 pagination, 6 mode). Build and typechecks clean.

## 0.1.4

### Fixed
- DashboardGrid no longer clips bottom rows when `height` is omitted. Root container uses `min-height: 100vh/100dvh` with intrinsic content sizing; explicit `height` creates a dedicated `overflow: auto` scrolling wrapper (never `overflow: hidden`).
- DonutChart rewritten to use filled SVG arc `<path>` geometry instead of `stroke-dasharray`/`pathLength` on `<circle>`. Fixes broken horseshoe rendering on small containers and enables proper 100% rings.
- DonutChart renderer is defensive beyond the MCP schema (single-slice, zero, empty, negative cases unit-tested directly; `DonutChartSpec` unchanged at 2–6 strictly positive).