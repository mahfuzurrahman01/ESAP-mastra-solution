import { z } from "zod";

// Define the employee response schema
export const employeeSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
  about: z.string().nullable(),
  badgeId: z.string().nullable(),
  department: z
    .object({
      id: z.number(),
      departmentName: z.string(),
    })
    .nullable(),
  phone: z.string().nullable(),
  emergencyPhone: z.string().nullable(),
  email: z.string().nullable(),
  jobPosition: z
    .object({
      id: z.number(),
      jobPositionName: z.string(),
      description: z.string(),
      createdDate: z.string(),
      updatedDate: z.string(),
    })
    .nullable(),
  country: z.string().nullable(),
  manager: z
    .object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      avatar: z.string().nullable(),
    })
    .nullable(),
  coach: z
    .object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      avatar: z.string().nullable(),
    })
    .nullable(),
  resumes: z.array(z.unknown()),
  workInformation: z.unknown().nullable(),
  privateInformation: z.unknown().nullable(),
});
