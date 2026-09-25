 import { inngest } from "../client";

export const dataJudgeWorkflow = inngest.createFunction(
  { 
    id: "data-judge-workflow", 
    name: "Local Judge (Merge/Split/Switch Test)",
    triggers: [{ event: "app/test.data" }] 
  },
  async ({ event, step }) => {
    // Sasaluhin ang mock data na ipapadala natin sa dashboard
    const { action, items } = (event.data || {}) as any;

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
          const chunks = items ? items.map((item: any, index: number) => ({ ...item, chunk_id: index + 1 })) : [];
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
