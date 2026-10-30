import { z } from "zod";

export const DonutChartSpec = z.object({
  component: z.literal("DonutChart"),
  props: z.object({
    title: z.string().optional(),
    data: z.array(z.object({ label: z.string(), value: z.number().positive() })).min(2).max(6),
    format: z.enum(["currency", "percent", "number"]).default("number"),
    showLegend: z.boolean().default(true),
  }),
});

export type DonutChartSpec = z.infer<typeof DonutChartSpec>;

export const donutChartContract = {
  name: "DonutChart" as const,
  spec: DonutChartSpec,
  tokenBudget: 200,
  brandDeps: [
    "color.surface", "color.text", "color.border", "color.accent", "color.muted",
    "space.*", "font.body", "font.heading",
  ],
  description:
    "Render a donut chart from 2-6 positive values. Best for categorical proportions. The server renders the SVG and legend; the agent never writes SVG.",
  example: {
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
      showLegend: true,
    },
  } satisfies DonutChartSpec,
};

export type DonutChartContract = typeof donutChartContract;
