import { z } from "zod";

export const MetricCardSpec = z.object({
  component: z.literal("MetricCard"),
  props: z.object({
    label: z.string(),
    value: z.number(),
    format: z.enum(["currency", "percent", "number"]).default("number"),
    trend: z
      .object({
        direction: z.enum(["up", "down", "flat"]),
        value: z.number(),
      })
      .optional(),
    comparison: z.string().optional(),
  }),
});

export type MetricCardSpec = z.infer<typeof MetricCardSpec>;

export const metricCardContract = {
  name: "MetricCard" as const,
  spec: MetricCardSpec,
  tokenBudget: 120,
  brandDeps: [
    "color.surface",
    "color.text",
    "color.border",
    "color.accent",
    "color.muted",
    "space.*",
    "font.body",
    "font.heading",
  ],
  description:
    "Render a KPI card with a value, optional trend, and optional comparison text.",
  example: {
    component: "MetricCard",
    props: {
      label: "Revenue",
      value: 125000,
      format: "currency",
      trend: { direction: "up", value: 12.5 },
      comparison: "vs. previous period",
    },
  } satisfies MetricCardSpec,
};

export type MetricCardContract = typeof metricCardContract;
