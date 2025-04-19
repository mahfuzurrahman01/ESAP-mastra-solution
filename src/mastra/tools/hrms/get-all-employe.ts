import { createTool } from "@mastra/core";
import { z } from "zod";
import { employeeSchema } from "../../../schema/hrms/employee-schema";

const getAllEmployees = async (
  pageIndex: number = 1,
  pageSize: number = 10
) => {
  const url = `https://esapdev.xyz:7002/api/employee/get-all-employee?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6ImVjODI1MTI2LTc4M2QtNGM0My1iYmIwLWI0MzBiZWRmN2E3OCIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDczNDYxNjcsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.RmkPufhZuTD43FN90qJTD-8lQGUcOt4gh5DIVrgFrAg`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }

  return await response.json();
};

// ========================== get all employees ==========================

export const getEmployeeTool = createTool({
  id: "get-all-employees",
  description: "Get all employees from the system",
  inputSchema: z.object({
    pageIndex: z.number().optional().describe("Page number (starts from 1)"),
    pageSize: z.number().optional().describe("Number of items per page"),
  }),
  outputSchema: z.object({
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
      data: z.object({
        pageIndex: z.number(),
        pageSize: z.number(),
        count: z.number(),
        employees: z.array(employeeSchema),
      }),
    }),
  }),
  execute: async ({ context }) => {
    const pageIndex = context.pageIndex || 1;
    const pageSize = context.pageSize || 10;

    const inputFields = [
      {
        name: "pageIndex",
        required: false,
        description: "Page number (starts from 1)",
        provided: !!context.pageIndex,
      },
      {
        name: "pageSize",
        required: false,
        description: "Number of items per page",
        provided: !!context.pageSize,
      },
    ];

    try {
      const result = await getAllEmployees(pageIndex, pageSize);

      return {
        tool_name: "employeeTool",
        tool_called: true,
        assistant_response: "Employee information fetched successfully",
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            pageIndex: result.pageIndex,
            pageSize: result.pageSize,
            count: result.count,
            employees: result.data,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "employeeTool",
        tool_called: true,
        assistant_response: `Failed to fetch employee information: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            pageIndex,
            pageSize,
            count: 0,
            employees: [],
          },
        },
      };
    }
  },
});
