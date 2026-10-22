/**
 * Resolves data from the pilot's static fixture bundle.
 * Live connectors are out of scope.
 */
export function resolveDataRef(
  ref: string,
  fixtures: Record<string, unknown[]>,
): Record<string, unknown>[] {
  if (!Object.hasOwn(fixtures, ref)) {
    return [];
  }

  const rows = fixtures[ref];

  if (!Array.isArray(rows)) {
    throw new Error(`Fixture at ${ref} is not an array`);
  }

  return rows as Record<string, unknown>[];
}
