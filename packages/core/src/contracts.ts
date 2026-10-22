import type { ZodType } from "zod";
import { dataTableContract } from "./components/data-table.js";
import { metricCardContract } from "./components/metric-card.js";

export type ComponentContract = {
  name: string;
  tokenBudget: number;
  brandDeps: string[];
  description: string;
  spec: ZodType;
};

export const contracts = [
  dataTableContract,
  metricCardContract,
] satisfies ComponentContract[];
