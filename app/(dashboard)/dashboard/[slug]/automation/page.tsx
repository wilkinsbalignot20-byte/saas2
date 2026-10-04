 // app/(dashboard)/dashboard/[slug]/automation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Zap } from "lucide-react";
import { Panel, PanelHeader, Notice } from "@/components/dashboard/marketing/shared";

export default function AutomationPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Facebook Connection States
  const [fbPageId, setFbPageId] = useState<string | null>(null);
  const [isFbConfigured, setIsFbConfigured] = useState(false);
  const [pageName, setPageName] = useState<string | null>(null);

  // 🌐 1. I-load ang estado ng Facebook mula sa iyong facebook/route.ts endpoint
  useEffect(() => {
    async function loadFacebookSettings() {
      try {
        const res = await fetch(`/api/stores/${slug}/automation/facebook`);
        if (!res.ok) throw new Error("Bigo sa pag-load ng Facebook integration parameters.");
        const data = await res.json();
        
        setFbPageId(data.fbPageId);
        setIsFbConfigured(data.isConfigured);
        setPageName(data.pageName || null);
      } catch (err: any) {
        setNotice({ kind: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadFacebookSettings();
  }, [slug]);

  // 🌐 2. Pagpindot sa Connect Page button (Gagamit ng TOTOONG token na inilagay natin sa backend)
  const handleFacebookConnect = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/stores/${slug}/automation/facebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONNECT_MOCK" }), 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Graph API Auth Integration failed.");

      setIsFbConfigured(data.isConfigured);
      setFbPageId(data.fbPageId);
      setPageName(data.pageName || null);
      setNotice({ kind: "success", text: `Maligayang pagbati! Matagumpay na naikabit ang iyong Facebook Page (${data.pageName}).` });

    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // 🌐 3. BAGO: Pagpindot sa Disconnect Button para burahin ang token at ID sa database
  const handleFacebookDisconnect = async () => {
    if (!confirm("Sigurado ka ba na gusto mong alisin ang koneksyon sa iyong Facebook Page?")) return;
    
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/stores/${slug}/automation/facebook`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect Facebook Page.");

      setIsFbConfigured(false);
      setFbPageId(null);
      setPageName(null);
      setNotice({ kind: "success", text: "Matagumpay na inalis ang koneksyon ng iyong Facebook Page." });
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-slate-500 font-medium animate-pulse">Inihahanda ang automation panel settings...</div>;
  }

  return (
    <Panel>
      <PanelHeader
        icon={<Zap className="text-amber-500" size={20} />}
        title="Automation Engine Control"
        description="Paganahin at i-manage ang mga background integrations ng iyong online store platform."
      />

      {notice && (
        <div className="px-5 pb-5 sm:px-6">
          <Notice kind={notice.kind} onClose={() => setNotice(null)}>
            {notice.text}
          </Notice>
        </div>
      )}

      <div className="divide-y divide-slate-200 border-t border-slate-200">
        
        {/* FACEBOOK SYSTEM CARD ROW */}
        <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between bg-slate-50/50">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.85z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900">Meta Facebook Page Automation</h4>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Kapag aktibo, awtomatikong mag-susumite ng post ang system sa feed ng iyong Facebook business page sa tuwing maglalathala ka ng bagong produkto sa website.
              </p>
              {isFbConfigured && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {pageName ? `${pageName} ` : ""}Connected (ID: {fbPageId})
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-end md:self-center shrink-0">
            {!isFbConfigured ? (
              <button
                type="button"
                onClick={handleFacebookConnect}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.85z"/>
                </svg>
                {saving ? "Kumokonekta..." : "Connect Facebook Page"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFacebookDisconnect}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
              >
                Disconnect Page
              </button>
            )}
          </div>
        </div>

      </div>
    </Panel>
  );
}
