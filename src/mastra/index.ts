import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { employeeAgent, weatherAgent } from "./agents";
import { employeeWorkflow, weatherWorkflow } from "./workflows";
import { supplierAgent } from "./agents/scm";
import { supplierWorkflow } from "./workflows/scm";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, employeeWorkflow, supplierWorkflow },
  agents: { weatherAgent, employeeAgent, supplierAgent },

  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
