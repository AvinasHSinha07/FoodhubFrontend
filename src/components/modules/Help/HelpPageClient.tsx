"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Search, Package, CreditCard, UserCircle, Truck, Star, ShieldCheck } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const categories = [
  { icon: Package, label: "Orders", color: "#ED6A5E" },
  { icon: CreditCard, label: "Payments", color: "#377771" },
  { icon: Truck, label: "Delivery", color: "#4CE0B3" },
  { icon: UserCircle, label: "Account", color: "#FFAF87" },
  { icon: Star, label: "Reviews", color: "#FF8E72" },
  { icon: ShieldCheck, label: "Safety", color: "#64748B" },
];

const faqs = [
  {
    q: "How do I place an order on FoodHub?",
    a: "Browse meals or restaurants, add items to your cart, review your order, and proceed to checkout. You can pay with any major card or digital wallet. Your order is confirmed instantly and sent to the restaurant.",
  },
  {
    q: "Can I track my delivery in real time?",
    a: "Yes! Once your order is accepted and dispatched, you can track its live status directly from your order details page. You'll receive notifications at each stage.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as digital wallets like Apple Pay and Google Pay. All payments are encrypted and secure.",
  },
  {
    q: "How do I cancel or modify my order?",
    a: "Orders can be cancelled within 2 minutes of placement from your Orders page. After that window, please contact our support team directly via chat or email and we'll do our best to help.",
  },
  {
    q: "What if my order is wrong or missing items?",
    a: "We're sorry for the inconvenience! Please report the issue from your Order History within 24 hours. Our support team will review and issue a full refund or redelivery as appropriate.",
  },
  {
    q: "How do I become a restaurant partner?",
    a: "Register on FoodHub as a Provider and complete your profile with restaurant details, menu, and operating hours. Our partner success team will review and activate your account within 48 hours.",
  },
  {
    q: "How are delivery fees calculated?",
    a: "Delivery fees are based on distance from the restaurant to your address. You'll always see the exact fee before confirming your order. Premium members enjoy reduced or waived fees.",
  },
  {
    q: "Is my personal data secure?",
    a: "Absolutely. We use industry-standard AES-256 encryption, never sell your data, and are fully GDPR compliant. You can export or delete your data at any time from your account settings.",
  },
];

export default function HelpPageClient() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FFFDF9]">
      {/* Hero */}
      <section className="relative py-24 lg:py-28 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#377771] blur-[200px] opacity-[0.06] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <motion.span {...fadeUp} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#377771]/20 bg-[#377771]/5 px-4 py-1.5 text-sm font-semibold text-[#377771] mb-6">
            <HelpCircle className="h-3.5 w-3.5" /> Help Center
          </motion.span>
          <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827]">
            How Can We{" "}
            <span className="bg-gradient-to-r from-[#377771] to-[#4CE0B3] bg-clip-text text-transparent">
              Help You?
            </span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-lg text-[#64748B] max-w-xl mx-auto mb-8">
            Find answers to your questions, browse our guides, or reach out to our support team.
          </motion.p>

          {/* Search */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}
            className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your question…"
              className="w-full h-14 rounded-2xl border border-[#ECECEC] bg-white pl-12 pr-6 text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#377771]/30 text-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.button key={cat.label} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-white border border-[#ECECEC] p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${cat.color}15` }}>
                  <cat.icon className="h-5 w-5" style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#111827] transition-colors">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-3xl">
          <motion.h2 {...fadeUp} transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold text-[#111827] mb-2 text-center">
            Frequently Asked Questions
          </motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#64748B] text-center mb-10">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {search ? ` for "${search}"` : ""}
          </motion.p>

          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-[#ECECEC] bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span className={`font-semibold text-sm transition-colors ${openIdx === i ? "text-[#377771]" : "text-[#111827] group-hover:text-[#377771]"}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 ml-4 transition-transform duration-300 ${openIdx === i ? "rotate-180 text-[#377771]" : "text-[#94A3B8]"}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openIdx === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="px-6 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#ECECEC] pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-[#94A3B8]">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No results found for &quot;{search}&quot;</p>
                <p className="text-sm mt-1">Try a different search term or browse by category above.</p>
              </div>
            )}
          </div>

          {/* Still need help? */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#377771] blur-[80px] opacity-20" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#ED6A5E] blur-[80px] opacity-15" />
            <div className="relative">
              <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
              <p className="text-slate-400 text-sm mb-6">Our support team is ready to assist you with any issue.</p>
              <a href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ED6A5E] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ED6A5E]/20 hover:bg-[#FF8E72] transition-colors">
                Contact Support →
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
