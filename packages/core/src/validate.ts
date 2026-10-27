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

  function validateComponent(spec: unknown, path?: string): void {
    const component =
      typeof spec === "object" && spec !== null && "component" in spec
        ? spec.component
        : undefined;
    const contract = contracts.find((entry) => entry.name === component);

    if (!contract) {
      errors.push(`${path ? `${path}: ` : ""}Unknown component: ${String(component)}`);
      return;
    }

    const location = path ? `${path} (${component})` : String(component);
    const result = contract.spec.safeParse(spec);

    if (!result.success) {
      errors.push(
        `${location} spec invalid: ${JSON.stringify(result.error.flatten())}`,
      );
    }

    const props = typeof spec === "object" && spec !== null && "props" in spec
      ? spec.props
      : undefined;

    if (component === "DashboardGrid" && typeof props === "object" && props !== null &&
        "children" in props && Array.isArray(props.children)) {
      props.children.forEach((child: unknown, index: number) => {
        const childSpec = typeof child === "object" && child !== null && "spec" in child
          ? child.spec
          : undefined;
        validateComponent(childSpec, `${location} > child[${index}]`);
      });
    }
  }

  specs.forEach((spec) => validateComponent(spec));

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
