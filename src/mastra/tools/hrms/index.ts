"use client";
import { createTool } from "@mastra/core";
import { z } from "zod";
import { employeeSchema } from "../../../schema/hrms/hrms-schema";

// ========================== get all employees ==========================

const employeeTool = createTool({
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

// ========================== get employee by id ==========================

const getEmployeeTool = createTool({
  id: "get-employee-by-id",
  description: "Get employee information by employee ID",
  inputSchema: z.object({
    id: z.number().describe("Employee ID to fetch details for"),
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
        employee: employeeSchema.nullable(),
      }),
    }),
  }),
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

const getEmployee = async (id: number) => {
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

// ========================== add employee ==========================

const addEmployeeTool = createTool({
  id: "add-employee",
  description: "Add a new employee to the system",
  inputSchema: z.object({
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
      }),
    }),
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

// ========================== update employee ==========================

const updateEmployeeTool = createTool({
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

const updateEmployee = async (employeeData) => {
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

// Debug function to test the API directly
const testUpdateEmployee = async () => {
  try {
    const testData = {
      id: 19, // Use a valid ID from your system
      firstName: "TEST_UPDATE",
      lastName: "TEST_LAST",
      email: "test@example.com",
      phone: "01234567890",
    };

    console.log("Testing update with data:", testData);
    const result = await updateEmployee(testData);
    console.log("Test result:", result);
    return result;
  } catch (error) {
    console.error("Test failed:", error);
    return null;
  }
};

// Uncomment to run the test
// testUpdateEmployee();

// ========================== delete employee ==========================

const deleteEmployeeTool = createTool({
  id: "delete-employee",
  description: "Delete an employee from the system by ID",
  inputSchema: z.object({
    id: z.number().describe("Employee ID to delete (required)"),
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
        deleted: z.boolean(),
        employee_id: z.number(),
        message: z.string().optional(),
      }),
    }),
  }),
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

// ========================== delete multiple employees ==========================

const deleteEmployeesTool = createTool({
  id: "delete-employees",
  description:
    "Delete multiple employees from the system by providing an array of employee IDs",
  inputSchema: z.object({
    ids: z
      .array(z.number())
      .describe("Array of employee IDs to delete (required)"),
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
        deleted: z.boolean(),
        employee_ids: z.array(z.number()),
        successful_deletions: z.array(z.number()).optional(),
        failed_deletions: z.array(z.number()).optional(),
        message: z.string().optional(),
      }),
    }),
  }),
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

// Update the exports to include the new tools
export {
  employeeTool,
  getEmployeeTool,
  addEmployeeTool,
  updateEmployeeTool,
  deleteEmployeeTool,
  deleteEmployeesTool,
};
