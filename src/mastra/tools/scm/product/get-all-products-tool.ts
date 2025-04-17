import { createTool } from "@mastra/core";
import { z } from "zod";
import { ProductSchema } from "../../../../schema/scm/product.schema";
import { getAllDataSchema } from "../../../../schema/common/index.schema";

export const getAllProductsTool = createTool({
  id: "get-all-products",
  description: "Get all products from the system",
  inputSchema: z.object({
    pageIndex: z.number().optional().describe("Page number (starts from 1)"),
    pageSize: z.number().optional().describe("Number of items per page"),
  }),
  outputSchema: getAllDataSchema.extend({
    data: z.object({
      pageIndex: z.number(),
      pageSize: z.number(),
      count: z.number(),
      products: z.array(ProductSchema),
    }),
  }),
  execute: async ({ context }) => {
    const pageIndex = context.pageIndex || 1;
    const pageSize = context.pageSize || 10;

    const inputFields = [
      {
        name: "pageIndex",
        required: false,
        description: "Page number (starts from 1)",
        provided: !!context.pageIndex,
      },
      {
        name: "pageSize",
        required: false,
        description: "Number of items per page",
        provided: !!context.pageSize,
      },
    ];

    try {
      const result = await getAllProducts(pageIndex, pageSize);

      return {
        tool_name: "getAllProductsTool",
        tool_called: true,
        assistant_response: "Product information fetched successfully",
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            pageIndex: result.pageIndex,
            pageSize: result.pageSize,
            count: result.count,
            products: result.data,
          },
        },
        data: {
          pageIndex: result.pageIndex,
          pageSize: result.pageSize,
          count: result.count,
          products: result.data,
        }
      };
    } catch (error) {
      return {
        tool_name: "getAllProductsTool",
        tool_called: true,
        assistant_response: `Failed to fetch product information: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            pageIndex,
            pageSize,
            count: 0,
            products: [],
          },
        },
        data: {
          pageIndex,
          pageSize,
          count: 0,
          products: [],
        }
      };
    }
  },
});

const getAllProducts = async (
  pageIndex: number = 1,
  pageSize: number = 10
) => {
  const url = `https://esapdev.xyz:7005/api/v1/product/get-product-list?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6IjcxOTU3YzM1LWMzNGQtNDcxZC04NGNjLWRiZDA2YzczZTFiMyIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDc0OTkyMzgsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.S7DQV34sTqgCMR-r4HrXaKNdYR_IlVydJDw4VO8myKc`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return await response.json();
};
