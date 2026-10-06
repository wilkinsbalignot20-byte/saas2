 "use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function SimpleSlackTester() {
  const params = useParams();
  const slug = params?.slug as string;

  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState("");

  // 🧪 1. DIRECT TEST WITHOUT RESTRICTIONS
  const handleTest = async () => {
    if (!webhookUrl.trim()) {
      setStatus("❌ ERROR: Mag-paste muna ng URL sa kahon.");
      return;
    }
    
    setStatus("📡 Sinusubukan ang koneksyon... Pakihintay...");
    try {
      const res = await fetch(`/api/stores/${slug}/automation/slack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "TEST_INGEST", 
          webhookUrl: webhookUrl.trim() 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bigo ang handshake request.");
      setStatus("✅ SUCCESS! Matagumpay na nakatawid ang alert sa iyong Slack channel!");
    } catch (err: any) {
      setStatus(`❌ SERVER ERROR: ${err.message}`);
    }
  };

  // 💾 2. DIRECT SAVE TO DATABASE
  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      setStatus("❌ ERROR: Mag-paste muna ng URL sa kahon.");
      return;
    }

    setStatus("🗄️ Sinasave sa database...");
    try {
      const res = await fetch(`/api/stores/${slug}/automation/slack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "SAVE_CONFIG", 
          webhookUrl: webhookUrl.trim() 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bigo sa pag-save.");
      setStatus("💾 SUCCESS! Permanente nang naitabi ang link sa iyong Supabase Row!");
    } catch (err: any) {
      setStatus(`❌ SERVER ERROR: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-xl shadow border mt-10 space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Simple Slack Ingestion Tester</h2>
      <p className="text-xs text-slate-500">
        Siguraduhing ang dulo ng iyong webhook link ay nagtatapos sa saktong code mula sa Slack dashboard.
      </p>
      
      <input
        type="text"
        placeholder="I-paste ang Slack Webhook URL dito..."
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        className="w-full text-xs p-3 border rounded font-mono bg-slate-50 focus:ring-1 focus:ring-purple-500 outline-none"
      />

      <div className="flex gap-2">
        <button
          onClick={handleTest}
          className="bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded hover:bg-purple-700 transition"
        >
          🚀 Test Link
        </button>
        <button
          onClick={handleSave}
          className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded hover:bg-emerald-700 transition"
        >
          💾 Save to DB
        </button>
      </div>

      {status && (
        <div className="p-3 text-xs rounded bg-slate-100 font-medium text-slate-700 border">
          Status response: {status}
        </div>
      )}
    </div>
  );
}
