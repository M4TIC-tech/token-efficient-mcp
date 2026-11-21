import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { z } from "zod";
import { DashboardGridSpec, loadBrand } from "../packages/core/src/index.js";
import { renderShell } from "../packages/renderer-html/src/index.js";
import { loadBrandById } from "../packages/mcp-server/src/resources.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const lightBrand = loadBrand(join(repoRoot, "examples", "brand-configs", "acme.json"));
const darkBrand = loadBrand(join(repoRoot, "examples", "brand-configs", "acme-dark.json"));
const fixtures: Record<string, unknown[]> = JSON.parse(
  readFileSync(join(repoRoot, "examples", "fixtures", "revenue.json"), "utf-8"),
);
const specs = [
  {
    component: "DashboardGrid",
    props: {
      gap: "md",
      children: [
        {
          span: 4,
          spec: {
            component: "MetricCard",
            props: {
              label: "Total Revenue",
              value: 1284500,
              format: "currency",
              trend: { direction: "up", value: 12.4 },
              comparison: "vs. same period last year",
            },
          },
        },
        {
          span: 4,
          spec: {
            component: "MetricCard",
            props: {
              label: "Average Deal Size",
              value: 48200,
              format: "currency",
              trend: { direction: "flat" },
              comparison: "vs. same period last year",
            },
          },
        },
        {
          span: 4,
          spec: {
            component: "MetricCard",
            props: {
              label: "Conversion Rate",
              value: 3.2,
              format: "percent",
              trend: { direction: "down", value: 1.2 },
              comparison: "vs. same period last year",
            },
          },
        },
        {
          span: 8,
          spec: {
            component: "ChartCard",
            props: {
              title: "Revenue by Region",
              type: "bar",
              data: [
                { label: "NA", value: 875000 },
                { label: "EMEA", value: 742000 },
                { label: "APAC", value: 688000 },
                { label: "LATAM", value: 326000 },
                { label: "DACH", value: 415000 },
              ],
              format: "currency",
              sort: "desc",
              showLabels: true,
            },
          },
        },
        {
          span: 4,
          spec: {
            component: "DonutChart",
            props: {
              title: "Revenue Split",
              data: [
                { label: "NA", value: 875000 },
                { label: "EMEA", value: 742000 },
                { label: "APAC", value: 688000 },
                { label: "LATAM", value: 326000 },
                { label: "DACH", value: 415000 },
              ],
              format: "currency",
            },
          },
        },
        {
          span: 6,
          spec: {
            component: "DataTable",
            props: {
              dataRef: "query.revenue_by_region",
              columns: [
                { key: "region", label: "Region", type: "string" },
                { key: "revenue", label: "Revenue", type: "currency" },
              ],
              pageSize: 25,
              emptyState: "No revenue data for this period",
            },
          },
        },
        {
          span: 3,
          spec: {
            component: "Leaderboard",
            props: {
              title: "Top Regions",
              items: [
                { label: "North America", value: 875000, trend: "up" },
                { label: "EMEA", value: 742000, trend: "up" },
                { label: "APAC", value: 688000, trend: "flat" },
                { label: "LATAM", value: 326000, trend: "down" },
                { label: "DACH", value: 415000, trend: "up" },
              ],
              format: "currency",
            },
          },
        },
        {
          span: 3,
          spec: {
            component: "ProgressBar",
            props: {
              label: "Q4 Goal Progress",
              value: 1284500,
              max: 2000000,
              format: "currency",
            },
          },
        },
      ],
    },
  },
] satisfies z.input<typeof DashboardGridSpec>[];

const fourRowSpecs: z.input<typeof DashboardGridSpec>[] = structuredClone(specs);
fourRowSpecs[0].props.children.push({
  span: 12,
  spec: {
    component: "ChartCard",
    props: {
      title: "Fourth Row — Quarterly Revenue",
      type: "line",
      format: "currency",
      sort: "none",
      data: [
        { label: "Q1", value: 875000 },
        { label: "Q2", value: 1040000 },
        { label: "Q3", value: 1190000 },
        { label: "Q4", value: 1284500 },
      ],
    },
  },
});
const fixedSpecs: z.input<typeof DashboardGridSpec>[] = structuredClone(fourRowSpecs);
fixedSpecs[0].props.height = "500px";

// All demo inputs remain MCP-reachable. Defensive inputs live only in renderer tests.
const donutFixtures = [
  { name: "donut-50-50", title: "Equal Halves", values: [50, 50] },
  { name: "donut-three-unequal", title: "Three Unequal Slices", values: [20, 30, 50] },
].map(({ name, title, values }) => ({
  name,
  specs: [{
    component: "DashboardGrid",
    props: {
      children: [{
        span: 12,
        spec: {
          component: "DonutChart",
          props: {
            title,
            format: "percent",
            data: values.map((value, index) => ({ label: `Category ${index + 1}`, value })),
          },
        },
      }],
    },
  }] satisfies z.input<typeof DashboardGridSpec>[],
}));
const paginationSpecs = [{
  component: "DashboardGrid",
  props: {
    children: [{
      span: 12,
      spec: {
        component: "DataTable",
        props: {
          dataRef: "query.revenue_by_region",
          columns: [
            { key: "region", label: "Region", type: "string" },
            { key: "revenue", label: "Revenue", type: "currency" },
          ],
          pageSize: 10,
        },
      },
    }],
  },
}] satisfies z.input<typeof DashboardGridSpec>[];
const previews: {
  name: string;
  specs: z.input<typeof DashboardGridSpec>[];
  fixtures?: Record<string, unknown[]>;
}[] = [
  { name: "preview", specs },
  { name: "dashboard-four-rows-no-height", specs: fourRowSpecs },
  { name: "dashboard-four-rows-fixed", specs: fixedSpecs },
  ...donutFixtures,
  { name: "table-pagination", specs: paginationSpecs },
  {
    name: "table-single-page",
    specs: paginationSpecs,
    fixtures: { ...fixtures, "query.revenue_by_region": fixtures["query.revenue_by_region"].slice(0, 5) },
  },
];
const outputDir = join(repoRoot, "examples", "out");
mkdirSync(outputDir, { recursive: true });
const outputPaths: string[] = [];

for (const brand of [lightBrand, darkBrand]) {
  for (const preview of previews) {
    const html = renderShell(preview.specs, brand, preview.fixtures ?? fixtures);
    const outputPath = join(outputDir, `${preview.name}-${brand.mode}.html`);
    writeFileSync(outputPath, html, "utf-8");
    outputPaths.push(outputPath);
  }
}

// This is a top-level MCP request: mode is alongside specs and brandId, not a component prop.
const darkRequest = { specs: fourRowSpecs, brandId: "__default_from_spec__", mode: "dark" as const };
const fromSpecBrand = loadBrandById(darkRequest.brandId, darkRequest.mode);
if (fromSpecBrand.mode !== "dark") throw new Error("The mode fixture must use the dark fallback.");
const fromSpecPath = join(outputDir, "dashboard-four-rows-no-height-dark-from-spec.html");
writeFileSync(fromSpecPath, renderShell(darkRequest.specs, fromSpecBrand, fixtures), "utf-8");
outputPaths.push(fromSpecPath);

console.log(outputPaths.map((path) => `Preview written to ${path}`).join("\n"));
