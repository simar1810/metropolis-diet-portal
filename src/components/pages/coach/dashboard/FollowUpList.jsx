import { parse } from "date-fns";
import { useState, useMemo, useEffect } from "react";
import ClientListFollowUp from "./ClientListFollowUp";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function FollowUpList({
  title = "Pending Follow Up",
  clients
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 items per page

  // Reset to page 1 when clients list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [clients?.length]);
  
  const sortedClients = useMemo(() => {
    if (!clients || !Array.isArray(clients)) return [];
    return [...clients].sort((a, b) => {
      try {
        const dateA = parse(a.nextFollowup, "dd-MM-yyyy", new Date())
        const dateB = parse(b.nextFollowup, "dd-MM-yyyy", new Date())
        return dateA - dateB
      } catch {
        return 0
      }
    });
  }, [clients]);

  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = sortedClients.slice(startIndex, endIndex);

  const showPagination = sortedClients.length > itemsPerPage;
  const isMissingFollowUp = title.includes("Missing");

  return <div className="bg-white mt-4 py-4 rounded-[10px] border-1">
    <div className="text-[14px] font-bold mb-4 px-4">{title}</div>
    <div className="divide-y-1 divide-[#ECECEC] max-h-[400px] overflow-y-auto">
      {paginatedClients.length > 0 ? (
        paginatedClients.map(client => <ClientListFollowUp
          key={client.clientId}
          src={client.profilePhoto}
          name={client.name}
          id={client.clientId}
          client={client}
        />)
      ) : (
        <div className="px-4 py-6 text-center text-sm text-[var(--dark-2)]">
          No {title.toLowerCase()} clients
        </div>
      )}
    </div>
    {showPagination && (
      <div className="mt-4 px-4">
        <Pagination>
          <PaginationContent className="gap-2">
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink isActive className="cursor-default">
                {currentPage} / {totalPages}
              </PaginationLink>
            </PaginationItem>
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    )}
  </div>
}