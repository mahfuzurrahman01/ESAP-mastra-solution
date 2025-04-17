import { createTool } from "@mastra/core";
import { z } from "zod";
import { UpdateSupplierSchema } from "../../../../schema/scm/supplier.schema";

interface FileData {
  name: string;
  type: string;
  size: number;
  content?: string | ArrayBuffer;
}

const updateSupplierTool = createTool({
  id: "update-supplier",
  description: "Update an existing supplier",
  inputSchema: UpdateSupplierSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional(),
    data: UpdateSupplierSchema,
  }),
  execute: async ({ context }) => {
    return await updateSupplier(context);
  },
});

const updateSupplier = async (supplierData: z.infer<typeof UpdateSupplierSchema>) => {
  const url = `https://esapdev.xyz:7005/api/v1/supplier/update-supplier`;

  // Check if there are any file fields that need FormData
  const hasFiles = Object.values(supplierData).some(
    (value) =>
      value &&
      typeof value === "object" &&
      "type" in value &&
      "size" in value &&
      "name" in value
  );

  let response;

  if (hasFiles) {
    // Handle FormData submission
    const formData = new FormData();

    // Convert nested object to FormData
    const appendToFormData = (data: any, prefix = "") => {
      for (const [key, value] of Object.entries(data)) {
        if (
          value &&
          typeof value === "object" &&
          "type" in value &&
          "size" in value &&
          "name" in value
        ) {
          // This is a file object
          const fileData = value as FileData;
          const blob = new Blob([], { type: fileData.type });
          formData.append(prefix + key, blob, fileData.name);
        } else if (typeof value === "object" && value !== null) {
          appendToFormData(value, `${prefix}${key}.`);
        } else if (value !== undefined) {
          formData.append(prefix + key, String(value));
        }
      }
    };

    appendToFormData(supplierData);

    response = await fetch(url, {
      method: "PUT",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    // Handle JSON submission
    response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplierData),
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to update supplier: ${response.statusText}`);
  }

  return await response.json();
};

export { updateSupplierTool };
