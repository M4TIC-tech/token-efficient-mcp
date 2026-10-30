import { z } from "zod";

export const DataTableSpec = z.object({
  component: z.literal("DataTable"),
  props: z.object({
    dataRef: z.string(),
    columns: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          type: z.enum(["string", "number", "date", "currency", "boolean"]),
          sortable: z.boolean().default(true),
          align: z.enum(["left", "right", "center"]).optional()
            .describe("Defaults to right for number/currency columns, left otherwise."),
        }),
      )
      .min(1)
      .max(20),
    pageSize: z.number().int().positive().max(100).default(25),
    maxHeight: z.number().int().positive().optional(),
    filterable: z.boolean().default(false),
    exportable: z.boolean().default(false),
    emptyState: z.string().optional(),
  }),
});

export type DataTableSpec = z.infer<typeof DataTableSpec>;

export const dataTableContract = {
  name: "DataTable" as const,
  spec: DataTableSpec,
  tokenBudget: 180,
  brandDeps: [
    "color.surface",
    "color.text",
    "color.border",
    "space.*",
    "font.body",
    "font.heading",
  ],
  description:
    "Render a sortable, paginated table from a data reference. Number and currency columns default to right alignment. Never inline rows.",
  example: {
    component: "DataTable",
    props: {
      dataRef: "query.revenue_by_region",
      columns: [
        { key: "region", label: "Region", type: "string", sortable: true },
        { key: "revenue", label: "Revenue", type: "currency", sortable: true },
      ],
      pageSize: 25,
      filterable: false,
      exportable: false,
    },
  } satisfies z.input<typeof DataTableSpec>,
};

export type DataTableContract = typeof dataTableContract;
