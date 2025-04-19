import { createTool } from "@mastra/core";
import { z } from "zod";
import { getEmployee } from "./get-employee-by-id";
import { deleteEmployeeOutputSchema } from "../../../schema/hrms/delete-employee-schema";

// ========================== delete employee ==========================

export const deleteEmployeeTool = createTool({
  id: "delete-employee",
  description: "Delete an employee from the system by ID",
  inputSchema: z.object({
    id: z.number().describe("Employee ID to delete (required)"),
  }),
  outputSchema: z.object(deleteEmployeeOutputSchema),
  execute: async ({ context }) => {
    // Define input fields with requirements
    const inputFields = [
      {
        name: "id",
        required: true,
        description: "Employee ID to delete",
        provided: !!context.id,
      },
    ];

    // Check for required fields
    if (!context.id) {
      return {
        tool_name: "deleteEmployeeTool",
        tool_called: true,
        assistant_response: "Employee ID is required to delete an employee",
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: ["id"],
          input_fields: inputFields,
          data: {
            deleted: false,
            employee_id: 0,
            message: "Employee ID is required",
          },
        },
      };
    }

    try {
      // First, check if the employee exists
      try {
        await getEmployee(context.id);
      } catch (error) {
        return {
          tool_name: "deleteEmployeeTool",
          tool_called: true,
          assistant_response: `Employee with ID ${context.id} not found.`,
          tool_output: {
            status: "error",
            status_code: 404,
            required_fields_status: false,
            required_fields: [],
            input_fields: inputFields,
            data: {
              deleted: false,
              employee_id: context.id,
              message: `Employee with ID ${context.id} not found`,
            },
          },
        };
      }

      // Delete the employee
      const result = await deleteEmployee(context.id);

      return {
        tool_name: "deleteEmployeeTool",
        tool_called: true,
        assistant_response: `Employee with ID ${context.id} deleted successfully`,
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: true,
            employee_id: context.id,
            message: `Employee with ID ${context.id} deleted successfully`,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "deleteEmployeeTool",
        tool_called: true,
        assistant_response: `Failed to delete employee: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: false,
            employee_id: context.id,
            message: error.message,
          },
        },
      };
    }
  },
});

const deleteEmployee = async (id: number) => {
  console.log(`Deleting employee with ID: ${id}`);
  const url = `https://esapdev.xyz:7002/api/employee/delete-employee/${id}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6ImVjODI1MTI2LTc4M2QtNGM0My1iYmIwLWI0MzBiZWRmN2E3OCIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDczNDYxNjcsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.RmkPufhZuTD43FN90qJTD-8lQGUcOt4gh5DIVrgFrAg`,
        "Content-Type": "application/json",
      },
    });

    console.log("Delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to delete employee: ${response.statusText} (${response.status})`
      );
    }

    // Try to parse response as JSON if possible
    try {
      const responseText = await response.text();
      if (responseText) {
        return JSON.parse(responseText);
      }
      return { success: true };
    } catch (e) {
      // If parsing fails, return a success object
      return { success: true };
    }
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};
