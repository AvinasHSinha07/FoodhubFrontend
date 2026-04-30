"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const contactCards = [
  { icon: Mail, title: "Email Us", desc: "Reply within 24 hours", value: "support@foodhub.com", color: "#ED6A5E" },
  { icon: Phone, title: "Call Us", desc: "Mon–Fri, 9am–6pm EST", value: "+1 (555) 123-4567", color: "#377771" },
  { icon: MapPin, title: "Visit Us", desc: "Open to partners", value: "123 Culinary Blvd, NY", color: "#4CE0B3" },
  { icon: Clock, title: "Live Chat", desc: "8am–10pm daily", value: "Start a chat below", color: "#FFAF87" },
];

const subjects = [
  "General Inquiry",
  "Order Issue",
  "Restaurant Partnership",
  "Billing & Payments",
  "Technical Support",
  "Media & Press",
];

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: subjects[0], message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Message sent! We'll be in touch within 24 hours.");
    setForm({ name: "", email: "", subject: subjects[0], message: "" });
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 lg:py-28 px-4 sm:px-6 lg:px-8 text-center">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#ED6A5E] blur-[200px] opacity-[0.05] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <motion.span {...fadeUp} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#ED6A5E]/20 bg-[#ED6A5E]/5 px-4 py-1.5 text-sm font-semibold text-[#ED6A5E] mb-6">
            <MessageSquare className="h-3.5 w-3.5" /> Get In Touch
          </motion.span>
          <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827]">
            We&apos;d Love to{" "}
            <span className="bg-gradient-to-r from-[#ED6A5E] to-[#FFAF87] bg-clip-text text-transparent">
              Hear From You
            </span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-lg text-[#64748B] max-w-xl mx-auto">
            Have a question, partnership idea, or just want to say hello? Drop us a message and we&apos;ll respond promptly.
          </motion.p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((card, i) => (
              <motion.div key={card.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-2xl bg-white border border-[#ECECEC] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 0% 0%, ${card.color}08, transparent 60%)` }} />
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <h3 className="font-bold text-[#111827] text-sm">{card.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5 mb-2">{card.desc}</p>
                <p className="text-sm font-semibold" style={{ color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Side */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-8">
            <motion.div {...fadeUp} transition={{ duration: 0.6 }}
              className="lg:col-span-3 rounded-3xl bg-white border border-[#ECECEC] p-8 lg:p-10 shadow-sm">
              <h2 className="text-2xl font-extrabold text-[#111827] mb-2">Send a Message</h2>
              <p className="text-sm text-[#64748B] mb-8">We&apos;ll respond within one business day.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-1.5">Your Name</label>
                    <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe" className="h-11 rounded-xl border-[#ECECEC] focus-visible:ring-[#ED6A5E] bg-[#F8F8F8]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-1.5">Email</label>
                    <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com" className="h-11 rounded-xl border-[#ECECEC] focus-visible:ring-[#ED6A5E] bg-[#F8F8F8]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1.5">Subject</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-11 rounded-xl border border-[#ECECEC] bg-[#F8F8F8] px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#ED6A5E]/30">
                    {subjects.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-1.5">Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help..." className="w-full rounded-xl border border-[#ECECEC] bg-[#F8F8F8] px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#ED6A5E]/30 resize-none" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full h-12 bg-[#ED6A5E] hover:bg-[#FF8E72] text-white rounded-xl font-semibold shadow-lg shadow-[#ED6A5E]/20 transition-all hover:-translate-y-0.5 disabled:opacity-70">
                  {loading ? "Sending…" : <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Send Message</span>}
                </Button>
              </form>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex-1 min-h-[260px] rounded-3xl overflow-hidden relative bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center shadow-lg">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#ED6A5E] blur-[80px] opacity-20" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#4CE0B3] blur-[80px] opacity-15" />
                <div className="relative text-center p-8">
                  <MapPin className="h-12 w-12 text-[#ED6A5E] mx-auto mb-3" />
                  <p className="text-white font-bold">123 Culinary Boulevard</p>
                  <p className="text-slate-400 text-sm">Food District, NY 10024</p>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4CE0B3] hover:text-[#FFAF87] transition-colors">
                    Open in Google Maps →
                  </a>
                </div>
              </div>
              <div className="rounded-3xl bg-white border border-[#ECECEC] p-6 shadow-sm">
                <h3 className="font-bold text-[#111827] mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#377771]" /> Support Hours
                </h3>
                {[
                  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
                  { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
                  { day: "Sunday", hours: "Closed" },
                ].map((row) => (
                  <div key={row.day} className="flex justify-between text-sm py-2 border-b border-[#ECECEC] last:border-0">
                    <span className="text-[#64748B]">{row.day}</span>
                    <span className={`font-semibold ${row.hours === "Closed" ? "text-[#ED6A5E]" : "text-[#377771]"}`}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
