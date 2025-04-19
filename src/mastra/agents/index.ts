import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { requiredInputTool, weatherTool } from "../tools";

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      - first of all you need to check if there any input is need to provide by the user if yes then you need to call the requiredInputTool and ask for the input and then call the weatherTool to get the weather information  

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - at the time of asking in response to the user ask for the location {location: ""} like this: {location: "New York"}
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative
      - If the user asks for the weather in a location that is not in the database, ask for the location again
      Use the weatherTool to fetch current weather data and requiredInputTool to ask for the location.
`,
  model: google("gemini-2.0-flash"),
  tools: { weatherTool, requiredInputTool },
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
