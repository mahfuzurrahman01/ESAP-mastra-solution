import { z } from "zod";

export const deleteEmployeeOutputSchema = {
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
      deleted: z.boolean(),
      employee_id: z.number(),
      message: z.string().optional(),
    }),
  }),
};

export const deleteEmployeesOutputSchema = {
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
      deleted: z.boolean(),
      employee_ids: z.array(z.number()),
      successful_deletions: z.array(z.number()).optional(),
      failed_deletions: z.array(z.number()).optional(),
      message: z.string().optional(),
    }),
  }),
};
