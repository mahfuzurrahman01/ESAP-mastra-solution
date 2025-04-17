import { createTool } from "@mastra/core";
import { z } from "zod";
import { productSchema } from "../../../../schema/scm/product.schema";

const getProductByIdTool = createTool({
  id: "get-product-by-id",
  description: "Get product information by product ID",
  inputSchema: z.object({
    id: z.number().describe("Product ID to fetch details for"),
  }),
  outputSchema: z.object({
    tool_name: z.string(),
    tool_called: z.boolean(),
    assistant_response: z.string(),
    tool_output: z.object({
      status: z.string(),
      status_code: z.number(),
      required_fields_status: z.boolean(),
      required_fields: z.array(z.string()),
      input_fields: z
        .array(
          z.object({
            name: z.string(),
            required: z.boolean(),
            description: z.string(),
            provided: z.boolean(),
          })
        )
        .optional(),
      data: z.object({
        product: productSchema.nullable(),
      }),
    }),
  }),
  execute: async ({ context }) => {
    const id = context.id;

    const inputFields = [
      {
        name: "id",
        required: true,
        description: "Product ID to fetch details for",
        provided: !!id,
      },
    ];

    if (!id) {
      return {
        tool_name: "getProductByIdTool",
        tool_called: true,
        assistant_response: "Product ID is required to fetch product details",
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: ["id"],
          input_fields: inputFields,
          data: {
            product: null,
          },
        },
      };
    }

    try {
      const result = await getProductById(id);

      return {
        tool_name: "getProductByIdTool",
        tool_called: true,
        assistant_response: "Product information fetched successfully",
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            product: result,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "getProductByIdTool",
        tool_called: true,
        assistant_response: `Failed to fetch product information: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            product: null,
          },
        },
      };
    }
  },
});

const getProductById = async (id: number) => {
  const url = `https://esapdev.xyz:7005/api/v1/product/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6IjcxOTU3YzM1LWMzNGQtNDcxZC04NGNjLWRiZDA2YzczZTFiMyIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDc0OTkyMzgsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.S7DQV34sTqgCMR-r4HrXaKNdYR_IlVydJDw4VO8myKc`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return await response.json();
};

export { getProductByIdTool, getProductById };
