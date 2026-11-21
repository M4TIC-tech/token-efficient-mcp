import assert from "node:assert/strict";
import { mkdtempSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { loadBrandById } from "./resources.js";

const missingBrand = "__mode_test_without_brand_file__";

test("missing brand files still default to the complete light theme", () => {
  const brand = loadBrandById(missingBrand);
  assert.equal(brand.mode, "light");
  assert.equal(brand.id, missingBrand);
  assert.equal(brand.colors?.background, "#f8fafc");
  assert.equal(brand.colors?.surface, "#ffffff");
});

test("requested dark mode selects the coherent dark base rather than relabeling light colors", () => {
  const brand = loadBrandById(missingBrand, "dark");
  assert.equal(brand.mode, "dark");
  assert.equal(brand.id, missingBrand);
  assert.equal(brand.colors?.background, "#0f172a");
  assert.equal(brand.colors?.surface, "#1e293b");
  assert.equal(brand.colors?.text, "#f8fafc");
  assert.equal(brand.colors?.border, "#334155");
  assert.equal(brand.colors?.accent, "#10b981");
});

test("explicit light mode retains the light fallback", () => {
  assert.equal(loadBrandById(missingBrand, "light").colors?.text, "#0f172a");
});

test("brand file mode and path-based defaults win over the requested mode", () => {
  const directory = mkdtempSync(join(tmpdir(), "m4tic-mode-"));
  const path = join(directory, "custom.json");
  try {
    writeFileSync(path, JSON.stringify({ id: "custom", mode: "light", colors: { accent: "#123456" } }));
    const light = loadBrandById(path, "dark");
    assert.equal(light.mode, "light");
    assert.equal(light.colors?.accent, "#123456");
    assert.equal(light.colors?.background, "#f8fafc");
    writeFileSync(path, JSON.stringify({ id: "custom", mode: "dark" }));
    assert.equal(loadBrandById(path, "light").colors?.surface, "#1e293b");
    writeFileSync(path, JSON.stringify({ id: "custom" }));
    assert.equal(loadBrandById(path, "dark").mode, "light");
  } finally {
    rmSync(path, { force: true });
    rmdirSync(directory);
  }
});

test("present invalid brand files still report an error", () => {
  const directory = mkdtempSync(join(tmpdir(), "m4tic-mode-"));
  const path = join(directory, "invalid.json");
  try {
    writeFileSync(path, JSON.stringify({ id: "invalid", mode: "sepia" }));
    assert.throws(() => loadBrandById(path, "dark"), /Invalid brand config/u);
  } finally {
    rmSync(path, { force: true });
    rmdirSync(directory);
  }
});

test("compiled MCP dashboard tools expose optional mode and render dark without a brand file", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("../dist/index.js", import.meta.url))],
    stderr: "pipe",
  });
  transport.stderr?.on("data", () => {});
  const client = new Client({ name: "mode-regression-test", version: "1.0.0" });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.equal(tools.length, 4);
    for (const name of ["validate_spec", "render_preview"]) {
      const tool = tools.find((entry) => entry.name === name);
      assert.ok(tool);
      assert.deepEqual(Object.keys(tool.inputSchema.properties ?? {}), ["specs", "brandId", "mode"]);
      assert.deepEqual(tool.inputSchema.required, ["specs", "brandId"]);
      const mode = tool.inputSchema.properties?.mode as { enum: string[] };
      assert.deepEqual(mode.enum, ["light", "dark"]);
      assert.match(tool.description ?? "", /Optional mode: "light" \| "dark"/u);
    }
    const args = {
      brandId: missingBrand, mode: "dark",
      specs: [{ component: "MetricCard", props: { label: "Dark from spec", value: 1 } }],
    };
    const validation = CallToolResultSchema.parse(await client.callTool({ name: "validate_spec", arguments: args }));
    const validationText = validation.content.find((entry) => entry.type === "text");
    assert.ok(validationText?.type === "text");
    assert.equal(JSON.parse(validationText.text).ok, true);
    const result = CallToolResultSchema.parse(await client.callTool({ name: "render_preview", arguments: args }));
    assert.ok(!result.isError);
    const text = result.content.find((entry) => entry.type === "text");
    assert.ok(text?.type === "text");
    assert.match(text.text, /--brand-color-background:#0f172a;/u);
    assert.match(text.text, /--brand-color-surface:#1e293b;/u);
    assert.match(text.text, /--brand-color-text:#f8fafc;/u);
    assert.match(text.text, /Dark from spec/u);
    const legacy = CallToolResultSchema.parse(await client.callTool({ name: "render_preview", arguments: { brandId: missingBrand, specs: args.specs } }));
    const legacyText = legacy.content.find((entry) => entry.type === "text");
    assert.ok(legacyText?.type === "text");
    assert.match(legacyText.text, /--brand-color-background:#f8fafc;/u);
  } finally {
    await client.close();
  }
});
