"use client";

import Image from "next/image";
import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ReviewItem = {
  id?: string;
  rating: number;
  comment?: string | null;
  createdAt?: string | null;
  mealTitle?: string;
  customer?: {
    name?: string;
    image?: string;
  };
};

type ReviewSliderProps = {
  reviews: ReviewItem[];
  averageRating: string | null;
  reviewCount?: number;
  title?: string;
  subtitle?: string;
  showMealTag?: boolean;
};

const CARDS_PER_PAGE = 3;

export default function ReviewSlider({
  reviews,
  averageRating,
  reviewCount,
  title = "Customer Reviews",
  subtitle = "Real experiences from our community",
  showMealTag = false,
}: ReviewSliderProps) {
  const count = reviewCount ?? reviews.length;
  const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = () => {
    setDirection(-1);
    setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  };
  const next = () => {
    setDirection(1);
    setPage((p) => (p === totalPages - 1 ? 0 : p + 1));
  };

  const visible = reviews.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  return (
    <section className="pt-16 border-t border-border/30 space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Average score pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-lg font-black text-amber-700 dark:text-amber-400 leading-none">
              {averageRating ?? "—"}
            </span>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            {count} {count === 1 ? "review" : "reviews"}
          </div>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="relative overflow-hidden min-h-[240px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {visible.map((review, idx) => (
              <ReviewCard key={review.id ?? idx} review={review} showMealTag={showMealTag} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > page ? 1 : -1); setPage(i); }}
                className={`rounded-full transition-all duration-300 ${
                  i === page
                    ? "w-6 h-2 bg-[#377771]"
                    : "w-2 h-2 bg-border hover:bg-muted-foreground"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="h-10 w-10 rounded-full border border-border/60 bg-background hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={next}
              className="h-10 w-10 rounded-full bg-[#0A0F1E] dark:bg-foreground text-white dark:text-background hover:opacity-80 flex items-center justify-center transition-opacity"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review, showMealTag }: { review: ReviewItem; showMealTag: boolean }) {
  const initials = review.customer?.name?.charAt(0)?.toUpperCase() ?? "G";
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recent";

  return (
    <div className="flex flex-col gap-5 p-6 rounded-2xl border border-border/50 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Top row: avatar + name + stars */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden border border-border/50 bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
            {review.customer?.image ? (
              <Image src={review.customer.image} alt={review.customer.name || "Customer"} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{review.customer?.name ?? "Guest"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Verified</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-border"}`}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
        "{review.comment ?? "Great experience, highly recommended!"}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <span className="text-[11px] text-muted-foreground/60 font-medium">{date}</span>
        {showMealTag && review.mealTitle && (
          <span className="text-[10px] font-bold text-[#377771] dark:text-[#4CE0B3] bg-[#377771]/8 dark:bg-[#4CE0B3]/10 px-2.5 py-1 rounded-lg max-w-[130px] truncate">
            {review.mealTitle}
          </span>
        )}
      </div>
    </div>
  );
}
