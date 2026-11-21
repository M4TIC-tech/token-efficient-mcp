# Token-Efficient MCP

**Cut your AI agent's token bill by ~92% on repetitive UI generation while guaranteeing brand consistency and schema validation.**

Agents are great at logic, but terrible at writing HTML/CSS from scratch. Every time you ask an agent to "build a dashboard", it burns thousands of tokens writing boilerplate `<table>` markup, guessing hex codes, and inventing CSS layouts. 

`Token-Efficient MCP` is a Model Context Protocol (MCP) server that gives agents a declarative UI language. Instead of generating code, the agent outputs a tiny JSON spec. The kit validates it against Zod schemas and renders pixel-perfect, responsive, brand-compliant HTML.

## The Numbers

We benchmarked Claude Sonnet 5.5 (High effort) generating a variety of UI layouts.

| Task | Raw HTML (Baseline) | JSON Spec (With Kit) | Reduction |
| :--- | :--- | :--- | :--- |
| Build a data table | 2,533 tokens | 134 tokens | **94.7%** |
| Build a KPI card | 1,028 tokens | 76 tokens | **92.6%** |
| Side-by-side layout | 3,189 tokens | 197 tokens | **93.8%** |
| Brand-constrained | 2,986 tokens | 177 tokens | **94.1%** |
| Complex multi-element | 4,131 tokens | 244 tokens | **94.1%** |
| Full dashboard grid | 3,214 tokens | 519 tokens | **83.8%** |

**Average token reduction: 92.2%**

*Read the full [Benchmark Results](packages/benchmarks/RESULTS.md).*

## Components

- **`DataTable`** — Sortable, paginated table with sticky headers and empty state.
- **`MetricCard`** — KPI card with trend indicators (up/down/flat).
- **`ChartCard`** — Inline SVG bar/line charts with deterministic sorting and axis scaling.
- **`DonutChart`** — SVG donut chart with legend and automatic color mixing.
- **`Leaderboard`** — Ranked list with trend indicators and truncation.
- **`ProgressBar`** — Labelled progress track with percentage fill.
- **`DashboardGrid`** — 12-column responsive layout container. Place components side-by-side by assigning a span (1-12) to each child. Collapses to a single column on mobile.

## How it works

1. The agent calls `list_components` to see what's available.
2. The agent outputs a JSON spec (e.g., `{ "component": "DataTable", "props": { "dataRef": "query_1" } }`).
3. The MCP server validates the spec against a strict Zod schema.
4. The server renders the HTML, injecting brand tokens (colors, fonts, spacing) automatically.

The agent never writes CSS. It never hallucinates a hex code. It never inlines data.

## Quick Start (Claude Desktop)

Add the following to your `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS).

No cloning or installation required—the server is fetched automatically via `npx`.

```json
{
  "mcpServers": {
    "token-efficient-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@m4tic/mcp-server@0.1.5"
      ]
    }
  }
}
```

Restart Claude Desktop, and the dashboard-kit tools will be available.

*(Note: By default, the server looks for brand configs in your local `examples/brand-configs/` folder. If you are using it via `npx`, it will gracefully fall back to the default light or dark theme if custom brand files are not found).*

Revenue fixtures load first from `examples/fixtures/revenue.json` relative to
the client's working directory, then from the server package's bundled
`dist/fixtures/revenue.json`. Bundled fixture use is logged to stderr. If neither
file exists, tables render their empty state.

## Theme & Branding

Agents can request a specific theme mode without needing a custom brand file. Pass `"mode": "dark"` to the `render_preview` or `validate_spec` tools to switch the entire dashboard to a dark palette. 

If you supply a custom brand file path in `brandId`, the `mode` inside that file will always take precedence over the requested runtime mode.

## Features
- **Brand Enforcement:** Injects brand tokens via CSS variables at render time. Zero hard-coded hex codes.
- **Light/Dark Mode:** Supports full brand inheritance. Pass just `"mode": "dark"` and the server builds a coherent dark theme.
- **Zod Validation:** Rejects malformed specs before they hit the UI.
- **Client-side Pagination:** Tables can be paginated without a page reload. Pass `pageSize` to the `DataTable` component.
- **Token Budgets:** Each component declares its max allowed token cost.

## Layout & Pagination defaults

The HTML shell fills the browser viewport. DashboardGrid automatically packs children into 12 columns. When there is more than one row, a first row containing only metrics fits its content; every other row shares the remaining height. A single row fills the available height. Metric spans above 4 are clamped to 4. On desktop, metric cards stop growing at 180px and table cards at 700px. Tables scroll internally; charts retain readable labels with internal scrolling when space is tight. On mobile, cards stack and height caps are removed.

Agents can omit `height` and `rows`. Explicit `rows` overrides the automatic tracks; legacy `height` values are shrinkable desktop size preferences.

**DataTable Pagination:** If a DataTable spec includes a `pageSize` prop that is less than the total rows, the renderer automatically generates lightweight inline JavaScript to power working Prev/Next controls. Single-page tables (where `pageSize` ≥ total rows) omit the controls entirely. Number and currency columns default to right alignment; explicit alignment still wins. Trend values are optional. A flat metric trend without a value displays `■ Flat`; a supplied value, including zero, displays its percentage.

## Built by [M4TIC](https://www.m4tic.tech)
We build intelligent systems, AI agents, and workflow automations. If you need to connect your company's design system to the agent stack, [get in touch](https://www.m4tic.tech/contact/).