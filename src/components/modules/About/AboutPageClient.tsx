"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Truck, Heart, Shield, Zap, Star, Users, ChefHat, Award } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

const stats = [
  { icon: Users, value: "50K+", label: "Happy Customers", color: "#ED6A5E" },
  { icon: ChefHat, value: "500+", label: "Partner Restaurants", color: "#377771" },
  { icon: Truck, value: "1M+", label: "Meals Delivered", color: "#4CE0B3" },
  { icon: Star, value: "4.9", label: "Average Rating", color: "#FFAF87" },
];

const values = [
  {
    icon: Heart,
    title: "Passion for Food",
    desc: "We are foodies at heart. Every feature we build is inspired by our love for great cuisine and the people who create it.",
    color: "#ED6A5E",
    bg: "from-[#ED6A5E]/10 to-[#FFAF87]/5",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    desc: "From verified restaurants to secure payments, we make sure every interaction on FoodHub is safe and transparent.",
    color: "#377771",
    bg: "from-[#377771]/10 to-[#4CE0B3]/5",
  },
  {
    icon: Zap,
    title: "Speed & Reliability",
    desc: "We respect your time. Our platform is engineered for blazing-fast performance and consistent on-time deliveries.",
    color: "#4CE0B3",
    bg: "from-[#4CE0B3]/10 to-[#377771]/5",
  },
  {
    icon: Award,
    title: "Quality First",
    desc: "We partner only with restaurants that share our commitment to quality. Every meal must meet our gold standard.",
    color: "#FFAF87",
    bg: "from-[#FFAF87]/10 to-[#FF8E72]/5",
  },
];

const team = [
  { name: "Sarah Chen", role: "Co-Founder & CEO", initials: "SC", color: "#ED6A5E", avatar: "https://i.pravatar.cc/150?u=sarah_chen" },
  { name: "Marcus Rivera", role: "Co-Founder & CTO", initials: "MR", color: "#377771", avatar: "https://i.pravatar.cc/150?u=marcus_rivera" },
  { name: "Aisha Patel", role: "Head of Operations", initials: "AP", color: "#4CE0B3", avatar: "https://i.pravatar.cc/150?u=aisha_patel" },
  { name: "James Okafor", role: "Head of Design", initials: "JO", color: "#FFAF87", avatar: "https://i.pravatar.cc/150?u=james_okafor" },
];

export default function AboutPageClient() {
  return (
    <main className="min-h-screen bg-[#FFFDF9] dark:bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#ED6A5E] blur-[180px] opacity-[0.06]" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#377771] blur-[180px] opacity-[0.08]" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ED6A5E]/20 bg-[#ED6A5E]/5 px-4 py-1.5 text-sm font-semibold text-[#ED6A5E] mb-6">
              <Heart className="h-3.5 w-3.5" /> Our Story
            </span>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#111827] dark:text-foreground leading-tight"
          >
            Food Delivered with{" "}
            <span className="bg-gradient-to-r from-[#ED6A5E] to-[#FFAF87] bg-clip-text text-transparent">
              Soul
            </span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-6 text-xl text-[#64748B] leading-relaxed max-w-2xl mx-auto"
          >
            FoodHub was born from a simple belief — everyone deserves restaurant-quality food at their
            doorstep. We connect food lovers with the best local restaurants, making every meal an experience.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative group rounded-2xl bg-white dark:bg-slate-900 border border-[#ECECEC] dark:border-slate-800 p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at center, ${stat.color}08 0%, transparent 70%)` }}
                />
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="h-7 w-7" style={{ color: stat.color }} />
                </div>
                <p className="text-4xl font-extrabold text-[#111827] dark:text-foreground" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-[#64748B]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-extrabold text-[#111827] dark:text-foreground mb-6 leading-tight">
                Our Mission is to <br />
                <span className="text-[#ED6A5E]">Transform</span> How You Eat
              </h2>
              <p className="text-[#64748B] leading-relaxed mb-6">
                We started FoodHub in 2022 with a single idea: food delivery should be as delightful as dining
                out. We built a platform where restaurants can showcase their finest offerings and customers
                can discover meals that genuinely excite them.
              </p>
              <p className="text-[#64748B] leading-relaxed">
                Today, we operate across multiple cities and have built a community of passionate chefs,
                restaurant owners, and food enthusiasts who collectively believe in the power of a great meal.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-1 w-12 rounded-full bg-[#ED6A5E]" />
                <span className="text-sm font-semibold text-[#377771]">Founded 2022 · Based in New York</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#ED6A5E]/10 to-[#4CE0B3]/10 blur-2xl" />
              <div className="relative rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-10 text-white overflow-hidden">
                <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#ED6A5E] blur-[80px] opacity-20" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#377771] blur-[80px] opacity-20" />
                <div className="relative">
                  <Truck className="h-12 w-12 text-[#ED6A5E] mb-6" />
                  <p className="text-2xl font-bold leading-relaxed mb-4">
                    "We don't just deliver food — we deliver moments."
                  </p>
                  <p className="text-slate-400 text-sm">— Sarah Chen, Co-Founder</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F8F8]/50 dark:bg-slate-900/20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-[#111827] dark:text-foreground">Our Core Values</h2>
            <p className="mt-4 text-[#64748B] max-w-xl mx-auto">
              These principles guide every decision we make, from the restaurants we partner with to the
              features we build.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group rounded-2xl bg-gradient-to-br ${v.bg} dark:bg-slate-900 border border-white dark:border-slate-800 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${v.color}20` }}
                >
                  <v.icon className="h-6 w-6" style={{ color: v.color }} />
                </div>
                <h3 className="font-bold text-[#111827] dark:text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-[#111827] dark:text-foreground">Meet the Team</h2>
            <p className="mt-4 text-[#64748B] max-w-xl mx-auto">
              The passionate people behind FoodHub who work every day to make your dining experience better.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center"
              >
                <div
                  className="mx-auto mb-4 relative flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden shadow-lg transition-transform group-hover:scale-105"
                  style={{ boxShadow: `0 12px 40px ${member.color}30` }}
                >
                  <Image src={member.avatar} alt={member.name} fill className="object-cover" sizes="96px" />
                </div>
                <h3 className="font-bold text-[#111827] dark:text-foreground">{member.name}</h3>
                <p className="text-sm text-[#64748B] mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
