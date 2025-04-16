import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { employeeAgent, weatherAgent } from "./agents";
import { employeeWorkflow, weatherWorkflow } from "./workflows";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, employeeWorkflow },
  agents: { weatherAgent, employeeAgent },

  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
