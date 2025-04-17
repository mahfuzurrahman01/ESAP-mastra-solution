import { z } from "zod";

// Define a custom file type schema
const FileSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
});

export const productSchema = z.object({
  productCode: z.string().min(1, "Product code is required"),
  productName: z.string().min(1, "Product name is required"),
  productCategoryId: z.number().min(1, "Product category is required"),
  productType: z.string().min(1, "Product type is required"),
  cost: z.number().optional(),
  isFixedAsset: z.boolean().optional(),
  assetCategoryId: z.number().optional(),
  purchasePrice: z.number().optional(),
  sellingPrice: z.number().optional(),
  purchaseTax: z.number().optional(),
  salesTax: z.number().optional(),
  discount: z.number().optional(),
  companyId: z.number().min(1, "Company is required"),
  description: z.string().default("").optional(),
  avatarFile: z.string().nullable(),
  status: z.boolean().optional(),
  itemUnitId: z.number().min(1, "Item unit is required"),
});


export const updateProductSchema = z.object({
  id: z.number().min(1, "Product id is required"),
  productCode: z.string().optional(),
  productName: z.string().optional(),
  productCategoryId: z.number().optional(),
  productType: z.string().optional(),
  cost: z.number().optional(),
  isFixedAsset: z.boolean().optional(),
  assetCategoryId: z.number().optional(),
  purchasePrice: z.number().optional(),
  sellingPrice: z.number().optional(),
  purchaseTax: z.number().optional(),
  salesTax: z.number().optional(),
  discount: z.number().optional(),
  companyId: z.number().optional(),
  description: z.string().default("").optional(),
  avatarFile: z.string().nullable().optional(),
  status: z.boolean().optional(),
  itemUnitId: z.number().optional(),
});


export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  code: z.string().min(1, "Product code is required"),
  description: z.string().optional(),
  unitPrice: z.number().min(0, "Unit price must be greater than or equal to 0"),
  category: z.string().optional(),
  supplierId: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
