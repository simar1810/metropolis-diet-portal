"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import ClientListItemStatus from "@/components/pages/coach/client/ClientListItemStatus";
import Paginate from "@/components/Paginate";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAppClients } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";

const initialQuery = {
  page: 1,
  limit: 50,
  finalPage: Infinity
}

export default function Page() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, active, inactive
  const [query, setQuery] = useState(() => initialQuery);
  const { client_categories = [] } = useAppSelector(state => state.coach.data);

  const categories = useMemo(() => {
    const map = new Map();
    for (const category of client_categories) {
      map.set(category._id, category.name)
    }
    return map;
  })

  const { isLoading, error, data } = useSWR(
    `getAppClients-all`,
    () => getAppClients({ limit: 10000 }) // Fetch all clients
  );

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />

  // Get all clients from API response and implement frontend pagination
  const allClients = Array.isArray(data?.data) ? data.data : [];

  // Apply status filter
  let filteredClients = allClients;
  if (statusFilter === "pending") {
    filteredClients = allClients.filter(client => !client.isVerified);
  } else if (statusFilter === "active") {
    filteredClients = allClients.filter(client => client.isVerified && client.isActive);
  } else if (statusFilter === "inactive") {
    filteredClients = allClients.filter(client => client.isVerified && !client.isActive);
  }

  // Apply category filter
  let clients = [];
  if (selectedCategories.length > 0) {
    for (const client of filteredClients) {
      if (client.categories.find(category => selectedCategories.includes(category))) {
        clients.push(client);
      }
    }
  } else {
    clients = filteredClients;
  }

  // Apply pagination after filtering
  const totalClients = clients.length;
  const totalPages = Math.ceil(totalClients / query.limit);
  const startIndex = (query.page - 1) * query.limit;
  const endIndex = startIndex + query.limit;
  const currentClients = clients.slice(startIndex, endIndex);

  return <div className="mt-8 content-container">
    <div className="flex flex-col gap-4 md:gap-0 md:flex-row items-start justify-between mb-6">
      {/* <StatusFilter
        statusFilter={statusFilter}
        setStatusFilter={(filter) => {
          setStatusFilter(filter);
          setQuery(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filter changes
        }}
      /> */}
      <Header
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={client_categories}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y-1">
      {currentClients.map((client, index) => <ClientListItemStatus
        key={index}
        categories={categories}
        client={client}
      />)}
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
      <div className="mt-8">
        <Paginate
          totalPages={totalPages}
          totalResults={totalClients}
          limit={query.limit}
          page={query.page}
          onChange={(newQuery) => setQuery(prev => ({ ...prev, ...newQuery }))}
        />
      </div>
    )}
  </div>
}

function Header({
  selectedCategories,
  setSelectedCategories,
  categories
}) {
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSelectAll = () => {
    const allIds = categories.map((category) => category._id)
    setSelectedCategories(allIds)
  }

  const handleReset = () => {
    setSelectedCategories([])
  }

  const getSelectedNames = () => {
    if (selectedCategories.length === 0) return "Select categories"
    if (selectedCategories.length === categories.length) return "All categories"
    if (selectedCategories.length === 1) {
      const category = categories.find((cat) => cat._id === selectedCategories[0])
      return category?.name || "1 category"
    }
    return `${selectedCategories.length} categories`
  }

  return (
    <div className="w-full max-w-xs">
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            {getSelectedNames()}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Filter Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="flex gap-1 p-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex-1" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex-1" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <DropdownMenuSeparator />

          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category._id}
              checked={selectedCategories.includes(category._id)}
              onCheckedChange={() => handleCategoryToggle(category._id)}
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}

      {selectedCategories.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Selected:{" "}
          {selectedCategories
            .map((id) => {
              const category = categories.find((cat) => cat._id === id)
              return category?.name
            })
            .join(", ")}
        </div>
      )}
    </div>
  )
}

function StatusFilter({ statusFilter, setStatusFilter }) {
  return (
    <div className="flex gap-1 border border-gray-200 rounded-md p-1">
      <Button
        variant={statusFilter === "all" ? "default" : "ghost"}
        size="sm"
        onClick={() => setStatusFilter("all")}
      >
        All
      </Button>
      <Button
        variant={statusFilter === "pending" ? "default" : "ghost"}
        size="sm"
        onClick={() => setStatusFilter("pending")}
      >
        Pending
      </Button>
      <Button
        variant={statusFilter === "active" ? "default" : "ghost"}
        size="sm"
        onClick={() => setStatusFilter("active")}
      >
        Active
      </Button>
      <Button
        variant={statusFilter === "inactive" ? "default" : "ghost"}
        size="sm"
        onClick={() => setStatusFilter("inactive")}
      >
        Inactive
      </Button>
    </div>
  )
}