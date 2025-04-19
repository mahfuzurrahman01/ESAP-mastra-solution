import { createTool } from "@mastra/core";
import { z } from "zod";
import { employeeSchema } from "../../../schema/hrms/employee-schema";
import { isValidEmail } from "../../../utils/helper";
import { getEmployee } from "./get-employee-by-id";

// ========================== update employee ==========================

export const updateEmployeeTool = createTool({
  id: "update-employee",
  description: "Update an existing employee in the system",
  inputSchema: z.object({
    id: z.number().describe("Employee ID to update (required)"),
    email: z.string().min(1).optional().describe("Employee email address"),
    firstName: z.string().min(1).optional().describe("Employee first name"),
    badgeId: z.string().min(1).optional().describe("Employee badge ID"),
    lastName: z.string().optional().describe("Employee last name"),
    avatarUrl: z.string().optional().describe("URL to employee avatar image"),
    about: z
      .string()
      .optional()
      .describe("Brief description about the employee"),
    departmentId: z.number().nullable().optional().describe("Department ID"),
    phone: z.string().optional().describe("Employee phone number"),
    emergencyPhone: z
      .string()
      .optional()
      .describe("Emergency contact phone number"),
    jobPositionId: z.number().nullable().optional().describe("Job position ID"),
    country: z.string().nullable().optional().describe("Employee country"),
    managerId: z
      .number()
      .nullable()
      .optional()
      .describe("Manager's employee ID"),
    coachId: z.number().nullable().optional().describe("Coach's employee ID"),
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
        original_employee: employeeSchema.nullable(),
        updated_fields: z.array(z.string()).optional(),
      }),
    }),
  }),
  execute: async ({ context }) => {
    // Define all input fields with their requirements
    const inputFields = [
      {
        name: "id",
        required: true,
        description: "Employee ID to update",
        provided: !!context.id,
      },
      {
        name: "email",
        required: false,
        description: "Employee email address",
        provided: !!context.email,
      },
      {
        name: "firstName",
        required: false,
        description: "Employee first name",
        provided: !!context.firstName,
      },
      {
        name: "badgeId",
        required: false,
        description: "Employee badge ID",
        provided: !!context.badgeId,
      },
      {
        name: "lastName",
        required: false,
        description: "Employee last name",
        provided: !!context.lastName,
      },
      {
        name: "avatarUrl",
        required: false,
        description: "URL to employee avatar image",
        provided: !!context.avatarUrl,
      },
      {
        name: "about",
        required: false,
        description: "Brief description about the employee",
        provided: !!context.about,
      },
      {
        name: "departmentId",
        required: false,
        description: "Department ID",
        provided: context.departmentId !== undefined,
      },
      {
        name: "phone",
        required: false,
        description: "Employee phone number",
        provided: !!context.phone,
      },
      {
        name: "emergencyPhone",
        required: false,
        description: "Emergency contact phone number",
        provided: !!context.emergencyPhone,
      },
      {
        name: "jobPositionId",
        required: false,
        description: "Job position ID",
        provided: context.jobPositionId !== undefined,
      },
      {
        name: "country",
        required: false,
        description: "Employee country",
        provided: !!context.country,
      },
      {
        name: "managerId",
        required: false,
        description: "Manager's employee ID",
        provided: context.managerId !== undefined,
      },
      {
        name: "coachId",
        required: false,
        description: "Coach's employee ID",
        provided: context.coachId !== undefined,
      },
    ];

    // Check for required fields
    const missingRequiredFields = inputFields
      .filter((field) => field.required && !field.provided)
      .map((field) => field.name);

    if (missingRequiredFields.length > 0) {
      return {
        tool_name: "updateEmployeeTool",
        tool_called: true,
        assistant_response: `Missing required fields: ${missingRequiredFields.join(", ")}`,
        tool_output: {
          status: "error",
          status_code: 400,
          required_fields_status: true,
          required_fields: missingRequiredFields,
          input_fields: inputFields,
          data: {
            employee: null,
            original_employee: null,
            updated_fields: [],
          },
        },
      };
    }

    try {
      // First, fetch the current employee data
      const currentEmployee = await getEmployee(context.id);

      if (!currentEmployee) {
        return {
          tool_name: "updateEmployeeTool",
          tool_called: true,
          assistant_response: `Employee with ID ${context.id} not found.`,
          tool_output: {
            status: "error",
            status_code: 404,
            required_fields_status: false,
            required_fields: [],
            input_fields: inputFields,
            data: {
              employee: null,
              original_employee: null,
              updated_fields: [],
            },
          },
        };
      }

      // Check which fields are being updated
      const updatedFields = [];
      // Start with all current employee data and then override with new values
      const updateData = { ...currentEmployee };

      // Only update fields that were provided in the context
      Object.keys(context).forEach((key) => {
        if (key !== "id" && context[key] !== undefined) {
          updateData[key] = context[key];
          updatedFields.push(key as never);
        }
      });

      // Validate email format if it's being updated
      if (context.email && !isValidEmail(context.email)) {
        return {
          tool_name: "updateEmployeeTool",
          tool_called: true,
          assistant_response:
            "Invalid email format. Please provide a valid email address.",
          tool_output: {
            status: "error",
            status_code: 400,
            required_fields_status: true,
            required_fields: ["email"],
            input_fields: inputFields,
            data: {
              employee: null,
              original_employee: currentEmployee,
              updated_fields: updatedFields,
            },
          },
        };
      }

      // If no fields to update, return the current employee data
      if (updatedFields.length === 0) {
        return {
          tool_name: "updateEmployeeTool",
          tool_called: true,
          assistant_response:
            "No fields were provided for update. Current employee information returned.",
          tool_output: {
            status: "success",
            status_code: 200,
            required_fields_status: false,
            required_fields: [],
            input_fields: inputFields,
            data: {
              employee: currentEmployee,
              original_employee: currentEmployee,
              updated_fields: [],
            },
          },
        };
      }

      // Update the employee with the merged data
      const result = await updateEmployee(updateData);

      return {
        tool_name: "updateEmployeeTool",
        tool_called: true,
        assistant_response: `Employee updated successfully. Updated fields: ${updatedFields.join(", ")}`,
        tool_output: {
          status: "success",
          status_code: 200,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            employee: result,
            original_employee: currentEmployee,
            updated_fields: updatedFields,
          },
        },
      };
    } catch (error) {
      return {
        tool_name: "updateEmployeeTool",
        tool_called: true,
        assistant_response: `Failed to update employee: ${error.message}`,
        tool_output: {
          status: "error",
          status_code: 500,
          required_fields_status: false,
          required_fields: [],
          input_fields: inputFields,
          data: {
            employee: null,
            original_employee: null,
            updated_fields: [],
          },
        },
      };
    }
  },
});

export const updateEmployee = async (employeeData) => {
  console.log(
    "Sending employee update data to API:",
    JSON.stringify(employeeData, null, 2)
  );
  console.log(
    "Request URL:",
    `https://esapdev.xyz:7002/api/employee/update-employee`
  );

  const url = `https://esapdev.xyz:7002/api/employee/update-employee`;

  // Create FormData object for multipart/form-data request
  const formData = new FormData();

  // Add each field to the form data
  Object.keys(employeeData).forEach((key) => {
    if (employeeData[key] !== null && employeeData[key] !== undefined) {
      // Convert all values to strings
      formData.append(key, String(employeeData[key]));
    }
  });

  // Log the form data keys for debugging
  console.log("Sending as form-data with fields:", Object.keys(employeeData));

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6ImVjODI1MTI2LTc4M2QtNGM0My1iYmIwLWI0MzBiZWRmN2E3OCIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDczNDYxNjcsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.RmkPufhZuTD43FN90qJTD-8lQGUcOt4gh5DIVrgFrAg`,
      },
      body: formData,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to update employee: ${response.statusText} (${response.status})`
      );
    }

    // Try to parse as JSON if possible
    let result;
    try {
      const responseText = await response.text();
      result = JSON.parse(responseText);
    } catch (e) {
      // If parsing fails, fetch the employee again to get the updated data
      result = await getEmployee(employeeData.id);
    }

    return result;
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};
