import { z } from "zod";
import { z as z3 } from "zod/v3";
import { zodToJsonSchema as convertZod3Schema } from "zod-to-json-schema";

export function zodToJsonSchema(spec: z.ZodType) {
  // The converter requires a Zod 3 root. Its override hook exports our Zod 4
  // contracts without changing core or casting incompatible schema types.
  return convertZod3Schema(z3.unknown(), {
    override: () => z.toJSONSchema(spec, { target: "draft-7", io: "input" }),
  });
}
