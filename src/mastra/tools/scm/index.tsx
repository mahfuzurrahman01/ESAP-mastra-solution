import { createTool } from "@mastra/core";
import { z } from "zod";
import { CreateSupplierSchema } from "../../../schema/scm/supplier.schema";

const supplierTool = createTool({
    id: "get-all-suppliers",
    description: "Get all suppliers from the system",
    inputSchema: z.object({
        pageIndex: z.number().optional().describe("Page number (starts from 1)"),
        pageSize: z.number().optional().describe("Number of items per page"),
    }),
    outputSchema: z.object({
        pageIndex: z.number(),
        pageSize: z.number(),
        count: z.number(),
        data: z.array(CreateSupplierSchema),
    }),
    execute: async ({ context }) => {
        const pageIndex = context.pageIndex || 1;
        const pageSize = context.pageSize || 10;

        return await getAllSuppliers(pageIndex, pageSize);
    },
});

const getAllSuppliers = async (
    pageIndex: number = 1,
    pageSize: number = 10
) => {
    const url = `https://esapdev.xyz:7005/api/v1/supplier/get-supplier-list?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    const response = await fetch(url, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
    }

    return await response.json();
};

export { supplierTool };