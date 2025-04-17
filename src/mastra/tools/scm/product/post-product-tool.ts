import { createTool } from "@mastra/core";
import { z } from "zod";
import { productSchema } from "../../../../schema/scm/product.schema";
import { createDataSchema } from "../../../../schema/common/index.schema";

const postProductTool = createTool({
  id: "post-product",
  description: "Create a new product",
  inputSchema: productSchema,
  outputSchema: createDataSchema.extend({
    data: z.object({
      product: productSchema.nullable(),
    }),
  }),
  execute: async ({ context }) => {
    // Define all input fields with their requirements
    const inputFields = Object.entries(productSchema.shape).map(([key, schema]) => ({
      name: key,
      required: !schema.isOptional(),
      description: schema.description || `Product ${key}`,
      provided: context[key] !== undefined && context[key] !== null,
    }));

    // Check for required fields
    const missingRequiredFields = inputFields
      .filter((field) => field.required && !field.provided)
      .map((field) => field.name);

    if (missingRequiredFields.length > 0) {
      return {
        tool_name: "postProductTool",
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
          },
        },
        data: {
          product: null as z.infer<typeof productSchema> | null,
        }
      };
    }

    try {
      const result = await postProduct(context);

      return {
        tool_name: "postProductTool",
        tool_called: true,
        assistant_response: "Product created successfully",
        tool_output: {
          status: "success",
          status_code: 201,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            product: result,
          },
        },
        data: {
          product: result as z.infer<typeof productSchema>,
        }
      };
    } catch (error) {
      return {
        tool_name: "postProductTool",
        tool_called: true,
        assistant_response: `Failed to create product: ${error.message}`,
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
        data: {
          product: null as z.infer<typeof productSchema> | null,
        }
      };
    }
  },
});

const postProduct = async (productData: z.infer<typeof productSchema>) => {
  const url = `https://esapdev.xyz:7005/api/v1/product/save-product`;

  // Handle FormData submission
  const formData = new FormData();

  // Add each field to the form data
  Object.keys(productData).forEach((key) => {
    if (productData[key] !== null && productData[key] !== undefined) {
      formData.append(key, productData[key].toString());
    }
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6IjcxOTU3YzM1LWMzNGQtNDcxZC04NGNjLWRiZDA2YzczZTFiMyIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDc0OTkyMzgsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.S7DQV34sTqgCMR-r4HrXaKNdYR_IlVydJDw4VO8myKc`,
        // Don't set Content-Type when using FormData - the browser will set it automatically with the boundary
      },
      body: formData,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to create product: ${response.statusText} (${response.status})`
      );
    }

    const result = await response.json();
    console.log("API response:", JSON.stringify(result, null, 2));
    return result;
    
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};

export { postProductTool };
