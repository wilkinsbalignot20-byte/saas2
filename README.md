This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# 🚀 AI-Powered RAG Chat Assistant Implementation

We have successfully engineered and deployed a custom **Retrieval-Augmented Generation (RAG)** Chat Assistant integrated into the main marketplace landing page. The architecture safely bypasses typical framework and major-version mismatches (React 19 / Next.js 16) by implementing a high-performance custom data stream client connected to a robust, event-driven background ingestion infrastructure.

---

## 🛠️ Tech Stack & Technologies Used
* **Framework:** Next.js 16 (App Router) & React 19
* **AI Core:** Vercel AI SDK (v7) & `@ai-sdk/google` (Gemini-1.5-Flash)
* **Database & ORM:** Supabase (PostgreSQL with `pgvector`) & Prisma (v7 Client)
* **Background Jobs Queue:** Inngest (v4)

---

## 🎉 Milestones & Achievements

### 1. Vector Database Setup (`Supabase` + `Prisma`)
* **Database Extension:** Enabled the `pgvector` extension inside the Supabase PostgreSQL database to allow high-dimensional vector storage.
* **Prisma Mapping:** Configured `schema.prisma` models to handle modern raw semantic mapping and defined tables for storing knowledge bases (`store_knowledge`) with **3072 dimensions** to seamlessly support modern embeddings.
* **Matching Function:** Successfully injected a native PostgreSQL database function (`match_store_knowledge`) to perform lightning-fast **Cosine Distance Similarity Searches** directly inside the database cluster.

### 2. Robust Background Knowledge Ingestion (`Inngest` Worker)
* **Event-Driven Architecture:** Registered a new workflow (`syncStoreKnowledgeWorkflow`) inside the local Inngest background process engine listening to `shop/knowledge.sync` events.
* **Google Embedding Integration:** Connected the workflow to the official Google AI **`gemini-embedding-001`** model to translate raw text contents into vector arrays.
* **Safe Database Casting:** Implemented stringified JSON vector serialization to seamlessly insert multi-dimensional matrix layers into Supabase via Prisma's `$queryRaw` protocol without encountering transaction or type mismatches.

### 3. Enterprise Streaming Backend (`Next.js API Route`)
* **Route Handler:** Engineered a fully decentralized endpoint at `app/api/chat/route.ts` running on the native Node.js application environment.
* **Semantic Querying:** The route programmatically accepts user prompts, generates live question embeddings, queries the Supabase vector database for matching knowledge chunks, and appends the relevant text into the model's system prompt context.
* **Next-Gen Text Streaming:** Configured `streamText` to utilize `google('gemini-1.5-flash')` and successfully stream rapid, typed text tokens back to the UI layout using `toTextStreamResponse()`.

### 4. Zero-Dependency Custom UI Widget (`React 19 Client Component`)
* **Component Design:** Built a clean, modern floating chat bubble widget at `components/marketplace/chat-widget.tsx` that stays pinned to the bottom-right corner of the marketplace interface.
* **Stream Token Reader:** Programmed a standard Web API `ReadableStreamDefaultReader` client loop to fetch raw text streams manually. This isolates state management from volatile library versions, ensuring absolute consistency, structural integrity, and no breaking UI changes.

---

## 🔄 The Complete RAG Data Flow

1. **Ingestion (Admin Profile / Testing):** Raw marketplace knowledge (e.g., store hours, platform shipping methods, and courier rules) is submitted. Inngest transforms this string into a **3072-dimensional vector** and locks it into the `store_knowledge` table.
2. **User Prompt (Frontend Widget):** A shopper types a specialized query (e.g., *"Who is Manipu?"* or *"What couriers do you support?"*).
3. **Retrieval Search (API Route):** The backend converts the user's question into a live semantic vector, asks Supabase to scan the knowledge database for matching references, and extracts the top relevant documents.
4. **Contextual Generation (Gemini AI):** The matched texts are passed into **Gemini-1.5-Flash** as explicit contextual evidence, instructing the AI to answer the customer with 100% accuracy based strictly on your platform's authentic records.
