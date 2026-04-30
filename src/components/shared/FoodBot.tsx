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
} from "lucide-react";
import { ChatServices, TChatMessage } from "@/services/chat.services";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type TDisplayMessage = {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
};

// ── Quick Prompt Chips ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "🍕 What meals do you have?",
  "🌱 Any vegan options?",
  "🍜 Show me restaurants",
  "⏱️ How fast is delivery?",
];

// ── Greeting ──────────────────────────────────────────────────────────────────
const INITIAL_MESSAGE: TDisplayMessage = {
  id: "init",
  role: "model",
  content:
    "Hey there! 👋 I'm **FoodBot**, your personal assistant at FoodHub.\n\nI know exactly what meals and restaurants we have right now — ask me anything!",
  timestamp: new Date(),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderMarkdown = (text: string) => {
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\n/g, "<br />");
  return html;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Converts display messages to API history format, skipping the initial greeting
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

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
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

      // Capture history BEFORE adding new user message
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
        toast.error("FoodBot is temporarily unavailable. Please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setInput(text);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* ── Floating Trigger Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="hidden sm:block bg-background/90 backdrop-blur-xl border border-border/60 text-foreground text-xs font-bold px-4 py-2 rounded-full shadow-lg"
            >
              Ask FoodBot anything 🍽️
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="foodbot-trigger"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen((v) => !v)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] text-white shadow-[0_8px_32px_rgba(237,106,94,0.45)] flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#ED6A5E]/30"
          aria-label="Open FoodBot chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BrainCircuit className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread indicator */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4CE0B3] rounded-full border-2 border-background animate-pulse" />
          )}
        </motion.button>
      </div>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="foodbot-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-28 right-6 z-50 w-[min(420px,calc(100vw-24px))] flex flex-col rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-border/50"
            style={{ height: "min(600px, calc(100vh - 140px))" }}
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#0A0F1E] to-[#1a2035] flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ED6A5E]/10 to-[#377771]/10 pointer-events-none" />

              <div className="relative flex items-center justify-center w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] shadow-lg flex-shrink-0">
                <ChefHat className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1 min-w-0 relative">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-sm">FoodBot</h3>
                  <div className="flex items-center gap-1 bg-[#4CE0B3]/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#4CE0B3] rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-[#4CE0B3] uppercase tracking-wider">
                      Live Data
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Powered by Gemini AI · Knows your real menu
                </p>
              </div>

              <div className="relative flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleReset}
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                  title="Reset conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-background px-4 py-5 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot Avatar */}
                  {msg.role === "model" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] flex items-center justify-center shadow-md mt-0.5">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[82%] flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-[18px] text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] text-white rounded-br-[6px] shadow-md"
                          : "bg-muted/60 border border-border/40 text-foreground rounded-bl-[6px]"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] flex items-center justify-center shadow-md">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted/60 border border-border/40 px-4 py-3.5 rounded-[18px] rounded-bl-[6px] flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-[#ED6A5E] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts — shown only on first open */}
            {messages.length === 1 && (
              <div className="px-4 py-3 bg-background border-t border-border/40 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full bg-muted/60 hover:bg-[#ED6A5E]/10 hover:text-[#ED6A5E] hover:border-[#ED6A5E]/30 border border-border/50 text-foreground transition-all whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 bg-background border-t border-border/40 flex-shrink-0"
            >
              <input
                ref={inputRef}
                id="foodbot-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about meals, restaurants, delivery..."
                disabled={isLoading}
                className="flex-1 min-w-0 bg-muted/50 border border-border/50 rounded-[14px] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#ED6A5E]/30 focus:border-[#ED6A5E]/50 transition-all disabled:opacity-50"
              />
              <Button
                id="foodbot-send"
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-[#ED6A5E] to-[#FF8E72] hover:from-[#FF8E72] hover:to-[#ED6A5E] text-white flex-shrink-0 disabled:opacity-40 shadow-md hover:-translate-y-0.5 transition-all"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
