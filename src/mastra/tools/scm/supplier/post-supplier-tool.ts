import { createTool } from "@mastra/core";
import { z } from "zod";
import { SupplierSchema } from "../../../../schema/scm";

interface FileData {
  name: string;
  type: string;
  size: number;
  content?: string | ArrayBuffer;
}

const postSupplierTool = createTool({
  id: "post-supplier",
  description: "Create a new supplier",
  inputSchema: SupplierSchema,
  outputSchema: SupplierSchema,
  execute: async ({ context }) => {
    return await postSupplier(context);
  },
});

const postSupplier = async (supplierData: z.infer<typeof SupplierSchema>) => {
  const url = `https://esapdev.xyz:7005/api/v1/supplier/save-supplier`;
  
  // Check if there are any file fields that need FormData
  const hasFiles = Object.values(supplierData).some(value => 
    value && typeof value === 'object' && 'type' in value && 'size' in value && 'name' in value
  );

  let response;
  

  if (hasFiles) {
    // Handle FormData submission
    const formData = new FormData();
    
    // Convert nested object to FormData
    const appendToFormData = (data: any, prefix = '') => {
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && 'type' in value && 'size' in value && 'name' in value) {
          // This is a file object
          const fileData = value as FileData;
          const blob = new Blob([], { type: fileData.type });
          formData.append(prefix + key, blob, fileData.name);
        } else if (typeof value === 'object' && value !== null) {
          appendToFormData(value, `${prefix}${key}.`);
        } else if (value !== undefined) {
          formData.append(prefix + key, String(value));
        }
      }
    };

    appendToFormData(supplierData);

    response = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } else {
    // Handle JSON submission
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplierData),
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to create supplier: ${response.statusText}`);
  }

  return await response.json();
};

export { postSupplierTool };
