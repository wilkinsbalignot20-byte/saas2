 import { inngest } from "../client";

// 1. Gumawa ng malinaw na Interface para sa Item structure
interface DataItem {
  id?: string | number;
  name?: string;
  [key: string]: unknown; // Payagan ang iba pang dynamic fields nang ligtas gamit ang 'unknown'
}

// 2. Gumawa ng Interface para sa Event Data payload
interface DataJudgePayload {
  action?: "MERGE" | "SPLIT" | string;
  items?: DataItem[];
}

export const dataJudgeWorkflow = inngest.createFunction(
  { 
    id: "data-judge-workflow", 
    name: "Local Judge (Merge/Split/Switch Test)",
    triggers: [{ event: "app/test.data" }] 
  },
  async ({ event, step }) => {
    // Sasaluhin ang mock data gamit ang ligtas na type-casting sa nilikhang Interface
    const { action, items } = (event.data || {}) as DataJudgePayload;

    console.log(`[JUDGE ENGINE]: Nakatanggap ng request na may action: ${action}`);

    // Dito nagpapasya ang "Judge" sa likod ng system
    switch (action) {
      case "MERGE":
        return await step.run("merge-process", async () => {
          console.log("-> Pinapagana ang MERGE logic...");
          return { 
            message: "Matagumpay na pinagsama ang mga data!",
            total_items: items ? items.length : 0,
            timestamp: new Date().toISOString()
          };
        });

      case "SPLIT":
        return await step.run("split-process", async () => {
          console.log("-> Pinapagana ang SPLIT logic...");
          // Pinalitan ang 'item: any' ng 'item: DataItem' para sa strict type-safety
          const chunks = items ? items.map((item: DataItem, index: number) => ({ ...item, chunk_id: index + 1 })) : [];
          return { 
            message: "Matagumpay na hinati ang mga data!",
            split_result: chunks 
          };
        });

      default:
        return await step.run("default-process", async () => {
          console.log("-> Walang katugmang action. Default path ang tinahak.");
          return { message: "Default action executed. Pumasok sa IF/ELSE fallback." };
        });
    }
  }
);
