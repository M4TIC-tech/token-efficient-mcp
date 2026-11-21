import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { DashboardGridSpec, DonutChartSpec } from "@m4tic/core";
import { renderDashboardGrid } from "./dashboard-grid.js";
import { renderDonutChart } from "./donut-chart.js";
import { stylesheet } from "./styles.js";

// Direct renderer tests: no schema parsing, MCP calls, or demo imports.
const outputDir = fileURLToPath(new URL("../../../examples/out/", import.meta.url));
const rootRule = stylesheet.match(/\.te-dashboard\s*\{([^}]+)\}/u)?.[1] ?? "";
const fixedRule = stylesheet.match(/\.te-dashboard--fixed\s*\{([^}]+)\}/u)?.[1] ?? "";
const bodyRules = [...stylesheet.matchAll(/(?:^|\n)\s*(?:html,\s*)?body\s*\{([^}]+)\}/gu)]
  .map((match) => match[1]).join("\n");
const outputPaths: string[] = [];

function document(content: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Renderer Regression Fixture</title><style>:root{--brand-space-sm:8px;--brand-space-md:16px;--brand-space-lg:24px;}${stylesheet}</style></head><body><main class="dk-grid dk-shell">${content}</main></body></html>`;
}

function writeFixture(name: string, html: string): void {
  mkdirSync(outputDir, { recursive: true });
  const path = join(outputDir, `${name}.html`);
  writeFileSync(path, html, "utf-8");
  outputPaths.push(path);
}

function pathData(html: string): string[] {
  assert.doesNotMatch(html, /<circle\b/u);
  assert.doesNotMatch(html, /stroke-dash(?:array|offset)|path[L]ength/u);
  const paths = [...html.matchAll(/<path\b[^>]*\bd="([^"]*)"/gu)].map((match) => match[1]);
  for (const path of paths) {
    assert.ok(path.trim().length > 0);
    assert.doesNotMatch(path, /NaN|undefined|Infinity/u);
    assert.match(path, /^M .+ A .+ Z$/u);
  }
  return paths;
}

const cases = [
  { name: "donut-edge-single-100", values: [100], segments: 1, track: false },
  { name: "donut-edge-zero-slice", values: [0, 25, 75], segments: 2, track: false },
  { name: "donut-edge-empty", values: [], segments: 0, track: true },
  { name: "donut-edge-all-zero", values: [0, 0], segments: 0, track: true },
  { name: "donut-edge-negative", values: [-10, 25, -5, 75], segments: 2, track: false },
  { name: "donut-edge-50-50", values: [50, 50], segments: 2, track: false },
];

for (const fixture of cases) {
  test(fixture.name, () => {
    const props: DonutChartSpec["props"] = {
      title: fixture.name,
      data: fixture.values.map((value, index) => ({ label: `Category ${index + 1}`, value })),
      format: "percent",
      showLegend: true,
    };
    const snapshot = JSON.stringify(props);
    const output = renderDonutChart(props);
    const paths = pathData(output);
    assert.equal(paths.length, fixture.track ? 1 : fixture.segments);
    assert.equal((output.match(/class="dk-donut-segment /gu) ?? []).length, fixture.segments);
    assert.equal(output.includes('class="dk-donut-track"'), fixture.track);
    assert.equal(JSON.stringify(props), snapshot, "rendering must not mutate data");
    assert.match(output, /viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"/u);
    if (fixture.track || fixture.values.length === 1) {
      assert.equal((paths[0].match(/ A /gu) ?? []).length, 4, "full ring needs two arcs per contour");
      assert.match(output, /fill-rule="evenodd"/u);
    }
    if (fixture.name === "donut-edge-50-50") {
      assert.equal((paths[0].match(/ A /gu) ?? []).length, 2);
      assert.match(paths[0], /^M 50 6 A 44 44 0 0 1 50 94 L 50 76\.4 A 26\.4 26\.4 0 0 0 50 23\.6 Z$/u);
      assert.match(paths[1], /^M 50 94 .+ 50 6 L 50 23\.6 .+ 50 76\.4 Z$/u);
    }
    writeFixture(fixture.name, document(`<div class="te-dashboard">${output}</div>`));
  });
}

test("unequal slices select the correct large-arc flags and retain colors", () => {
  const html = renderDonutChart({
    data: [{ label: "Small", value: 1 }, { label: "Large", value: 3 }],
    format: "number", showLegend: false,
  });
  const paths = pathData(html);
  assert.equal(paths.length, 2);
  assert.match(paths[0], /A 44 44 0 0 1/u);
  assert.match(paths[1], /A 44 44 0 1 1/u);
  assert.match(paths[1], /A 26\.4 26\.4 0 1 0/u);
  assert.match(html, /dk-donut-color-0/u);
  assert.match(html, /dk-donut-color-1/u);
  assert.doesNotMatch(html, /class="dk-donut-legend"/u);
});

test("large, tiny, and non-finite values cannot create invalid path coordinates", () => {
  for (const values of [[Number.MAX_VALUE, Number.MAX_VALUE], [Number.MIN_VALUE, Number.MIN_VALUE], [-1, 0], [NaN, Infinity]]) {
    const html = renderDonutChart({
      data: values.map((value) => ({ label: "Value", value })), format: "number", showLegend: false,
    });
    assert.ok(pathData(html).length > 0);
    assert.doesNotMatch(html, /NaN|undefined|Infinity/u);
  }
});

test("labels, title, and attribute values remain escaped", () => {
  const attack = '<img src=x onerror="evil"><script>evil</script>&';
  const html = renderDonutChart({
    title: attack, data: [{ label: attack, value: 1 }], format: "currency", showLegend: true,
  });
  assert.match(html, /&lt;img/u);
  assert.doesNotMatch(html, /<img|<script>|onerror="evil"/u);
  pathData(html);
});

test("the body scrolls and no-height dashboards use intrinsic rows and a viewport minimum", () => {
  assert.match(bodyRules, /overflow-y:\s*auto/u);
  assert.doesNotMatch(bodyRules, /(?:overflow|overflow-y):\s*hidden/u);
  assert.doesNotMatch(bodyRules, /(?:^|;)\s*height:/u);
  assert.match(rootRule, /min-height:\s*100vh/u);
  assert.match(rootRule, /min-height:\s*100dvh/u);
  assert.match(rootRule, /grid-template-rows:\s*max-content/u);
  assert.match(rootRule, /(?:^|;)\s*height:\s*auto/u);
  assert.match(rootRule, /safe-area-inset-bottom/u);
  assert.match(stylesheet, /grid-auto-rows:\s*minmax\(min-content, auto\)/u);
});

function fourRows(): DashboardGridSpec["props"] {
  return {
    gap: "md",
    children: Array.from({ length: 4 }, (_, index) => ({
      span: 12,
      spec: {
        component: "DonutChart",
        props: {
          title: `Row ${index + 1}`,
          data: [{ label: "A", value: 25 }, { label: "B", value: 75 }],
          format: "percent", showLegend: true,
        },
      },
    })),
  };
}

for (const fixed of [false, true]) {
  test(fixed ? "fixed dashboard scrolls around the natural content grid" : "all four no-height rows are present without a fixed height", () => {
    const props = fourRows();
    if (fixed) props.height = "500px";
    const output = renderDashboardGrid(props, {}, (spec) =>
      spec.component === "DonutChart" ? renderDonutChart(spec.props) : "",
    );
    assert.equal((output.match(/class="dk-grid-item"/gu) ?? []).length, 4);
    assert.equal((output.match(/class="dk-card dk-donut-card"/gu) ?? []).length, 4);
    pathData(output);
    if (fixed) {
      assert.match(output, /^<div class="te-dashboard te-dashboard--fixed" style="--dk-grid-height: 500px;">/u);
      assert.match(fixedRule, /(?:^|;)\s*height:\s*var\(--dk-grid-height\)/u);
      assert.match(fixedRule, /overflow:\s*auto/u);
      assert.doesNotMatch(fixedRule, /hidden/u);
      assert.match(output, /<div class="dk-grid-container"/u);
    } else {
      assert.match(output, /^<div class="te-dashboard">/u);
      assert.doesNotMatch(output, /--dk-grid-height|te-dashboard--fixed|grid-template-rows:/u);
    }
    const html = document(output);
    assert.match(html.replace(/\s+/gu, ""), /min-height:100/u);
    writeFixture(fixed ? "layout-four-donuts-fixed-edge" : "layout-four-donuts-no-height-edge", html);
  });
}

test("print absolute defensive fixture paths", () => {
  assert.equal(outputPaths.length, 8);
  console.log(outputPaths.join("\n"));
});
