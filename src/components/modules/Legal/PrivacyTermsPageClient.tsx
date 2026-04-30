"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, Cookie, ChevronRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

type Tab = "privacy" | "terms" | "cookies";

const tabs: { id: Tab; label: string; icon: typeof ShieldCheck }[] = [
  { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "cookies", label: "Cookie Policy", icon: Cookie },
];

const privacySections = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us, such as when you create an account, place an order, or contact support. This includes your name, email address, phone number, delivery address, and payment information (stored securely via our payment processor). We also automatically collect usage data, device identifiers, and log information when you interact with our platform.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to: process and fulfill your orders; communicate with you about orders, promotions, and updates; improve our platform and personalize your experience; detect and prevent fraud and abuse; comply with legal obligations; and send marketing communications (which you can opt out of at any time).`,
  },
  {
    title: "3. Sharing Your Information",
    body: `We do not sell your personal data. We share your information only with: restaurant partners (name, address, order details) to fulfill your order; payment processors to handle transactions securely; delivery partners to complete your order; analytics providers under strict data agreements; and law enforcement when legally required.`,
  },
  {
    title: "4. Data Security",
    body: `We protect your data using industry-standard AES-256 encryption in transit and at rest. Our infrastructure follows SOC 2 Type II practices. We conduct regular security audits and penetration testing. Despite our best efforts, no system is 100% secure — we encourage you to use strong, unique passwords.`,
  },
  {
    title: "5. Your Rights",
    body: `You have the right to access, correct, or delete your personal data. You may request a full export of your data or ask us to restrict processing at any time. To exercise these rights, contact us at privacy@foodhub.com or via your account settings. We will respond within 30 days.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your personal data for as long as your account is active or as needed to provide services. Certain data may be retained for legal or compliance purposes for up to 7 years. You may request deletion of your account and associated data at any time.`,
  },
  {
    title: "7. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Your continued use of FoodHub after changes take effect constitutes acceptance of the revised policy.`,
  },
];

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using FoodHub, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our platform. These terms apply to all users, including customers, restaurant partners, and delivery personnel.`,
  },
  {
    title: "2. User Accounts",
    body: `You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorized use. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "3. Orders and Payments",
    body: `All orders placed through FoodHub are subject to acceptance by the restaurant. Prices are set by restaurants and may vary. Payment is processed at the time of order. By providing payment details, you authorize FoodHub to charge the total amount including taxes, delivery fees, and applicable service fees.`,
  },
  {
    title: "4. Cancellations and Refunds",
    body: `Orders may be cancelled within 2 minutes of placement. After that, cancellation is subject to restaurant approval. Refunds for incorrect or missing items are issued after review by our support team, typically within 3–5 business days to your original payment method.`,
  },
  {
    title: "5. Prohibited Conduct",
    body: `You agree not to: use the platform for any fraudulent or unlawful purpose; interfere with or disrupt our services; attempt to gain unauthorized access to any part of the platform; post false, misleading, or offensive reviews; use automated tools to scrape or access our platform without permission.`,
  },
  {
    title: "6. Intellectual Property",
    body: `All content on FoodHub — including logos, text, graphics, and software — is the property of FoodHub or its licensors and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
  {
    title: "7. Limitation of Liability",
    body: `To the fullest extent permitted by law, FoodHub is not liable for any indirect, incidental, or consequential damages arising from your use of our platform. Our total liability for any claim is limited to the amount you paid for the order giving rise to the claim.`,
  },
];

const cookieSections = [
  {
    title: "1. What Are Cookies?",
    body: `Cookies are small text files stored on your device when you visit a website. They help us recognize you, remember your preferences, and improve your experience. We also use similar technologies like local storage and session tokens.`,
  },
  {
    title: "2. Types of Cookies We Use",
    body: `Essential Cookies: Required for the platform to function (e.g., authentication, cart). Analytics Cookies: Help us understand how users interact with our platform (e.g., Google Analytics). Marketing Cookies: Used to show you relevant ads and measure campaign effectiveness. Preference Cookies: Remember your settings like language and region.`,
  },
  {
    title: "3. Managing Cookies",
    body: `You can control cookies through your browser settings. Disabling certain cookies may affect functionality. You can also opt out of analytics tracking via our cookie preference center accessible in the footer. Essential cookies cannot be disabled.`,
  },
  {
    title: "4. Third-Party Cookies",
    body: `Some features use third-party services (e.g., Google Maps, Stripe) that set their own cookies subject to their privacy policies. We have no control over these cookies. We recommend reviewing the privacy policies of these third parties.`,
  },
];

const contentMap: Record<Tab, typeof privacySections> = {
  privacy: privacySections,
  terms: termsSections,
  cookies: cookieSections,
};

const colorMap: Record<Tab, string> = {
  privacy: "#377771",
  terms: "#ED6A5E",
  cookies: "#FFAF87",
};

export default function PrivacyTermsPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("privacy");
  const sections = contentMap[activeTab];
  const color = colorMap[activeTab];

  return (
    <main className="min-h-screen bg-[#FFFDF9]">
      {/* Hero */}
      <section className="relative py-24 lg:py-28 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-[#377771] blur-[200px] opacity-[0.06] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <motion.span {...fadeUp} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#377771]/20 bg-[#377771]/5 px-4 py-1.5 text-sm font-semibold text-[#377771] mb-6">
            <ShieldCheck className="h-3.5 w-3.5" /> Legal & Privacy
          </motion.span>
          <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827]">
            Your{" "}
            <span className="bg-gradient-to-r from-[#377771] to-[#4CE0B3] bg-clip-text text-transparent">
              Privacy
            </span>{" "}
            Matters
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-lg text-[#64748B] max-w-xl mx-auto">
            We believe in full transparency. Read our policies to understand how we collect, use, and protect your information.
          </motion.p>
          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-3 text-sm text-[#94A3B8]">
            Last updated: May 1, 2026
          </motion.p>
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Tab bar */}
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 mb-10">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const tc = colorMap[tab.id];
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${isActive ? "shadow-lg -translate-y-0.5" : "bg-white border-[#ECECEC] hover:shadow-md"}`}
                  style={isActive ? { backgroundColor: `${tc}10`, borderColor: `${tc}40` } : {}}>
                  <div className="h-9 w-9 flex items-center justify-center rounded-xl shrink-0"
                    style={{ backgroundColor: `${tc}20` }}>
                    <tab.icon className="h-5 w-5" style={{ color: tc }} />
                  </div>
                  <span className={`font-semibold text-sm ${isActive ? "" : "text-[#64748B]"}`}
                    style={isActive ? { color: tc } : {}}>
                    {tab.label}
                  </span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" style={{ color: tc }} />}
                </button>
              );
            })}
          </motion.div>

          {/* Content */}
          <div className="rounded-3xl bg-white border border-[#ECECEC] shadow-sm overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />
            <div className="p-8 lg:p-12 space-y-8">
              {sections.map((section, i) => (
                <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="border-b border-[#ECECEC] last:border-0 pb-8 last:pb-0">
                  <h2 className="text-lg font-bold mb-3" style={{ color }}>{section.title}</h2>
                  <p className="text-[#64748B] text-sm leading-relaxed">{section.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Questions? */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 rounded-2xl border border-[#ECECEC] bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="font-bold text-[#111827]">Have questions about our policies?</p>
              <p className="text-sm text-[#64748B]">Our privacy team is happy to help clarify anything.</p>
            </div>
            <a href="mailto:legal@foodhub.com"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: color }}>
              Email Legal Team →
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
