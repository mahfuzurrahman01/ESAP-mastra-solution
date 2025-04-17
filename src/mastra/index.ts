import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { weatherAgent } from "./agents";
import { employeeWorkflow, weatherWorkflow } from "./workflows";
import { hrmsAgent } from "./agents/hrms";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, employeeWorkflow },
  agents: { weatherAgent, hrmsAgent },

  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
