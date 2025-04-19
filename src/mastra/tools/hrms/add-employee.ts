import { createTool } from "@mastra/core";
import { z } from "zod";
import {
  addEmployeeInputSchema,
  addEmployeeOutputSchema,
} from "../../../schema/hrms/add-employee-schema";
import { isValidEmail } from "../../../utils/helper";

// ========================== add employee ==========================

export const addEmployeeTool = createTool({
  id: "add-employee",
  description: "Add a new employee to the system",
  inputSchema: z.object(addEmployeeInputSchema),
  outputSchema: z.object({
    tool_name: z.string(),
    tool_called: z.boolean(),
    assistant_response: z.string(),
    tool_output: z.object(addEmployeeOutputSchema),
  }),
  execute: async ({ context }) => {
    // Define all input fields with their requirements
    const inputFields = [
      {
        name: "email",
        required: true,
        description: "Employee email address",
        provided: !!context.email,
      },
      {
        name: "firstName",
        required: true,
        description: "Employee first name",
        provided: !!context.firstName,
      },
      {
        name: "badgeId",
        required: true,
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
        tool_name: "addEmployeeTool",
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
          },
        },
      };
    }

    // Validate email format
    if (context.email && !isValidEmail(context.email)) {
      return {
        tool_name: "addEmployeeTool",
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
          },
        },
      };
    }

    try {
      const result = await addEmployee(context);

      return {
        tool_name: "addEmployeeTool",
        tool_called: true,
        assistant_response: "Employee added successfully",
        tool_output: {
          status: "success",
          status_code: 201,
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
        tool_name: "addEmployeeTool",
        tool_called: true,
        assistant_response: `Failed to add employee: ${error.message}`,
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

const addEmployee = async (employeeData) => {
  console.log(
    "Sending employee data to API:",
    JSON.stringify(employeeData, null, 2)
  );
  console.log(
    "Request URL:",
    `https://esapdev.xyz:7002/api/employee/add-employee`
  );

  const url = `https://esapdev.xyz:7002/api/employee/add-employee`;

  // Create FormData object for multipart/form-data request
  const formData = new FormData();

  // Add each field to the form data
  Object.keys(employeeData).forEach((key) => {
    if (employeeData[key] !== null && employeeData[key] !== undefined) {
      formData.append(key, employeeData[key].toString());
    }
  });

  console.log("Sending as form-data with fields:", Object.keys(employeeData));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYmY3NmI4Zi1iYTgyLTQ4ZDQtYjkyOC1kNzY3MWZkZTExZDciLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImp0aSI6ImVjODI1MTI2LTc4M2QtNGM0My1iYmIwLWI0MzBiZWRmN2E3OCIsImVtYWlsIjoieWFzaXJhcmFmYXQ4ODU2QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJVc2VyIE1hbmFnZW1lbnQgQWRtaW4iLCJTdXBlciBBZG1pbiJdLCJQZXJtaXNzaW9uIjpbIkFsbCIsIkNSTSBBZG1pbiIsIkNSTSBFeGVjdXRpdmUiLCJDUk0gTWFuYWdlciIsIkZNUyBBZG1pbiIsIkZNUyBFeGVjdXRpdmUiLCJGTVMgTWFuYWdlciIsIkhSIEFkbWluIiwiSFIgRXhlY3V0aXZlIiwiSFIgTWFuYWdlciIsIlNDTSBBZG1pbiIsIlNDTSBFeGVjdXRpdmUiLCJTQ00gTWFuYWdlciIsIlVzZXIgTWFuYWdlbWVudCBBZG1pbiIsIlVzZXIgTWFuYWdlbWVudCBFeGVjdXRpdmUiLCJVc2VyIE1hbmFnZW1lbnQgTWFuYWdlciJdLCJleHAiOjE3NDczNDYxNjcsImlzcyI6IkVTQVAiLCJhdWQiOiJFU0FQX0NsaWVudCJ9.RmkPufhZuTD43FN90qJTD-8lQGUcOt4gh5DIVrgFrAg`,
        // Don't set Content-Type when using FormData - the browser will set it automatically with the boundary
      },
      body: formData,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to add employee: ${response.statusText} (${response.status})`
      );
    }

    const result = await response.json();
    console.log("API response:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Exception caught:", error);
    throw error;
  }
};
