"use client"

import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Paginate({
  page: initialPage = 1,
  limit: initialLimit = 10,
  totalPages = 1,
  totalResults = 0,
  onChange,
}) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      onChange?.({ page: newPage, limit })
    }
  }

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setPage(1)
    onChange?.({ page: 1, limit: newLimit })
  }

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col md:flex-row items-end justify-between gap-2 p-4 border rounded-xl">
      <Pagination>
        <PaginationContent className="mr-auto">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              aria-disabled={page === totalPages}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="w-full flex flex-col items-end justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {(page - 1) * limit + 1}-
          {Math.min(page * limit, totalResults)} of {totalResults}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => handleLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
