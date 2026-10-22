import { readFileSync } from "node:fs";
import { z } from "zod";

export const BrandConfig = z.object({
  id: z.string(),
  colors: z.object({
    surface: z.string(),
    text: z.string(),
    border: z.string(),
    accent: z.string(),
    muted: z.string(),
  }),
  fonts: z.object({
    body: z.string(),
    heading: z.string(),
  }),
  spacing: z.record(z.string(), z.string()),
  radius: z.record(z.string(), z.string()),
});

export type BrandConfig = z.infer<typeof BrandConfig>;

/**
 * Reads and validates a brand config from a JSON file.
 * @throws If the file is missing, contains invalid JSON, or fails schema validation.
 */
export function loadBrand(path: string): BrandConfig {
  const result = BrandConfig.safeParse(JSON.parse(readFileSync(path, "utf-8")));

  if (!result.success) {
    throw new Error(
      `Invalid brand config at ${path}: ${JSON.stringify(result.error.flatten())}`,
    );
  }

  return result.data;
}
