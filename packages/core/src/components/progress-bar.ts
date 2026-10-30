import { z } from "zod";

export const ProgressBarSpec = z.object({
  component: z.literal("ProgressBar"),
  props: z.object({
    label: z.string(),
    value: z.number(),
    max: z.number().positive(),
    format: z.enum(["currency", "percent", "number"]).default("percent"),
    showValue: z.boolean().default(true),
  }),
});

export type ProgressBarSpec = z.infer<typeof ProgressBarSpec>;

export const progressBarContract = {
  name: "ProgressBar" as const,
  spec: ProgressBarSpec,
  tokenBudget: 80,
  brandDeps: [
    "color.surface", "color.text", "color.border", "color.accent", "space.*", "font.body",
  ],
  description:
    "Render a labeled progress bar showing value against a maximum. Compact component for single-value goals.",
  example: {
    component: "ProgressBar",
    props: {
      label: "Q4 Goal Progress",
      value: 1284500,
      max: 2000000,
      format: "currency",
      showValue: true,
    },
  } satisfies ProgressBarSpec,
};

export type ProgressBarContract = typeof progressBarContract;
