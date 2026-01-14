"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Minus,
  ArrowRightLeft,
  Search,
  Filter,
  Download,
} from "lucide-react";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";

export default function TransactionHistory() {
  const router = useRouter();
  const { transactions, loading, error } = useWallet();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  if (loading) return <ContentLoader />;
  if (error) return <ContentError title={error} />;

  // Ensure transactions is always an array
  const transactionsArray = Array.isArray(transactions) ? transactions : [];

  // Filter transactions
  const filteredTransactions =
    transactionsArray.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;
      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const transactionDate = new Date(transaction.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - transactionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            matchesDate = diffDays === 0;
            break;
          case "week":
            matchesDate = diffDays <= 7;
            break;
          case "month":
            matchesDate = diffDays <= 30;
            break;
          case "year":
            matchesDate = diffDays <= 365;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "debit":
        return <Minus className="h-4 w-4 text-red-600" />;
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const exportTransactions = () => {
    const csvContent = [
      ["Date", "Type", "Description", "Amount", "Status", "Transaction ID"],
      ...filteredTransactions.map((t) => [
        new Date(t.createdAt).toLocaleDateString(),
        t.type,
        t.description,
        t.amount,
        t.status,
        t._id,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="text-gray-600">
            View and manage all your wallet transactions
          </p>
        </div>
        <Button onClick={() => router.push("/coach/wallet")} variant="outline">
          Back to Wallet
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={exportTransactions}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="h-12 w-12 mx-auto mb-4 text-gray-300">
                <Filter className="h-full w-full" />
              </div>
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTransactions.map((transaction) => (
                      <TableRow
                        key={transaction._id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">
                              {transaction.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          {transaction.clientName && (
                            <p className="text-sm text-gray-500">
                              Client: {transaction.clientName}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p
                            className={`font-semibold ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : transaction.type === "debit"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {transaction.type === "credit"
                              ? "+"
                              : transaction.type === "debit"
                              ? "-"
                              : ""}
                            ₹{transaction.amount.toLocaleString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-500 font-mono">
                            {transaction._id.slice(-8)}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredTransactions.length)} of{" "}
                    {filteredTransactions.length} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
