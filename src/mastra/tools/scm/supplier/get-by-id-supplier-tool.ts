import { createTool } from "@mastra/core";
import { z } from "zod";
import { UpdateSupplierSchema } from "../../../../schema/scm/supplier.schema";

const getSupplierByIdTool = createTool({
  id: "get-supplier-get-by-id",
  description: "Get a supplier's profile by ID",
  inputSchema: z.object({
    supplierId: z.string().describe("The ID of the supplier to fetch"),
  }),
  outputSchema: UpdateSupplierSchema,
  execute: async ({ context }) => {
    const { supplierId } = context;
    return await getSupplierById(supplierId);
  },
});

const getSupplierById = async (supplierId: string) => {
  const url = `https://esapdev.xyz:7005/api/v1/supplier/${supplierId}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch supplier profile: ${response.statusText}`);
  }

  return await response.json();
};

export { getSupplierByIdTool };
