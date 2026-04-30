"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReviewAction } from "@/app/_actions/review.actions";
import { IOrderItem } from "@/types/order.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { queryKeys } from "@/lib/query/query-keys";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItem: IOrderItem | null;
}

export function ReviewModal({ isOpen, onClose, orderItem }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createReviewAction,
  });

  const handleSubmit = async () => {
    if (!orderItem) return;

    const result = await mutateAsync({
      orderItemId: orderItem.id,
      mealId: orderItem.mealId,
      rating,
      comment,
    });

    if (!result.success) {
      toast.error(result.message || "Failed to submit review.");
      return;
    }

    toast.success(result.message || "Review submitted successfully!");
    await queryClient.invalidateQueries({
      queryKey: queryKeys.mealReviews(orderItem.mealId),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-[32px] border-border/50 bg-background p-8 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-foreground">Leave a Review</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            How was the <span className="text-[#ED6A5E]">{orderItem?.meal?.title}</span>? Let others know!
          </DialogDescription>
        </DialogHeader>
 
        <div className="my-6 space-y-6">
          <div className="flex justify-center gap-3 bg-muted/30 p-4 rounded-[20px] border border-border/50">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none group transform hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= rating ? "fill-[#FFAF87] text-[#FFAF87]" : "text-slate-300 group-hover:text-[#FFAF87]/40"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Comment (Optional)</label>
            <Textarea
              placeholder="What did you like or dislike? (e.g. flavor, freshness, portions)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none rounded-[16px] bg-muted/50 border-border/50 focus-visible:ring-[#ED6A5E] font-medium min-h-[100px]"
              rows={3}
            />
          </div>
        </div>
 
        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isPending} className="h-12 rounded-[14px] font-bold text-slate-500 hover:text-foreground">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="h-12 px-8 rounded-[14px] bg-[#ED6A5E] hover:bg-[#FF8E72] text-white font-bold shadow-md hover:-translate-y-0.5 transition-all">
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}