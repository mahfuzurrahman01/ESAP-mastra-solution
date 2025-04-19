import { z } from "zod";
import { employeeSchema } from "./employee-schema";

export const addEmployeeInputSchema = {
  email: z.string().min(1).describe("Employee email address (required)"),
  firstName: z.string().min(1).describe("Employee first name (required)"),
  badgeId: z.string().min(1).describe("Employee badge ID (required)"),
  lastName: z.string().optional().describe("Employee last name (optional)"),
  avatarUrl: z
    .string()
    .optional()
    .describe("URL to employee avatar image (optional)"),
  about: z
    .string()
    .optional()
    .describe("Brief description about the employee (optional)"),
  departmentId: z
    .number()
    .nullable()
    .optional()
    .describe("Department ID (optional)"),
  phone: z.string().optional().describe("Employee phone number (optional)"),
  emergencyPhone: z
    .string()
    .optional()
    .describe("Emergency contact phone number (optional)"),
  jobPositionId: z
    .number()
    .nullable()
    .optional()
    .describe("Job position ID (optional)"),
  country: z
    .string()
    .nullable()
    .optional()
    .describe("Employee country (optional)"),
  managerId: z
    .number()
    .nullable()
    .optional()
    .describe("Manager's employee ID (optional)"),
  coachId: z
    .number()
    .nullable()
    .optional()
    .describe("Coach's employee ID (optional)"),
};

export const addEmployeeOutputSchema = {
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
    employee: employeeSchema.nullable(),
  }),
};
