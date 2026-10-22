import type { BrandConfig } from "./brand.js";
import { contracts } from "./contracts.js";

export function estimateTokens(value: unknown): number {
  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new Error("Cannot estimate tokens: JSON.stringify returned undefined.");
  }

  return Math.ceil(serialized.length / 4);
}

export function validateSpec(
  specs: unknown[],
  brand: BrandConfig,
): {
  ok: boolean;
  errors: string[];
  estimatedTokens: number;
  brandViolations: string[];
} {
  const errors: string[] = [];

  for (const spec of specs) {
    const component =
      typeof spec === "object" && spec !== null && "component" in spec
        ? spec.component
        : undefined;
    const contract = contracts.find((entry) => entry.name === component);

    if (!contract) {
      errors.push(`Unknown component: ${String(component)}`);
      continue;
    }

    const result = contract.spec.safeParse(spec);

    if (!result.success) {
      errors.push(
        `${component} spec invalid: ${JSON.stringify(result.error.flatten())}`,
      );
    }
  }

  const estimatedTokens = estimateTokens(specs);
  // TODO: brand tokens are enforced at render time; violations cannot occur here
  const brandViolations: string[] = [];

  return {
    ok: errors.length === 0,
    errors,
    estimatedTokens,
    brandViolations,
  };
}
