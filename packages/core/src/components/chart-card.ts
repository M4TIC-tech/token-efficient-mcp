import { z } from "zod";

export const ChartCardSpec = z.object({
  component: z.literal("ChartCard"),
  props: z.object({
    title: z.string().optional(),
    type: z.enum(["bar", "line"]),
    data: z
      .array(z.object({ label: z.string(), value: z.number() }))
      .min(1)
      .max(50),
    height: z.number().int().positive().max(600).default(400),
    format: z.enum(["currency", "percent", "number"]).default("number"),
    sort: z.enum(["none", "asc", "desc"]).default("desc"),
    showLabels: z.boolean().default(true),
  }),
});

export type ChartCardSpec = z.infer<typeof ChartCardSpec>;

export const chartCardContract = {
  name: "ChartCard" as const,
  spec: ChartCardSpec,
  tokenBudget: 250,
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
    "Render a bar or line chart from a data array as inline SVG. Never inline large datasets — cap at 50 points.",
  example: {
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
      height: 400,
      format: "currency",
      sort: "desc",
      showLabels: true,
    },
  } satisfies ChartCardSpec,
};

export type ChartCardContract = typeof chartCardContract;
