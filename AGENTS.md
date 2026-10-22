# Dashboard Kit MCP — project brief

## What this is
A token-budgeted MCP kit that lets AI agents render dashboards by emitting
small JSON specs instead of generating JSX/CSS. Brand tokens are enforced
at render time, never emitted by the agent.

## Pilot scope (do not expand without explicit instruction)
- Two components only: DataTable and MetricCard.
- One renderer: HTML (self-contained, no framework).
- One MCP server with four tools: list_components, get_contract,
  validate_spec, render_preview.
- No React renderer, no live data connectors, no hosted service,
  no dashboard editor UI, no auth, no persistence.

## Stack and conventions
- pnpm workspaces, TypeScript strict, ESM only, `@types/node` enabled.
- Inter-package imports use `workspace:*` (e.g. `"@dashboard-kit/core": "workspace:*"`).
- Zod for schemas, zod-to-json-schema for MCP exposure.
- @modelcontextprotocol/sdk for the server, stdio transport.
- tsx for running TS directly; no build step required for dev.

### Brand tokens vs. structural constants
Every value a brand config could reasonably control—colors, fonts,
spacing, radius—is emitted as a CSS variable with a fallback
(`var(--brand-color-surface, #fff)`). Structural constants of the
component itself (font sizes like `14px`/`24px`, font weight, border
widths of `1px`, small gaps of `4px`, button padding) remain literal
pixels. The principle: if a client's brand could want to change it,
it's a variable; if it's an inherent property of the component's
shape, it's literal.

### Escaping invariant
All dynamic strings in HTML output pass through `escapeHtml`—column
labels, cell values, metric labels, comparisons, empty states, anything
not a hard-coded literal. This is a security invariant, not a stylistic
choice.

### Data references
Component specs never inline data; they reference a `dataRef` that the
runtime resolves against a fixture bundle.

### Code style
Keep each file small and single-purpose. Prefer explicit code over
clever abstractions.

## Non-goals (explicitly out of scope)
- Performance optimization, caching, streaming, SSR frameworks.
- Visual polish beyond what a client preview needs.
- Tests beyond what is needed to verify a task's acceptance criteria.

## Definition of done for any task
- Code compiles under `tsc --noEmit`.
- The acceptance criteria in the task prompt are met.
- No new dependencies beyond those listed above without saying so first.

### What "verified" means for the pilot
`tsc --noEmit` passes and Codex reports what it checked (defaults,
bounds, escaping, contract examples). No committed test files are
required until the benchmark task. Adding a test suite is out of scope
for the pilot.

## Known decisions
- @dashboard-kit/core exports its source barrel (src/index.ts) directly.
  No build step during the pilot; add a tsup/esbuild build before npm publish.