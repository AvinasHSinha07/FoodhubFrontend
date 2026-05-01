"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  X,
  Send,
  Loader2,
  ChefHat,
  Sparkles,
  RotateCcw,
  MessageSquareText,
  Zap,
  Info,
} from "lucide-react";
import { ChatServices, TChatMessage } from "@/services/chat.services";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type TDisplayMessage = {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
};

// ── Quick Prompt Chips ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "🍕 What's on the menu?",
  "🌱 Vegan options?",
  "🍜 Best restaurants?",
  "⏱️ Delivery time?",
];

// ── Greeting ──────────────────────────────────────────────────────────────────
const INITIAL_MESSAGE: TDisplayMessage = {
  id: "init",
  role: "model",
  content:
    "Hey! I'm **FoodBot**, your concierge at FoodHub. I can help you find the perfect meal or check on restaurant availability. What are you craving today?",
  timestamp: new Date(),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderMarkdown = (text: string) => {
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong class='font-black text-foreground'>$1</strong>");
  html = html.replace(/\n/g, "<br />");
  return html;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const toApiHistory = (msgs: TDisplayMessage[]): TChatMessage[] =>
  msgs.slice(1).map((m) => ({ role: m.role, parts: m.content }));

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FoodBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TDisplayMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: TDisplayMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      const apiHistory = toApiHistory(messages);
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const result = await ChatServices.sendMessage(text.trim(), apiHistory);
        const botMsg: TDisplayMessage = {
          id: `model-${Date.now()}`,
          role: "model",
          content: result.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error("[FoodBot] Error:", err);
        toast.error("Assistant offline. Please try again later.");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setInput(text);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
    setInput("");
  };

  return (
    <>
      {/* ── Trigger Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
        <AnimatePresence>
          {!isOpen && hasUnread && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 border border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] px-5 py-3 rounded-2xl pointer-events-auto"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4CE0B3]/10 text-[#4CE0B3]">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#ED6A5E]">FoodHub AI</p>
                <p className="text-[13px] font-bold text-foreground">Need help ordering?</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasUnread(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="foodbot-trigger"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            "pointer-events-auto relative w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-2xl",
            isOpen 
              ? "bg-slate-900 text-white rotate-0" 
              : "bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] text-white"
          )}
        >
          {isOpen ? <X className="h-7 w-7" /> : <BrainCircuit className="h-7 w-7" />}
          
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4CE0B3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-[#4CE0B3] border-2 border-white dark:border-slate-950"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="foodbot-panel"
            initial={{ opacity: 0, y: 32, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 32, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed bottom-28 right-6 z-50 w-[min(440px,calc(100vw-32px))] flex flex-col rounded-[32px] overflow-hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
            style={{ height: "min(640px, calc(100vh - 160px))" }}
          >
            {/* Mesh Header */}
            <div className="relative p-6 flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ED6A5E]/10 via-[#FFAF87]/5 to-[#4CE0B3]/10 dark:from-[#ED6A5E]/20 dark:to-[#377771]/20 opacity-50" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ED6A5E]/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] shadow-xl text-white">
                    <ChefHat className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                      FoodBot
                      <span className="flex h-2 w-2 rounded-full bg-[#4CE0B3]">
                        <span className="animate-ping h-full w-full rounded-full bg-[#4CE0B3] opacity-75"></span>
                      </span>
                    </h3>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Personal Concierge</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-1 border border-border/40">
                  <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all">
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              data-lenis-prevent
              className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-border dark:scrollbar-thumb-slate-800"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className={cn("flex flex-col gap-1.5", msg.role === "user" ? "items-end" : "items-start")}
                >
                  <div className={cn(
                    "relative group max-w-[85%] px-5 py-3.5 rounded-[24px] text-[15px] leading-relaxed font-medium shadow-sm",
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] text-white rounded-br-[4px]" 
                      : "bg-white dark:bg-slate-900 border border-border/40 dark:border-slate-800 text-foreground rounded-bl-[4px]"
                  )}>
                    {msg.role === "model" && (
                      <div className="absolute -left-2 top-0 text-[#ED6A5E] opacity-20 pointer-events-none">
                        <Sparkles className="h-8 w-8" />
                      </div>
                    )}
                    <div 
                      className="relative z-10"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} 
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                  <div className="bg-white dark:bg-slate-900 border border-border/40 dark:border-slate-800 px-5 py-4 rounded-[24px] rounded-bl-[4px] w-20 flex justify-center items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#ED6A5E] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex-shrink-0 space-y-4">
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-border/50 dark:border-slate-800 hover:border-[#ED6A5E] dark:hover:border-[#ED6A5E] hover:text-[#ED6A5E] transition-all text-muted-foreground shadow-sm active:scale-95"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="w-full h-14 pl-12 pr-16 bg-white dark:bg-slate-900 border border-border/50 dark:border-slate-800 rounded-[20px] text-[15px] font-medium outline-none focus:ring-2 focus:ring-[#ED6A5E]/20 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
                />
                <div className="absolute left-4 text-muted-foreground">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="absolute right-2 h-10 w-10 rounded-2xl bg-[#ED6A5E] hover:bg-[#FF8E72] text-white shadow-lg shadow-[#ED6A5E]/20 transition-all active:scale-90"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>

              <div className="flex items-center justify-center gap-1.5 opacity-40">
                <Info className="h-3 w-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">FoodBot can make mistakes. Verify critical info.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
