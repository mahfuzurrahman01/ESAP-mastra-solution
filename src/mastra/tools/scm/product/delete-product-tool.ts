import { z } from "zod";
import { createTool } from "@mastra/core";

const deleteProductTool = createTool({
  id: "delete-product",
  description: "Delete a product from the system by ID",
  inputSchema: z.object({
    id: z.number().describe("Product ID to delete (required)"),
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
        product_id: z.number(),
        message: z.string().optional(),
      }),
    }),
  }),
  execute: async ({ context }) => {
    // Define input fields with requirements
    const inputFields = [
      {
        name: "id",
        required: true,
        description: "Product ID to delete",
        provided: !!context.id,
      },
    ];

    // Check for required fields
    if (!context.id) {
      return {
        tool_name: "deleteProductTool",
        tool_called: true,
        assistant_response: "Product ID is required to delete a product",
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: ["id"],
          input_fields: inputFields,
          data: {
            deleted: false,
            product_id: 0,
            message: "Product ID is required",
          },
        },
      };
    }

    try {
      // First, check if the product exists
      try {
        await getProduct(context.id);
      } catch (error) {
        return {
          tool_name: "deleteProductTool",
          tool_called: true,
          assistant_response: `Product with ID ${context.id} not found.`,
          tool_output: {
            status: "error",
            status_code: 404,
            required_fields_status: false,
            required_fields: [],
            input_fields: inputFields,
            data: {
              deleted: false,
              product_id: context.id,
              message: `Product with ID ${context.id} not found`,
            },
          },
        };
      }

      // Delete the product
      const result = await deleteProduct(context.id);

      console.log("Delete result:", result);

      return {
        tool_name: "deleteProductTool",
        tool_called: true,
        assistant_response: `Product with ID ${context.id} deleted successfully`,
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: true,
            product_id: context.id,
            message: `Product with ID ${context.id} deleted successfully`,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "deleteProductTool",
        tool_called: true,
        assistant_response: `Failed to delete product: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: false,
            product_id: context.id,
            message: error.message,
          },
        },
      };
    }
  },
});

const deleteProduct = async (id: number) => {
  console.log(`Deleting product with ID: ${id}`);
  const url = `https://esapdev.xyz:7005/api/v1/product/delete-product/${id}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6IjcxOTU3YzM1LWMzNGQtNDcxZC04NGNjLWRiZDA2YzczZTFiMyIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDc0OTkyMzgsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.S7DQV34sTqgCMR-r4HrXaKNdYR_IlVydJDw4VO8myKc`,
        "Content-Type": "application/json",
      },
    });

    console.log("Delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to delete product: ${response.statusText} (${response.status})`
      );
    }

    // Try to parse response as JSON if possible
    try {
      const responseText = await response.text();
      if (responseText) {
        return JSON.parse(responseText);
      }
      return { success: true };
    } catch (e) {
      // If parsing fails, return a success object
      return { success: true };
    }
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};

const getProduct = async (id: number) => {
  console.log(`Getting product with ID: ${id}`);
  const url = `https://esapdev.xyz:7005/api/v1/product/${id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6IjcxOTU3YzM1LWMzNGQtNDcxZC04NGNjLWRiZDA2YzczZTFiMyIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDc0OTkyMzgsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.S7DQV34sTqgCMR-r4HrXaKNdYR_IlVydJDw4VO8myKc`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get product: ${response.statusText} (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};

export default deleteProductTool;
