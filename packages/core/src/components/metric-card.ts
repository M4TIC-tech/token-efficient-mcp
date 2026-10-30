import { z } from "zod";

export const MetricCardSpec = z.object({
  component: z.literal("MetricCard"),
  props: z.object({
    label: z.string(),
    value: z.number(),
    format: z.enum(["currency", "percent", "number"]).default("number"),
    trend: z.object({
      direction: z.enum(["up", "down", "flat"]),
      value: z.number().optional(),
    }).optional(),
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
    "Render a KPI card with a value, optional trend, and optional comparison text. Trend values are optional; a flat trend without a value displays Flat.",
  example: {
    component: "MetricCard",
    props: {
      label: "Average Deal Size",
      value: 48200,
      format: "currency",
      trend: { direction: "flat" },
      comparison: "vs. previous period",
    },
  } satisfies MetricCardSpec,
};

export type MetricCardContract = typeof metricCardContract;
