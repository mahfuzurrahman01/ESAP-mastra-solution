import { createTool } from "@mastra/core";
import { z } from "zod";
import { CreateSupplierSchema } from "../../../../schema/scm/supplier.schema";

interface FileData {
  name: string;
  type: string;
  size: number;
  content?: string | ArrayBuffer;
}

const postSupplierTool = createTool({
  id: "post-supplier",
  description: "Create a new supplier",
  inputSchema: CreateSupplierSchema,
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
        supplier: CreateSupplierSchema.nullable(),
      }),
    }),
  }),
  execute: async ({ context }) => {
    const inputFields = [
      {
        name: "firstName",
        required: true,
        description: "Supplier first name (required)",
        provided: !!context.firstName,
      },
      {
        name: "middleName",
        required: false,
        description: "Supplier middle name (optional)",
        provided: !!context.middleName,
      },
      {
        name: "lastName",
        required: true,
        description: "Supplier last name (required)",
        provided: !!context.lastName,
      },
      {
        name: "companyName",
        required: true,
        description: "Supplier company name (required)",
        provided: !!context.companyName,
      },
      {
        name: "companyWebsite",
        required: false,
        description: "Supplier company website (optional)",
        provided: !!context.companyWebsite,
      },
      {
        name: "companyAddress",
        required: false,
        description: "Supplier company address (optional)",
        provided: !!context.companyAddress,
      },
      {
        name: "street",
        required: false,
        description: "Supplier street (optional)",
        provided: !!context.street,
      },
      {
        name: "city",
        required: false,
        description: "Supplier city (optional)",
        provided: !!context.city,
      },
      {
        name: "state",
        required: false,
        description: "Supplier state (optional)",
        provided: !!context.state,
      },
      {
        name: "zipCode",
        required: false,
        description: "Supplier zip code (optional)",
        provided: !!context.zipCode,
      },
      {
        name: "contactNumber",
        required: true,
        description: "Supplier contact number (required)",
        provided: !!context.contactNumber,
      },
      {
        name: "contactEmail",
        required: true,
        description: "Supplier contact email (required)",
        provided: !!context.contactEmail,
      },
      {
        name: "avatarFile",
        required: false,
        description: "URL to supplier avatar image (optional)",
        provided: !!context.avatarFile,
      },
      {
        name: "supplierCategoryId",
        required: true,
        description: "Supplier category ID (required)",
        provided: !!context.supplierCategoryId,
      },
      {
        name: "countryId",
        required: true,
        description: "Supplier country ID (required)",
        provided: !!context.countryId,
      },
      {
        name: "countryName",
        required: true,
        description: "Supplier country name (required)",
        provided: !!context.countryName,
      },
      {
        name: "SupplierLegalInformation.businessLicenseNumber",
        required: true,
        description: "Supplier business license number (required)",
        provided: !!context.SupplierLegalInformation.businessLicenseNumber,
      },
      {
        name: "SupplierLegalInformation.taxIdentificationNumber",
        required: false,
        description: "Supplier tax identification number (optional)",
        provided: !!context.SupplierLegalInformation.taxIdentificationNumber,
      },
      {
        name: "SupplierLegalInformation.ksaTaxClassification",
        required: false,
        description: "Supplier KSA tax classification (optional)",
        provided: !!context.SupplierLegalInformation.ksaTaxClassification,
      },
      {
        name: "SupplierLegalInformation.vatRegistrationNumber",
        required: false,
        description: "Supplier VAT registration number (optional)",
        provided: !!context.SupplierLegalInformation.vatRegistrationNumber,
      },
      {
        name: "SupplierLegalInformation.zakatCertificateFile",
        required: false,
        description: "Supplier Zakat certificate file (optional)",
        provided: !!context.SupplierLegalInformation?.zakatCertificateFile,
      },
      {
        name: "SupplierLegalInformation.complianceCertificationFile",
        required: false,
        description: "Supplier Compliance certification file (optional)",
        provided: !!context.SupplierLegalInformation?.complianceCertificationFile,
      },
      {
        name: "SupplierLegalInformation.insuranceCertificateFile",
        required: false,
        description: "Supplier insurance certificate file (optional)",
        provided: !!context.SupplierLegalInformation?.insuranceCertificateFile,
      },
      {
        name: "SupplierLegalInformation.antiCorruptionCompliance",
        required: true,
        description: "Supplier Anti-corruption compliance (required)",
        provided: !!context.SupplierLegalInformation.antiCorruptionCompliance,
      },
      {
        name: "SupplierLegalInformation.ethicalSourcingAgreement",
        required: true,
        description: "Supplier Ethical sourcing agreement (required)",
        provided: !!context.SupplierLegalInformation.ethicalSourcingAgreement,
      },
      {
        name: "SupplierLegalInformation.supplierCodeOfConductAgreement",
        required: true,
        description: "Supplier Code of Conduct agreement (required)",
        provided:
          !!context.SupplierLegalInformation.supplierCodeOfConductAgreement,
      },
      {
        name: "SupplierLegalInformation.legalRepresentativeDetails",
        required: false,
        description: "Supplier Legal representative details (optional)",
        provided: !!context.SupplierLegalInformation.legalRepresentativeDetails,
      },
      {
        name: "SupplierLegalInformation.commercialRegistration",
        required: false,
        description: "Supplier Commercial registration (optional)",
        provided: !!context.SupplierLegalInformation.commercialRegistration,
      },
      {
        name: "SupplierLegalInformation.dunsNumber",
        required: false,
        description: "Supplier DUNS number (optional)",
        provided: !!context.SupplierLegalInformation.dunsNumber,
      },
      {
        name: "SupplierBankAccountDetail.bankName",
        required: true,
        description: "Supplier bank name (required)",
        provided: !!context.SupplierBankAccountDetail.bankName,
      },
      {
        name: "SupplierBankAccountDetail.branchName",
        required: true,
        description: "Supplier branch name (required)",
        provided: !!context.SupplierBankAccountDetail.branchName,
      },
      {
        name: "SupplierBankAccountDetail.accountHolderName",
        required: true,
        description: "Supplier account holder name (required)",
        provided: !!context.SupplierBankAccountDetail.accountHolderName,
      },
      {
        name: "SupplierBankAccountDetail.accountNumber",
        required: true,
        description: "Supplier account number (required)",
        provided: !!context.SupplierBankAccountDetail.accountNumber,
      },
      {
        name: "SupplierBankAccountDetail.address",
        required: false,
        description: "Supplier bank address (optional)",
        provided: !!context.SupplierBankAccountDetail.address,
      },
      {
        name: "SupplierBankAccountDetail.routingNumber",
        required: true,
        description: "Supplier routing number (required)",
        provided: !!context.SupplierBankAccountDetail.routingNumber,
      },
      {
        name: "SupplierBankAccountDetail.accountVerificationFile",
        required: false,
        description: "Supplier account verification file (optional)",
        provided: !!context.SupplierBankAccountDetail.accountVerificationFile,
      },
      {
        name: "SupplierBankAccountDetail.paymentTermsId",
        required: false,
        description: "Supplier payment terms ID (optional)",
        provided: !!context.SupplierBankAccountDetail.paymentTermsId,
      },
      {
        name: "SupplierBankAccountDetail.countryId",
        required: true,
        description: "Supplier country ID (required)",
        provided: !!context.SupplierBankAccountDetail.countryId,
      },
      {
        name: "countryName",
        required: true,
        description: "Supplier country name (required)",
        provided: !!context.SupplierBankAccountDetail.countryName,
      },
      {
        name: "SupplierBankAccountDetail.currencyId",
        required: true,
        description: "Supplier currency ID (required)",
        provided: !!context.SupplierBankAccountDetail.currencyId,
      },
      {
        name: "SupplierBankAccountDetail.currencyName",
        required: true,
        description: "Supplier currency name (required)",
        provided: !!context.SupplierBankAccountDetail.currencyName,
      },
    ];

    const missingRequiredFields = inputFields
      .filter((field) => field.required && !field.provided)
      .map((field) => field.name);

    if (missingRequiredFields.length > 0) {
      return {
        tool_name: "postSupplierTool",
        tool_called: true,
        assistant_response: `Missing required fields: ${missingRequiredFields.join(", ")}`,
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: missingRequiredFields,
          input_fields: inputFields,
          data: {
            supplier: null,
          },
        },
      };
      }
    try {
      const result = await postSupplier(context);

      return {
        tool_name: "postSupplierTool",
        tool_called: true,
        assistant_response: "Supplier created successfully",
        tool_output: {
          status: "success",
          status_code: 201,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            supplier: result,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "postSupplierTool",
        tool_called: true,
        assistant_response: `Failed to create supplier: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            supplier: null,
          },
        },
      };
    }
  },
});

const postSupplier = async (supplierData) => {
  const url = `https://esapdev.xyz:7005/api/v1/supplier/save-supplier`;

  // Create FormData object for multipart/form-data request
  const formData = new FormData();

  // Add each field to the form data
  Object.entries(supplierData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // Handle nested objects like SupplierLegalInformation
      if (typeof value === 'object' && !(value instanceof File)) {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          if (nestedValue !== null && nestedValue !== undefined) {
            // If it's a File object, append it directly
            if (nestedValue instanceof File) {
              formData.append(`${key}.${nestedKey}`, nestedValue);
            } else {
              formData.append(`${key}.${nestedKey}`, nestedValue.toString());
            }
          }
        });
      } else {
        // If it's a File object, append it directly
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    }
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to create supplier: ${response.statusText} (${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to create supplier: ${error}`);
  }
};

export { postSupplierTool };
