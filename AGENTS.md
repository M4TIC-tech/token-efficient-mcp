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
- pnpm workspaces, TypeScript strict, ESM only.
- Zod for schemas, zod-to-json-schema for MCP exposure.
- @modelcontextprotocol/sdk for the server, stdio transport.
- tsx for running TS directly; no build step required for dev.
- Every brand value is emitted as a CSS variable with a fallback.
  The renderer never emits raw hex or pixel values.
- Component specs never inline data; they reference a dataRef that
  the runtime resolves against a fixture bundle.
- Keep each file small and single-purpose. Prefer explicit code over
  clever abstractions.

## Non-goals (explicitly out of scope)
- Performance optimization, caching, streaming, SSR frameworks.
- Visual polish beyond what a client preview needs.
- Tests beyond what is needed to verify a task's acceptance criteria.

## Definition of done for any task
- Code compiles under `tsc --noEmit`.
- The acceptance criteria in the task prompt are met.
- No new dependencies beyond those listed above without saying so first.