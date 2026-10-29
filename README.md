# Dashboard Kit MCP

**Cut your AI agent's token bill by ~92% on repetitive UI generation while guaranteeing brand consistency and schema validation.**

Agents are great at logic, but terrible at writing HTML/CSS from scratch. Every time you ask an agent to "build a dashboard", it burns thousands of tokens writing boilerplate `<table>` markup, guessing hex codes, and inventing CSS layouts. 

`dashboard-kit` is a Model Context Protocol (MCP) server that gives agents a declarative UI language. Instead of generating code, the agent outputs a tiny JSON spec. The kit validates it against Zod schemas and renders pixel-perfect, brand-compliant HTML.

## The Numbers

We benchmarked Claude Sonnet 5.5 (High effort) generating a simple sales dashboard.

| Task | Raw HTML (Baseline) | JSON Spec (With Kit) | Reduction |
| :--- | :--- | :--- | :--- |
| Build a data table | 2,533 tokens | 134 tokens | **94.7%** |
| Build a KPI card | 1,028 tokens | 76 tokens | **92.6%** |
| Side-by-side layout | 3,189 tokens | 197 tokens | **93.8%** |
| Brand-constrained | 2,986 tokens | 177 tokens | **94.1%** |
| Complex multi-element | 4,131 tokens | 244 tokens | **94.1%** |
| Full dashboard grid | 3,214 tokens | 519 tokens | **83.8%** |

**Average token reduction: 92.2%**

*Read the full [Benchmark Results](benchmarks/RESULTS.md).*

## How it works

1. The agent calls `list_components` to see what's available.
2. The agent outputs a JSON spec (e.g., `{ component: "DataTable", props: { dataRef: "query_1" } }`).
3. The MCP server validates the spec against a strict Zod schema.
4. The server renders the HTML, injecting brand tokens (colors, fonts, spacing) automatically.

The agent never writes CSS. It never hallucinates a hex code. It never inlines data.

## Quick Start (Claude Desktop)

1. Clone this repo, run `pnpm install`, then `pnpm build`.
2. Add the MCP server to your `claude_desktop_config.json`:
   *(See setup instructions in the docs)*
3. Ask Claude: *"Use dashboard-kit to build a dashboard with a DataTable for dataRef `query.revenue_by_region` and a MetricCard for Total Revenue."*

### Windows Installation (Important)
Because Claude Desktop on Windows struggles to launch `.cmd` files in directories with spaces, you must use the `node` command directly to launch the server. 

Add this to your `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dashboard-kit": {
      "command": "node",
      "args": [
        "C:\\Path\\To\\Your\\Repo\\packages\\mcp-server\\dist\\index.js"
      ]
    }
  }
}
```

(Make sure to replace C:\\Path\\To\\Your\\Repo with your actual absolute path).

### NPM packages and executable

The publishable packages are `@m4tic/core`, `@m4tic/renderer-html`, and
`@m4tic/mcp-server`. `pnpm build` creates their ESM JavaScript and TypeScript
declarations in `dist/`, including the core package's light and dark base themes.
Rebuild after changing package sources before running the demo or server.
The toolchain uses TypeScript 6 because tsup's declaration generator requires
its JavaScript compiler API, which TypeScript 7 does not expose.
The `ignoreDeprecations: "6.0"` compiler setting covers the legacy `baseUrl`
option injected internally by tsup's declaration pipeline.

After publishing the packages, install the server with
`npm install --global @m4tic/mcp-server` and launch it with `token-efficient-mcp`.
It communicates over stdio and does not print a startup message to stdout.

The `brandId` tool argument accepts an absolute or working-directory-relative
JSON file path, a local name with an optional `.json` extension, or a name from
`examples/brand-configs/`. Source checkouts also find their example configs from
any working directory. Missing configs use the bundled light theme; invalid
existing configs still report errors. If no local or checkout revenue fixture
bundle exists, tables render their empty state.

## Features
- **Two Components:** `DataTable` (sortable, paginated) and `MetricCard` (with trends).
- **Brand Enforcement:** Injects brand tokens via CSS variables at render time. Zero hard-coded hex codes.
- **Zod Validation:** Rejects malformed specs before they hit the UI.
- **Token Budgets:** Each component declares its max allowed token cost, so agents know when to stop generating.

## Built by [M4TIC](https://www.m4tic.tech)
We build intelligent systems, AI agents, and workflow automations. If you need to connect your company's design system to the agent stack, [get in touch](https://www.m4tic.tech).
