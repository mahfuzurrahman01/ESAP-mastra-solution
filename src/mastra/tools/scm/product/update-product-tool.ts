import { createTool } from "@mastra/core";
import { z } from "zod";
import { updateProductSchema } from "../../../../schema/scm/product.schema";
import { getProductById } from "./get-by-id-product-tool";
import { updateDataSchema } from "../../../../schema/common/index.schema";

const updateProductTool = createTool({
  id: "update-product",
  description: "Update an existing product in the system",
  inputSchema: updateProductSchema,
  outputSchema: updateDataSchema.extend({
    data: z.object({
      product: updateProductSchema.nullable(),
      original_product: updateProductSchema.nullable(),
      updated_fields: z.array(z.string()).optional(),
    }),
  }),
  execute: async ({ context }) => {
    // Define all input fields with their requirements
    const inputFields = Object.entries(updateProductSchema.shape).map(
      ([key, schema]) => ({
        name: key,
        required: !schema.isOptional(),
        description: schema.description || `Product ${key}`,
        provided: context[key] !== undefined && context[key] !== null,
      })
    );

    // Check for required fields
    const missingRequiredFields = inputFields
      .filter((field) => field.required && !field.provided)
      .map((field) => field.name);

    if (missingRequiredFields.length > 0) {
      return {
        tool_name: "updateProductTool",
        tool_called: true,
        assistant_response: `Missing required fields: ${missingRequiredFields.join(", ")}`,
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: missingRequiredFields,
          input_fields: inputFields,
          data: {
            product: null,
            original_product: null,
            updated_fields: [],
          },
        },
        data: {
          product: null,
          original_product: null,
          updated_fields: [],
        },
      };
    }

    try {
      // First, fetch the current product data
      const currentProduct = await getProductById(context.id);

      if (!currentProduct) {
        return {
          tool_name: "updateProductTool",
          tool_called: true,
          assistant_response: `Product with ID ${context.id} not found.`,
          tool_output: {
            status: "error",
            status_code: 404,
            required_fields_status: false,
            required_fields: [],
            input_fields: inputFields,
            data: {
              product: null,
              original_product: null,
              updated_fields: [],
            },
          },
          data: {
            product: null,
            original_product: null,
            updated_fields: [],
          },
        };
      }

      // Check which fields are being updated
      const updatedFields = [];
      // Start with all current product data and then override with new values
      const updateData = { ...currentProduct };

      // Only update fields that were provided in the context
      Object.keys(context).forEach((key) => {
        if (key !== "id" && context[key] !== undefined) {
          updateData[key] = context[key];
          updatedFields.push(key as never);
        }
      });

      // If no fields to update, return the current product data
      if (updatedFields.length === 0) {
        return {
          tool_name: "updateProductTool",
          tool_called: true,
          assistant_response:
            "No fields were provided for update. Current product information returned.",
          tool_output: {
            status: "success",
            status_code: 200,
            required_fields_status: false,
            required_fields: [],
            input_fields: inputFields,
            data: {
              product: currentProduct,
              original_product: currentProduct,
              updated_fields: [],
            },
          },
          data: {
            product: currentProduct,
            original_product: currentProduct,
            updated_fields: [],
          },
        };
      }

      // Update the product with the merged data
      const result = await updateProduct(updateData);

      return {
        tool_name: "updateProductTool",
        tool_called: true,
        assistant_response: `Product updated successfully. Updated fields: ${updatedFields.join(", ")}`,
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            product: result,
            original_product: currentProduct,
            updated_fields: updatedFields,
          },
        },
        data: {
          product: result,
          original_product: currentProduct,
          updated_fields: updatedFields,
        },
      };
    } catch (error) {
      return {
        tool_name: "updateProductTool",
        tool_called: true,
        assistant_response: `Failed to update product: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            product: null,
            original_product: null,
            updated_fields: [],
          },
        },
        data: {
          product: null,
          original_product: null,
          updated_fields: [],
        },
      };
    }
  },
});

const updateProduct = async (productData) => {
  console.log(
    "Sending product update data to API:",
    JSON.stringify(productData, null, 2)
  );
  console.log(
    "Request URL:",
    `https://esapdev.xyz:7005/api/v1/product/update-product`
  );

  const url = `https://esapdev.xyz:7005/api/v1/product/update-product`;

  // Create FormData object for multipart/form-data request
  const formData = new FormData();

  // Add each field to the form data
  Object.keys(productData).forEach((key) => {
    if (productData[key] !== null && productData[key] !== undefined) {
      // Convert all values to strings
      formData.append(key, String(productData[key]));
    }
  });

  // Log the form data keys for debugging
  console.log("Sending as form-data with fields:", Object.keys(productData));

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6IjcxOTU3YzM1LWMzNGQtNDcxZC04NGNjLWRiZDA2YzczZTFiMyIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDc0OTkyMzgsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.S7DQV34sTqgCMR-r4HrXaKNdYR_IlVydJDw4VO8myKc`,
      },
      body: formData,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to update product: ${response.statusText} (${response.status})`
      );
    }

    // Try to parse as JSON if possible
    let result;
    try {
      const responseText = await response.text();
      result = JSON.parse(responseText);
    } catch (e) {
      // If parsing fails, fetch the product again to get the updated data
      result = await getProductById(productData.id);
    }

    return result;
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};

export { updateProductTool };
