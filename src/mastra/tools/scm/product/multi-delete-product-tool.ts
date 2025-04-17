import { z } from "zod";
import { createTool } from "@mastra/core";

const multiDeleteProductsTool = createTool({
  id: "multi-delete-products",
  description:
    "Delete multiple products from the system by providing an array of product IDs",
  inputSchema: z.object({
    ids: z
      .array(z.number())
      .describe("Array of product IDs to delete (required)"),
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
      input_fields: z.array(
        z.object({
          name: z.string(),
          required: z.boolean(),
          description: z.string(),
          provided: z.boolean(),
        })
      ),
      data: z.object({
        deleted: z.boolean(),
        product_ids: z.array(z.number()),
        successful_deletions: z.array(z.number()).optional(),
        failed_deletions: z.array(z.number()).optional(),
        message: z.string().optional(),
      }),
    }),
  }),
  execute: async ({ context }) => {
    // Define input fields with requirements
    const inputFields = [
      {
        name: "ids",
        required: true,
        description: "Array of product IDs to delete",
        provided: Array.isArray(context.ids) && context.ids.length > 0,
      },
    ];

    // Check for required fields
    if (
      !context.ids ||
      !Array.isArray(context.ids) ||
      context.ids.length === 0
    ) {
      return {
        tool_name: "deleteProductsTool",
        tool_called: true,
        assistant_response:
          "At least one product ID is required to delete products",
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: ["ids"],
          input_fields: inputFields,
          data: {
            deleted: false,
            product_ids: [],
            message: "At least one product ID is required",
          },
        },
      };
    }

    try {
      // Delete the products
      const result = await deleteProducts(context.ids);

      return {
        tool_name: "deleteProductsTool",
        tool_called: true,
        assistant_response: `${result.successful_deletions.length} products deleted successfully`,
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: result.successful_deletions.length > 0,
            product_ids: context.ids,
            successful_deletions: result.successful_deletions,
            failed_deletions: result.failed_deletions,
            message: `${result.successful_deletions.length} products deleted successfully, ${result.failed_deletions.length} deletions failed`,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "deleteProductsTool",
        tool_called: true,
        assistant_response: `Failed to delete products: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: false,
            product_ids: context.ids,
            message: error.message,
          },
        },
      };
    }
  },
});

const deleteProducts = async (ids: number[]) => {
  console.log(`Deleting products with IDs: ${ids.join(", ")}`);
  const url = `https://esapdev.xyz:7005/api/v1/product/delete-products`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6IjcxOTU3YzM1LWMzNGQtNDcxZC04NGNjLWRiZDA2YzczZTFiMyIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDc0OTkyMzgsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.S7DQV34sTqgCMR-r4HrXaKNdYR_IlVydJDw4VO8myKc`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to delete products: ${response.statusText} (${response.status})`
      );
    }

    // Try to parse response as JSON
    try {
      const responseText = await response.text();
      if (responseText) {
        const result = JSON.parse(responseText);
        return {
          successful_deletions: result.successful_deletions || ids,
          failed_deletions: result.failed_deletions || [],
        };
      }
      // If no response body, assume all were successful
      return {
        successful_deletions: ids,
        failed_deletions: [],
      };
    } catch (e) {
      // If parsing fails, assume all were successful
      return {
        successful_deletions: ids,
        failed_deletions: [],
      };
    }
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};

export default multiDeleteProductsTool;
