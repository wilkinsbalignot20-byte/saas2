 'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Send, Bot, ShieldCheck } from 'lucide-react';

export default function ChatWidget({ storeId }: { storeId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Awtomatikong nag-o-scroll sa pinakailalim kapag may bagong chat stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, storeId }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body antialiased">
      {/* 💬 FLOATING CHAT BUTTON (Sumusunod sa Premium Minimalist Badge Style) */}
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="flex items-center gap-2 px-4 py-3 bg-ink text-paper hover:bg-ink/90 rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 text-sm font-medium tracking-tight cursor-pointer"
        >
          <MessageSquare size={16} strokeWidth={2} />
          <span>Chat assistant</span>
        </button>
      ) : (
        /* 📦 CHAT WINDOW WINDOW (Gaya ng malilinis na card borders ng dashboard mo) */
        <div className="w-80 sm:w-96 h-[480px] bg-white border border-ink/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          
          {/* 🏷️ HEADER (Premium Branding Layout) */}
          <div className="p-4 border-b border-ink/5 bg-paper text-ink flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 bg-ink/5 rounded-xl flex items-center justify-center border border-ink/10">
                  <Bot size={16} className="text-ink/70" strokeWidth={2} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-teal-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-display font-bold text-sm tracking-tight text-ink">AI Store Assistant</h4>
                <p className="text-[10px] text-ink/40 font-medium">Verified storefront helper</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 hover:bg-ink/5 rounded-lg text-ink/40 hover:text-ink transition-colors cursor-pointer"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* 💬 CHAT MESSAGES PANEL */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-paper/30">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink/40 space-y-2">
                <div className="p-3 bg-ink/5 rounded-full text-ink/50 border border-ink/5">
                  <ShieldCheck size={20} strokeWidth={1.75} />
                </div>
                <p className="font-semibold text-xs text-ink">May katanungan ka ba?</p>
                <p className="max-w-[220px] mx-auto text-[11px] leading-relaxed text-ink/40">
                  Magtanong tungkol sa aming mga produkto, oras ng tindahan, o polisiya sa pagre-refund.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                <div 
                  className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed border shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-ink text-white border-ink rounded-tr-none' 
                      : 'bg-white border-ink/10 text-ink rounded-tl-none font-medium'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start items-center gap-1 text-ink/40 text-[11px] italic bg-white border border-ink/10 p-3 rounded-xl rounded-tl-none shadow-sm max-w-[40%] animate-pulse">
                <span>Nag-iisip</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
                <span className="animate-bounce delay-300">.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ⌨️ INPUT FORM SUBMISSION BOX */}
          <form onSubmit={send} className="p-3 bg-white border-t border-ink/5 flex gap-2 items-center">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Sumulat ng mensahe..." 
              className="flex-1 px-3 py-2 bg-ink/5 hover:bg-ink/5 focus:bg-white border border-ink/10 focus:border-ink/30 rounded-xl text-xs outline-none transition-all placeholder:text-ink/30 text-ink"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="p-2 bg-ink hover:bg-ink/90 disabled:bg-ink/10 text-white disabled:text-ink/30 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Send size={14} strokeWidth={2.25} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
