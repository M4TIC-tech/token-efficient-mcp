import type { ZodType } from "zod";
import { dataTableContract } from "./components/data-table.js";
import { metricCardContract } from "./components/metric-card.js";
import { chartCardContract } from "./components/chart-card.js";
import { dashboardGridContract } from "./components/dashboard-grid.js";

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
  chartCardContract,
  dashboardGridContract,
] satisfies ComponentContract[];
