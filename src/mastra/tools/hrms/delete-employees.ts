import { createTool } from "@mastra/core";
import { z } from "zod";
import { deleteEmployeesOutputSchema } from "../../../schema/hrms/delete-employee-schema";

// ========================== delete multiple employees ==========================

export const deleteEmployeesTool = createTool({
  id: "delete-employees",
  description:
    "Delete multiple employees from the system by providing an array of employee IDs",
  inputSchema: z.object({
    ids: z
      .array(z.number())
      .describe("Array of employee IDs to delete (required)"),
  }),
  outputSchema: z.object(deleteEmployeesOutputSchema),
  execute: async ({ context }) => {
    // Define input fields with requirements
    const inputFields = [
      {
        name: "ids",
        required: true,
        description: "Array of employee IDs to delete",
        provided: Array.isArray(context.ids) && context.ids.length > 0,
      },
    ];

    // Check for required fields
    if (
      !context.ids ||
      !Array.isArray(context.ids) ||
      context.ids.length === 0
    ) {
      return {
        tool_name: "deleteEmployeesTool",
        tool_called: true,
        assistant_response:
          "At least one employee ID is required to delete employees",
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: ["ids"],
          input_fields: inputFields,
          data: {
            deleted: false,
            employee_ids: [],
            message: "At least one employee ID is required",
          },
        },
      };
    }

    try {
      // Delete the employees
      const result = await deleteEmployees(context.ids);

      return {
        tool_name: "deleteEmployeesTool",
        tool_called: true,
        assistant_response: `${result.successful_deletions.length} employees deleted successfully`,
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: result.successful_deletions.length > 0,
            employee_ids: context.ids,
            successful_deletions: result.successful_deletions,
            failed_deletions: result.failed_deletions,
            message: `${result.successful_deletions.length} employees deleted successfully, ${result.failed_deletions.length} deletions failed`,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "deleteEmployeesTool",
        tool_called: true,
        assistant_response: `Failed to delete employees: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            deleted: false,
            employee_ids: context.ids,
            message: error.message,
          },
        },
      };
    }
  },
});

const deleteEmployees = async (ids: number[]) => {
  console.log(`Deleting employees with IDs: ${ids.join(", ")}`);
  const url = `https://esapdev.xyz:7002/api/employee/delete-employees`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6ImVjODI1MTI2LTc4M2QtNGM0My1iYmIwLWI0MzBiZWRmN2E3OCIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDczNDYxNjcsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.RmkPufhZuTD43FN90qJTD-8lQGUcOt4gh5DIVrgFrAg`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    console.log("Bulk delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to delete employees: ${response.statusText} (${response.status})`
      );
    }

    // Try to parse response as JSON
    try {
      const responseText = await response.text();
      if (responseText) {
        const result = JSON.parse(responseText);
        return {
          successful_deletions: result.successful_deletions || ids,
          failed_deletions: result.failed_deletions || [],
        };
      }
      // If no response body, assume all were successful
      return {
        successful_deletions: ids,
        failed_deletions: [],
      };
    } catch (e) {
      // If parsing fails, assume all were successful
      return {
        successful_deletions: ids,
        failed_deletions: [],
      };
    }
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};
