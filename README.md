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
        "@m4tic/mcp-server@0.1.0"
      ]
    }
  }
}
```

Restart Claude Desktop, and the dashboard-kit tools will be available. 

*(Note: By default, the server looks for brand configs in your local `examples/brand-configs/` folder. If you are using it via `npx`, it will gracefully fall back to the default light or dark theme if custom brand files are not found).*

## Features
- **Brand Enforcement:** Injects brand tokens via CSS variables at render time. Zero hard-coded hex codes.
- **Light/Dark Mode:** Supports full brand inheritance. Pass just `"mode": "dark"` and the server builds a coherent dark theme.
- **Zod Validation:** Rejects malformed specs before they hit the UI.
- **Token Budgets:** Each component declares its max allowed token cost.

## Built by [M4TIC](https://www.m4tic.tech)
We build intelligent systems, AI agents, and workflow automations. If you need to connect your company's design system to the agent stack, [get in touch](https://www.m4tic.tech/contact/).