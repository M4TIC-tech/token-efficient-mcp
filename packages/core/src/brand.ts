import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { z } from "zod";

export const BrandConfig = z.object({
  id: z.string(),
  mode: z.enum(["light", "dark"]).optional(),
  colors: z
    .object({
      surface: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
      border: z.string().optional(),
      accent: z.string().optional(),
      muted: z.string().optional(),
      hover: z.string().optional(),
    })
    .optional(),
  fonts: z
    .object({
      body: z.string().optional(),
      heading: z.string().optional(),
    })
    .optional(),
  spacing: z.record(z.string(), z.string()).optional(),
  radius: z.record(z.string(), z.string()).optional(),
  shadows: z.record(z.string(), z.string()).optional(),
});

export type BrandConfig = z.infer<typeof BrandConfig>;
export type BaseMode = "light" | "dark";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeValue(base: unknown, override: unknown): unknown {
  if (!isRecord(base) || !isRecord(override)) {
    return structuredClone(override);
  }

  const merged = structuredClone(base);

  for (const [key, value] of Object.entries(override)) {
    // Define own keys directly so JSON keys cannot invoke prototype setters.
    Object.defineProperty(merged, key, {
      value: mergeValue(Object.hasOwn(base, key) ? base[key] : undefined, value),
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }

  return merged;
}

export function mergeBrand(base: BrandConfig, override: Partial<BrandConfig>): BrandConfig {
  return mergeValue(base, override) as BrandConfig;
}

function readBaseTheme(mode: BaseMode): BrandConfig {
  // Resolve the shipped theme beside this module, independently of the cwd.
  const path = new URL(`./base-${mode}.json`, import.meta.url);
  return BrandConfig.parse(JSON.parse(readFileSync(path, "utf-8")));
}

// Preserve the existing export as the default light base.
export const baseTheme = readBaseTheme("light");

/**
 * Merges a partial JSON brand config with its mode's base theme and validates it.
 * Omitted mode selects light; the returned brand always has an explicit mode.
 * If id is omitted, the file name without its extension supplies it.
 * @throws If the file is missing, contains invalid JSON, or fails schema validation.
 */
export function loadBrand(path: string): BrandConfig & { mode: BaseMode } {
  const userConfig = JSON.parse(readFileSync(path, "utf-8"));
  const requestedMode = isRecord(userConfig) ? userConfig.mode : undefined;
  const mode: BaseMode = requestedMode === "dark" ? "dark" : "light";
  const base = readBaseTheme(mode);
  const override = isRecord(userConfig)
    ? { id: basename(path, extname(path)), mode, ...userConfig }
    : userConfig;
  const result = BrandConfig.safeParse(mergeBrand(base, override));

  if (!result.success) {
    throw new Error(
      `Invalid brand config at ${path}: ${JSON.stringify(result.error.flatten())}`,
    );
  }

  return { ...result.data, mode };
}
