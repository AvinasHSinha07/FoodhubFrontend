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
  orderId: string;
  orderItem: IOrderItem | null;
}

export function ReviewModal({ isOpen, onClose, orderId, orderItem }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createReviewAction,
  });

  const handleSubmit = async () => {
    if (!orderItem) return;

    const result = await mutateAsync({
      orderId,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            How was the {orderItem?.meal?.title}? Let others know!
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none group"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= rating ? "fill-orange-400 text-orange-400" : "text-gray-300 group-hover:text-orange-200"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Comment (Optional)</label>
            <Textarea
              placeholder="What did you like or dislike?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}