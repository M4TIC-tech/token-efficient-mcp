import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  // loadBrand resolves these JSON assets beside the compiled module.
  onSuccess: async () => {
    for (const mode of ["light", "dark"]) {
      await copyFile(
        new URL(`./src/base-${mode}.json`, import.meta.url),
        new URL(`./dist/base-${mode}.json`, import.meta.url),
      );
    }
  },
});
