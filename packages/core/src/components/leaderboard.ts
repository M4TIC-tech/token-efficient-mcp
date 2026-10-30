import { z } from "zod";

export const LeaderboardSpec = z.object({
  component: z.literal("Leaderboard"),
  props: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      label: z.string(),
      value: z.number(),
      trend: z.enum(["up", "down", "flat"]).optional(),
    })).min(1).max(20),
    format: z.enum(["currency", "percent", "number"]).default("number"),
    showRank: z.boolean().default(true),
  }),
});

export type LeaderboardSpec = z.infer<typeof LeaderboardSpec>;

export const leaderboardContract = {
  name: "Leaderboard" as const,
  spec: LeaderboardSpec,
  tokenBudget: 180,
  brandDeps: [
    "color.surface", "color.text", "color.border", "color.accent", "color.muted",
    "space.*", "font.body", "font.heading",
  ],
  description:
    "Render a ranked list of items with values and optional trends. Ideal for top-N lists.",
  example: {
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
      showRank: true,
    },
  } satisfies LeaderboardSpec,
};

export type LeaderboardContract = typeof leaderboardContract;
