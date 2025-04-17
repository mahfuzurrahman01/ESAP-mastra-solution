import { createTool } from "@mastra/core";
import { z } from "zod";
import { CarrierSchema } from "../../../../schema/scm/carrier.schema";

interface FileData {
  type: string;
  size: number;
  name: string;
}

const postCarrierTool = createTool({
  id: "post-carrier",
  description: "Create a new carrier",
  inputSchema: CarrierSchema,
  outputSchema: CarrierSchema,
  execute: async ({ context }) => {
    return await postCarrier(context);
  },
});

const postCarrier = async (carrierData: z.infer<typeof CarrierSchema>) => {
  const url = `https://esapdev.xyz:7005/api/v1/carrier/save-carrier`;

  // Check if there are any file fields that need FormData
  const hasFiles = Object.values(carrierData).some(
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

    appendToFormData(carrierData);

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
      body: JSON.stringify(carrierData),
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to create carrier: ${response.statusText}`);
  }

  return await response.json();
};

export { postCarrierTool };
