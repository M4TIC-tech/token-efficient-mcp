import { z } from "zod";
import { MetricCardSpec } from "./metric-card.js";
import { DataTableSpec } from "./data-table.js";
import { ChartCardSpec } from "./chart-card.js";

export const DashboardGridSpec = z.object({
  component: z.literal("DashboardGrid"),
  props: z.object({
    gap: z.enum(["sm", "md", "lg"]).default("md"),
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
    "A 12-column CSS grid layout container. Place components side-by-side by assigning a span (1-12) to each child. Collapses to a single column on mobile.",
  example: {
    component: "DashboardGrid",
    props: {
      gap: "md",
      children: [
        {
          span: 6,
          spec: {
            component: "MetricCard",
            props: { label: "Total Revenue", value: 1284500, format: "currency" },
          },
        },
        {
          span: 6,
          spec: {
            component: "MetricCard",
            props: { label: "Conversion Rate", value: 3.2, format: "percent" },
          },
        },
        {
          span: 12,
          spec: {
            component: "DataTable",
            props: {
              dataRef: "query.revenue_by_region",
              columns: [
                { key: "region", label: "Region", type: "string", sortable: true, align: "left" },
                { key: "revenue", label: "Revenue", type: "currency", sortable: true, align: "right" },
              ],
              pageSize: 25,
              filterable: false,
              exportable: false,
            },
          },
        },
      ],
    },
  } satisfies DashboardGridSpec,
};

export type DashboardGridContract = typeof dashboardGridContract;
