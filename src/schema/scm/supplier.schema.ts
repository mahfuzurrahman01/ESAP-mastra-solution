import { z } from "zod";

// Define a custom file type schema
const FileSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
});

export const CreateSupplierSchema = z.object({
  firstName: z.string().min(1).describe("Supplier first name (required)"),
  middleName: z.string().optional(),
  lastName: z.string().min(1).describe("Supplier last name (required)"),
  companyName: z.string().min(1).describe("Supplier company name (required)"),
  companyWebsite: z.string().optional(),
  companyAddress: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  contactNumber: z
    .string()
    .min(1)
    .describe("Supplier contact number (required)"),
  contactEmail: z.string().min(1).describe("Supplier contact email (required)"),
  supplierCategoryId: z
    .number()
    .min(1)
    .describe("Supplier category id (required)"),
  countryId: z.number().min(1).describe("Supplier country id (required)"),
  countryName: z.string().min(1).describe("Supplier country name (required)"),
  supplierStatus: z.string().optional(),
  avatarFile: z.string().describe("Supplier avatar file (optional)").optional(),
  SupplierLegalInformation: z.object({
    businessLicenseNumber: z
      .string()
      .min(1)
      .describe("Supplier business license number (required)"),
    taxIdentificationNumber: z.string().optional(),
    ksaTaxClassification: z.string().optional(),
    vatRegistrationNumber: z.string().optional(),
    zakatCertificateFile: z.string().describe("Supplier zakat certificate file (optional)").optional(),
    complianceCertificationFile: z.string().describe("Supplier compliance certification file (optional)").optional(),
    insuranceCertificateFile: z.string().describe("Supplier insurance certificate file (optional)").optional(),
    antiCorruptionCompliance: z.boolean().describe("Supplier anti-corruption compliance (required)"),
    ethicalSourcingAgreement: z.boolean().describe("Supplier ethical sourcing agreement (required)"),
    supplierCodeOfConductAgreement: z.boolean().describe("Supplier code of conduct agreement (required)"),
    legalRepresentativeDetails: z.string().optional(),
    commercialRegistration: z.string().optional(),
    dunsNumber: z.string().optional(),
  }),
  SupplierBankAccountDetail: z.object({
    bankName: z.string().min(1).describe("Supplier bank name (required)"),
    branchName: z.string().min(1).describe("Supplier branch name (required)"),
    accountHolderName: z
      .string()
      .min(1)
      .describe("Supplier account holder name (required)"),
    accountNumber: z
      .string()
      .min(1)
      .describe("Supplier account number (required)"),
    address: z.string().optional(),
    routingNumber: z
      .string()
      .min(1)
      .describe("Supplier routing number (required)"),
    accountVerificationFile: z.string().describe("Supplier account verification file (optional)").optional(),
    paymentTermsId: z.number().optional(),
    countryId: z.number().min(1).describe("Supplier country id (required)"),
    countryName: z.string().min(1).describe("Supplier country name (required)"),
    currencyId: z.number().min(1).describe("Supplier currency id (required)"),
    currencyName: z.string().min(1).describe("Supplier currency name (required)"),
  }),
});

export const UpdateSupplierSchema = z.object({
  id: z.number().min(1).describe("Supplier id (required)"),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyAddress: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  contactNumber: z.string().optional(),
  contactEmail: z.string().optional(),
  supplierCategoryId: z.number().optional(),
  countryId: z.number().optional(),
  countryName: z.string().optional(),
  supplierStatus: z.string().optional(),
  avatarFile: FileSchema.optional(),
  SupplierLegalInformation: z.object({
    businessLicenseNumber: z.string().optional(),
    taxIdentificationNumber: z.string().optional(),
    ksaTaxClassification: z.string().optional(),
    vatRegistrationNumber: z.string().optional(),
    zakatCertificateFile: FileSchema.optional(),
    complianceCertificationFile: FileSchema.optional(),
    insuranceCertificateFile: FileSchema.optional(),
    antiCorruptionCompliance: z.boolean().optional(),
    ethicalSourcingAgreement: z.boolean().optional(),
    supplierCodeOfConductAgreement: z.boolean().optional(),
    legalRepresentativeDetails: z.string().optional(),
    commercialRegistration: z.string().optional(),
    dunsNumber: z.string().optional(),
  }),
  SupplierBankAccountDetail: z.object({
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    address: z.string().optional(),
    routingNumber: z.string().optional(),
    accountVerificationFile: FileSchema.optional(),
    paymentTermsId: z.number().optional(),
    countryId: z.number().optional(),
    countryName: z.string().optional(),
    currencyId: z.number().optional(),
    currencyName: z.string().optional(),
  }),
});
