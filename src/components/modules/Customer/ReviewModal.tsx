"use client";

import { useState } from "react";
import { ReviewServices } from "@/services/review.services";
import { IOrderItem } from "@/types/order.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItem: IOrderItem | null;
}

export function ReviewModal({ isOpen, onClose, orderId, orderItem }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!orderItem) return;
    setIsSubmitting(true);
    try {
      await ReviewServices.createReview({
        orderId,
        mealId: orderItem.mealId,
        rating,
        comment
      });
      toast.success("Review submitted successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}