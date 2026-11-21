import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BrandConfig, baseTheme, loadBrand, mergeBrand, type BaseMode } from "@m4tic/core";

// Local overrides use the client's cwd. Only a source checkout uses module-relative
// examples; installed packages rely on the base themes shipped by @m4tic/core.
const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));
const workspaceExamples = existsSync(join(workspaceRoot, "pnpm-workspace.yaml"))
  ? join(workspaceRoot, "examples")
  : undefined;

export function loadBrandById(brandId: string, mode?: BaseMode) {
  const filename = brandId.endsWith(".json") ? brandId : `${brandId}.json`;
  const candidates = [resolve(brandId), resolve(filename)];

  if (basename(filename) === filename) {
    candidates.push(resolve("examples", "brand-configs", filename));
    if (workspaceExamples) {
      candidates.push(join(workspaceExamples, "brand-configs", filename));
    }
  }

  const path = candidates.find((candidate) => existsSync(candidate));
  // A present but invalid config still reports its error instead of being ignored.
  if (path) return loadBrand(path);

  const requestedMode = mode ?? "light";
  // Select the coherent base shipped by core, also when running outside a checkout.
  const base = requestedMode === "dark"
    ? BrandConfig.parse(JSON.parse(readFileSync(
        new URL("./base-dark.json", import.meta.resolve("@m4tic/core")), "utf-8",
      )))
    : baseTheme;
  return mergeBrand(base, { id: brandId, mode: requestedMode });
}

export function loadFixtures(): Record<string, unknown[]> {
  const localPath = resolve("examples", "fixtures", "revenue.json");
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, "utf-8"));
  }

  // Works beside src/resources.ts in development and dist/index.js after bundling.
  const bundledPath = fileURLToPath(new URL("./fixtures/revenue.json", import.meta.url));
  if (existsSync(bundledPath)) {
    console.error(`[dashboard-kit] Using bundled fixtures: ${bundledPath}`);
    return JSON.parse(readFileSync(bundledPath, "utf-8"));
  }

  return {};
}
