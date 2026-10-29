#!/usr/bin/env node
import { contracts, validateSpec } from "@m4tic/core";
import { renderShell } from "@m4tic/renderer-html";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "./json-schema.js";
import { loadBrandById, loadFixtures } from "./resources.js";

function jsonResult(value: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

const server = new McpServer({ name: "dashboard-kit", version: "0.1.0" });

server.registerTool(
  "list_components",
  { description: "List available dashboard components.", inputSchema: {} },
  () =>
    jsonResult(
      contracts.map(({ name, description, tokenBudget }) => ({
        name,
        description,
        tokenBudget,
      })),
    ),
);

server.registerTool(
  "get_contract",
  {
    description: "Get a component's schema, example, token budget, and brand dependencies.",
    inputSchema: { name: z.string() },
  },
  ({ name }) => {
    const contract = contracts.find((entry) => entry.name === name);

    if (!contract) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown component: ${name}` }],
      };
    }

    return jsonResult({
      schema: zodToJsonSchema(contract.spec),
      example: contract.example,
      tokenBudget: contract.tokenBudget,
      brandDeps: contract.brandDeps,
    });
  },
);

server.registerTool(
  "validate_spec",
  {
    description: "Validate component specs against their contracts for a brand.",
    inputSchema: { specs: z.array(z.unknown()), brandId: z.string() },
  },
  ({ specs, brandId }) => jsonResult(validateSpec(specs, loadBrandById(brandId))),
);

server.registerTool(
  "render_preview",
  {
    description: "Render a dashboard HTML preview using a brand and static fixtures.",
    inputSchema: { specs: z.array(z.unknown()), brandId: z.string() },
  },
  ({ specs, brandId }) => {
    const brand = loadBrandById(brandId);
    const fixtures = loadFixtures();

    return {
      content: [{ type: "text", text: renderShell(specs, brand, fixtures) }],
    };
  },
);

await server.connect(new StdioServerTransport());
