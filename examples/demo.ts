import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { z } from "zod";
import { DashboardGridSpec, loadBrand } from "../packages/core/src/index.js";
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

const outputDir = join(repoRoot, "examples", "out");
mkdirSync(outputDir, { recursive: true });

for (const brand of [lightBrand, darkBrand]) {
  const html = renderShell(specs, brand, fixtures);
  writeFileSync(join(outputDir, `preview-${brand.mode}.html`), html, "utf-8");
}

console.log("Preview written to examples/out/preview-light.html");
console.log("Preview written to examples/out/preview-dark.html");
