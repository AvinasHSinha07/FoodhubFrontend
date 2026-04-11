"use client";

import { Button } from "@/components/ui/button";

type PaginationMeta = {
  page?: number;
  totalPages?: number;
};

type PaginationControlsProps = {
  meta?: PaginationMeta;
  onPageChange: (nextPage: number) => void;
  isLoading?: boolean;
};

export default function PaginationControls({ meta, onPageChange, isLoading }: PaginationControlsProps) {
  const page = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <Button
        variant="outline"
        disabled={page <= 1 || isLoading}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
      </p>
      <Button
        variant="outline"
        disabled={page >= totalPages || isLoading}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
