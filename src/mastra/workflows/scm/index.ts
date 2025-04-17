import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Step, Workflow } from "@mastra/core/workflows";
import { z } from "zod";
import { CreateSupplierSchema } from "../../../schema/scm/supplier.schema";


const llm = google("gemini-2.0-flash");

const agent = new Agent({
  name: "Supplier Agent",
  model: llm,
  instructions: `
        You are a local activities and travel expert who excels at weather-based planning. Analyze the weather data and provide practical activity recommendations.

        For each day in the forecast, structure your response exactly as follows:

        📅 [Day, Month Date, Year]
        ═══════════════════════════

        🌡️ WEATHER SUMMARY
        • Conditions: [brief description]
        • Temperature: [X°C/Y°F to A°C/B°F]
        • Precipitation: [X% chance]

        🌅 MORNING ACTIVITIES
        Outdoor:
        • [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        🌞 AFTERNOON ACTIVITIES
        Outdoor:
        • [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        🏠 INDOOR ALTERNATIVES
        • [Activity Name] - [Brief description including specific venue]
          Ideal for: [weather condition that would trigger this alternative]

        ⚠️ SPECIAL CONSIDERATIONS
        • [Any relevant weather warnings, UV index, wind conditions, etc.]

        Guidelines:
        - Suggest 2-3 time-specific outdoor activities per day
        - Include 1-2 indoor backup options
        - For precipitation >50%, lead with indoor activities
        - All activities must be specific to the location
        - Include specific venues, trails, or locations
        - Consider activity intensity based on temperature
        - Keep descriptions concise but informative

        Maintain this exact formatting for consistency, using the emoji and section headers as shown.
      `,
});

const supplierResponseSchema = z.object({
  pageIndex: z.number(),
  pageSize: z.number(),
  count: z.number(),
  data: z.array(CreateSupplierSchema),
});

const fetchSupplier = new Step({
  id: "fetch-supplier",
  description: "Fetches supplier information for a given supplier name",
  inputSchema: z.object({
    pageIndex: z.number().optional().describe("Page number (starts from 1)"),
    pageSize: z.number().optional().describe("Number of items per page"),
  }),
  outputSchema: supplierResponseSchema,
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{
      pageIndex?: number;
      pageSize?: number;
    }>("trigger");

    if (!triggerData) {
      throw new Error("Trigger data not found");
    }

    const pageIndex = triggerData?.pageIndex || 1;
    const pageSize = triggerData?.pageSize || 10;

    try {
      const url = `https://esapdev.xyz:7005/api/v1/supplier/get-supplier-list?pageIndex=${pageIndex}&pageSize=${pageSize}`;

      console.log(`Fetching suppliers from: ${url}`);

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        console.error(`Error fetching suppliers: ${response.statusText}`);
        throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.data.length} suppliers`);
      return data;
    } catch (error) {
      console.error("Error in fetchSuppliers:", error);
      throw error;
    }
  },
});

const planActivities = new Step({
  id: "plan-activities",
  description: "Suggests activities based on weather conditions",
  execute: async ({ context, mastra }) => {
    const supplier = context?.getStepResult(fetchSupplier);

    if (!supplier || supplier.data.length === 0) {
      throw new Error("Supplier data not found");
    }

    const prompt = `Based on the following supplier information, suggest appropriate activities:
      ${JSON.stringify(supplier, null, 2)}
      `;

    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);

    let activitiesText = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }

    return {
      activities: activitiesText,
    };
  },
});

// Create the employee workflow
const supplierWorkflow = new Workflow({
  name: "supplier-workflow",
  triggerSchema: z.object({
    pageIndex: z.number().optional().describe("Page number (starts from 1)"),
    pageSize: z.number().optional().describe("Number of items per page"),
  }),
})
  .step(fetchSupplier)
  .then(planActivities);

// Make sure to commit the workflow before exporting it
supplierWorkflow.commit();

// Export the committed workflows
export { supplierWorkflow };
