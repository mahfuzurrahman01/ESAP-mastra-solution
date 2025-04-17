import { z } from "zod";


export const CarrierSchema = z.object({
  carrierName: z.string().min(1, "Carrier name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().min(1, "Email is required"),
  address: z.string().min(1, "Address is required"),
});
