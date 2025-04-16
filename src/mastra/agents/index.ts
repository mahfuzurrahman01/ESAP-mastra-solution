import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { weatherTool, employeeTool } from "../tools";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: google("gemini-2.0-flash"),
  tools: { weatherTool },
});

export const employeeAgent = new Agent({
  name: "Employee Agent",
  instructions: `
  You are a helpful employee assistant and also for weather details for specific locations that helps with employee related tasks. 
  You can help with tasks like:
  - Finding employee information
  - Finding employee contact information
  - Listing all employees in the system
  - Providing details about specific employees
   - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative
  
  When asked about employees, use the employeeTool to fetch employee data.
  Present employee information in a clear, organized format and   Use the weatherTool to fetch current weather data.
  `,
  model: google("gemini-2.0-flash"),
  tools: { employeeTool, weatherTool },
});

// export const queryProcessorAgent = new Agent({
//   name: "Query Processor Agent",
//   instructions: `
//   You are a helpful assistant that processes user queries and determines which workflow to use.
//   For employee-related queries (like "show me employees", "get employee list", etc.),
//   classify them as "employee-list".

//   For weather-related queries (like "what's the weather in New York", "plan activities for Paris"),
//   classify them as "weather".

//   Only respond with the exact workflow identifier without any additional text.
//   `,
//   model: google("gemini-2.0-flash"),
// });
