import { createTool } from "@mastra/core";
import { z } from "zod";
import { employeeSchema } from "../../../schema/hrms/employee-schema";
import { getEmployeeByIdOutputSchema } from "../../../schema/hrms/get-employee-by-id-schema";

// ========================== get employee by id ==========================

export const getEmployeeByIdTool = createTool({
  id: "get-employee-by-id",
  description: "Get employee information by employee ID",
  inputSchema: z.object({
    id: z.number().describe("Employee ID to fetch details for"),
  }),
  outputSchema: z.object(getEmployeeByIdOutputSchema),
  execute: async ({ context }) => {
    const id = context.id;

    const inputFields = [
      {
        name: "id",
        required: true,
        description: "Employee ID to fetch details for",
        provided: !!id,
      },
    ];

    if (!id) {
      return {
        tool_name: "getEmployeeTool",
        tool_called: true,
        assistant_response: "Employee ID is required to fetch employee details",
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: ["id"],
          input_fields: inputFields,
          data: {
            employee: null,
          },
        },
      };
    }

    try {
      const result = await getEmployee(id);

      return {
        tool_name: "getEmployeeTool",
        tool_called: true,
        assistant_response: "Employee information fetched successfully",
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            employee: result,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "getEmployeeTool",
        tool_called: true,
        assistant_response: `Failed to fetch employee information: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            employee: null,
          },
        },
      };
    }
  },
});

export const getEmployee = async (id: number) => {
  const url = `https://esapdev.xyz:7002/api/employee/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6ImVjODI1MTI2LTc4M2QtNGM0My1iYmIwLWI0MzBiZWRmN2E3OCIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDczNDYxNjcsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.RmkPufhZuTD43FN90qJTD-8lQGUcOt4gh5DIVrgFrAg`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employee: ${response.statusText}`);
  }

  return await response.json();
};
