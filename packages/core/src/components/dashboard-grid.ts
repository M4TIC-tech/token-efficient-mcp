import { z } from "zod";
import { MetricCardSpec } from "./metric-card.js";
import { DataTableSpec } from "./data-table.js";
import { ChartCardSpec } from "./chart-card.js";

export const DashboardGridSpec = z.object({
  component: z.literal("DashboardGrid"),
  props: z.object({
    gap: z.enum(["sm", "md", "lg"]).default("md"),
    height: z.string().optional().describe("Optional preferred desktop height, constrained to the available viewport."),
    rows: z.string().optional().describe("Optional CSS grid-template-rows override; a first row containing only metrics fits content, and all other rows share available height. A single row fills the available height."),
    children: z.array(z.object({
      span: z.number().int().min(1).max(12).default(12),
      spec: z.union([MetricCardSpec, DataTableSpec, ChartCardSpec]),
    })).min(1).max(20),
  }),
});

export type DashboardGridSpec = z.infer<typeof DashboardGridSpec>;

export const dashboardGridContract = {
  name: "DashboardGrid" as const,
  spec: DashboardGridSpec,
  tokenBudget: 150,
  brandDeps: ["space.*"],
  description:
    "A fluid 12-column CSS grid layout container. The first row fits content when it contains only metrics; other rows share available viewport height. A single row fills available height. Assign spans (1-12); metric spans are capped at 4. Optionally override rows with CSS grid-template-rows syntax. Collapses to a single column on mobile.",
  example: {
    component: "DashboardGrid",
    props: {
      gap: "md",
      children: [
        {
          span: 4,
          spec: {
            component: "MetricCard",
            props: { label: "Total Revenue", value: 1284500, format: "currency" },
          },
        },
        {
          span: 4,
          spec: {
            component: "MetricCard",
            props: { label: "Average Deal Size", value: 48200, format: "currency", trend: { direction: "flat" } },
          },
        },
        {
          span: 12,
          spec: {
            component: "DataTable",
            props: {
              dataRef: "query.revenue_by_region",
              columns: [
                { key: "region", label: "Region", type: "string", sortable: true },
                { key: "revenue", label: "Revenue", type: "currency", sortable: true },
              ],
              pageSize: 25,
              filterable: false,
              exportable: false,
            },
          },
        },
      ],
    },
  } satisfies z.input<typeof DashboardGridSpec>,
};

export type DashboardGridContract = typeof dashboardGridContract;
