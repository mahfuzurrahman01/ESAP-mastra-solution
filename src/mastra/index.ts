import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { weatherAgent } from "./agents";
import { hrmsAgent } from "./agents/hrms";
import { supplierAgent } from "./agents/scm";
import { employeeWorkflow, weatherWorkflow } from "./workflows";
import { supplierWorkflow } from "./workflows/scm";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, employeeWorkflow, supplierWorkflow },
  agents: { weatherAgent, hrmsAgent, supplierAgent },

  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
