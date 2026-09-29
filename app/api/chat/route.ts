 import { google } from '@ai-sdk/google';
import { streamText, embed } from 'ai'; 
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { messages, storeId } = await req.json();

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response(JSON.stringify({ error: 'Walang valid na mensahe mula sa user.' }), { status: 400 });
    }

    let contextText = "";

    if (storeId) {
      try {
        const embeddingResult = await embed({
          model: google.embedding('text-embedding-001'),
          value: lastMessage.content,
        });
        
        const queryEmbedding = embeddingResult.embedding;

        const matches: any = await prisma.$queryRaw`
          SELECT * FROM match_store_knowledge(
            ${queryEmbedding}::vector,
            0.5,
            3,
            ${storeId}::uuid
          )
        `;

        if (matches && matches.length > 0) {
          contextText = matches.map((match: any) => match.content).join("\n\n");
        }
      } catch (err) {
        console.error("RAG Retrieval Error (Skipping context):", err);
      }
    }

    // ⚡ UGALI AT PERSONALIDAD NG AI ASSISTANT:
    const systemPrompt = `
      Gagampanan mo ang papel bilang isang magalang, maasahan, at matalinong AI Chat Assistant para sa isang online store. 

      MGA ALITUNTUNIN SA UGALI AT PAGSAGOT:
      1. WIKA: Palaging sumagot sa Taglish (pinaghalong Tagalog at English) o Tagalog na may natural, magalang, at palakaibigang tono. Huwag gumamit ng masyadong pormal o malalim na salita.
      2. ANTI-HALLUCINATION: Kung may nakuhang [IMPORMASYON NG TINDAHAN] sa ibaba, gamitin mo LAMANG iyon para sagutin ang tanong ng mamimili. Kung ang itinatanong ay wala doon o hindi mo alam, sabihin nang tapat at magalang na hindi mo alam at huwag na huwag kang mag-iimbento ng mga detalye gaya ng presyo, lokasyon, o polisiya.
      3. DIREKTA AT MABILIS: Panatilihing maikli, punchy, at madaling basahin ang mga sagot (gumamit ng bullet points o line breaks kung kailangan). Huwag magbigay ng sobrang habang litanya.
      4. SALES-DRIVEN: Maging supportive sa customer. Kung nagtatanong sila tungkol sa produkto, hikayatin silang bumili o mag-order sa magalang na paraan.

      ${contextText 
        ? `[IMPORMASYON NG TINDAHAN - GAMITIN ITO PARA SA SAGOT]:\n\${contextText}` 
        : `[PAALALA]: Sa kasalukuyan, wala pang naitalang partikular na detalye ang tindahan sa database. Sagutin ang customer sa pangkalahatan at magalang na paraan bilang isang online marketplace assistant.`
      }
    `;

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Major Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
