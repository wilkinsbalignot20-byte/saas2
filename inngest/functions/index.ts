 import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { inngest } from "../client";
import { dataJudgeWorkflow } from "./dataJudge";
import { customerOtpWorkflow } from "../customerAuth";

// 🆕 TAMA: Para sa Inngest v4 at Prisma v7 (Walang backslash at pinagsamang arguments)
export const syncStoreKnowledgeWorkflow = inngest.createFunction(
  { 
    id: "sync-store-knowledge",
    triggers: [{ event: "shop/knowledge.sync" }] // ⚡ Pinagsama ang ID at Trigger sa iisang object
  },
  async ({ event }) => {
    const { storeId, content } = event.data;

    // 1. Gawan ng Embedding/Vector ang teksto gamit ang Google
    const embeddingResult = await embed({
      model: google.embedding("gemini-2.5-flash"),
      value: content,
    });
    const vector = embeddingResult.embedding;

    // 2. TAMA: Ginagawang string ang vector array para pumasok nang maayos sa PostgreSQL casting
    const vectorString = JSON.stringify(vector);

    await prisma.$queryRaw`
      INSERT INTO store_knowledge (id, store_id, content, embedding, created_at, updated_at)
      VALUES (
        gen_random_uuid(), 
        ${storeId}::uuid, 
        ${content}, 
        ${vectorString}::vector, 
        NOW(), 
        NOW()
      )
    `;


    return { success: true, message: "RAG context embedded and saved!" };
  }
);

// ⚡ IDINAGDAG: Isinama si syncStoreKnowledgeWorkflow sa iyong listahan ng functions
export const inngestFunctions = [
  dataJudgeWorkflow, 
  customerOtpWorkflow,
  syncStoreKnowledgeWorkflow 
];
