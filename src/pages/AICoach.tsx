import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../App";
import { chatWithSystem } from "../lib/groq";
import { motion, AnimatePresence } from "motion/react";
import { Send, Terminal, User, Sparkles, AlertTriangle } from "lucide-react";

export function AICoach() {
  const { profile, stats } = useAuth();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hunter. State your query. I am the System. I observe all. Your growth is my only interest." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await chatWithSystem(newMessages, profile!, stats);
      setMessages([...newMessages, { role: "assistant" as const, content: response }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant" as const, content: "ERROR: Connection unstable. Manual override required." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-[0.5em] mb-1">Direct Neural Link</p>
          <h2 className="text-3xl font-display font-bold uppercase italic tracking-tight">The System</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[9px] font-mono text-primary uppercase tracking-widest">Online</span>
        </div>
      </header>

      <div className="flex-grow sl-card !p-0 flex flex-col overflow-hidden relative">
        {/* Chat Background Decal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Terminal className="w-64 h-64 text-primary" />
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-surface-light text-text-muted border border-white/5'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-[0_4px_15px_rgba(127,119,221,0.2)]' 
                    : 'bg-surface-light text-text rounded-tl-none border border-white/5 font-display'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-surface-light rounded flex items-center justify-center border border-white/5">
                  <Terminal className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="bg-surface-light p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-base/50 border-t border-white/5 backdrop-blur-sm">
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query the System..."
              className="w-full bg-surface-light border border-white/10 rounded-xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder:text-text-muted/50"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-2 bottom-2 w-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-50"
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex items-center gap-1.5 opacity-30 group cursor-help">
          <AlertTriangle className="w-3 h-3 text-orange-500" />
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-text-muted">Directives are non-negotiable</span>
        </div>
      </div>
    </div>
  );
}
