import { cp } from "node:fs/promises";

await cp(
  new URL("../src/fixtures/", import.meta.url),
  new URL("../dist/fixtures/", import.meta.url),
  { recursive: true },
);
