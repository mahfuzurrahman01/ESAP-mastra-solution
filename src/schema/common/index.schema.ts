import { z } from "zod";

export const getAllDataSchema = z.object({
  tool_name: z.string(),
  tool_called: z.boolean(),
  assistant_response: z.string(),
  tool_output: z.object({
    status: z.string(),
    status_code: z.number(),
    required_fields_status: z.boolean(),
    required_fields: z.array(z.string()),
    input_fields: z
      .array(
        z.object({
          name: z.string(),
          required: z.boolean(),
          description: z.string(),
          provided: z.boolean(),
        })
      )
      .optional(),
  }),
});

export const createDataSchema = z.object({
  tool_name: z.string(),
  tool_called: z.boolean(),
  assistant_response: z.string(),
  tool_output: z.object({
    status: z.string(),
    status_code: z.number(),
    required_fields_status: z.boolean(),
    required_fields: z.array(z.string()),
    input_fields: z
      .array(
        z.object({
          name: z.string(),
          required: z.boolean(),
          description: z.string(),
          provided: z.boolean(),
        })
      )
      .optional(),
  }),
});

export const updateDataSchema = z.object({
  tool_name: z.string(),
  tool_called: z.boolean(),
  assistant_response: z.string(),
  tool_output: z.object({
    status: z.string(),
    status_code: z.number(),
    required_fields_status: z.boolean(),
    required_fields: z.array(z.string()),
    input_fields: z
      .array(
        z.object({
          name: z.string(),
          required: z.boolean(),
          description: z.string(),
          provided: z.boolean(),
        })
      )
      .optional(),
  }),
});


