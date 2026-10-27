// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "../../inngest/client";
import { apiFetcher, approvalWorkflow, batchProcessor, createUser, dailyReport, dataProcessor, emailSender, reminder, simpleGreeter, validationFunction } from "@/app/inngest/functions";
// We'll add functions here as we create them

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Functions will be added here
    simpleGreeter,
    dataProcessor,
    emailSender,
    approvalWorkflow,
    apiFetcher,
    validationFunction,
    reminder,
    // dailyReport,
    batchProcessor,
    createUser,
  ],
});



