import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBrand } from "../packages/core/src/index.js";
import { renderShell } from "../packages/renderer-html/src/index.js";

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
              value: 24850,
              format: "currency",
              trend: { direction: "up", value: 4.8 },
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
      ],
    },
  },
  {
    component: "DashboardGrid",
    props: {
      gap: "md",
      height: "500px",
      children: [
        {
          span: 8,
          spec: {
            component: "ChartCard",
            props: {
              title: "Revenue by Region",
              type: "bar",
              data: [
  { label: "A", value: 1200000 },
  { label: "B", value: 950000 },
  { label: "C", value: 1500000 },
  { label: "D", value: 800000 },
  { label: "E", value: 1100000 },
  { label: "F", value: 600000 },
  { label: "G", value: 1400000 },
  { label: "H", value: 700000 },
  { label: "I", value: 1300000 },
  { label: "J", value: 900000 },
  { label: "K", value: 500000 },
  { label: "L", value: 1000000 }
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
            component: "DataTable",
            props: {
              dataRef: "query.revenue_by_region",
              columns: [
                { key: "region", label: "Region", type: "string", align: "left" },
                { key: "revenue", label: "Revenue", type: "currency", align: "right" },
              ],
              pageSize: 25,
              emptyState: "No revenue data for this period",
            },
          },
        },
      ],
    },
  },
];

const outputDir = join(repoRoot, "examples", "out");
mkdirSync(outputDir, { recursive: true });

for (const brand of [lightBrand, darkBrand]) {
  const html = renderShell(specs, brand, fixtures);
  writeFileSync(join(outputDir, `preview-${brand.mode}.html`), html, "utf-8");
}

console.log("Preview written to examples/out/preview-light.html");
console.log("Preview written to examples/out/preview-dark.html");
