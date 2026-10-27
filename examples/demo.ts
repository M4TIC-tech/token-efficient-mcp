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
  {
    component: "MetricCard",
    props: {
      label: "Total Revenue",
      value: 1284500,
      format: "currency",
      trend: { direction: "up", value: 12.4 },
      comparison: "vs. same period last year",
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
