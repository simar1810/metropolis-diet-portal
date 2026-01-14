"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { fetchData } from "@/lib/api";
import {
  getPayments,
  sendPaymentReminder,
  regeneratePaymentLink,
} from "@/lib/paymentService";
import { getAppClients } from "@/lib/fetchers/app";
import {
  Search,
  Filter,
  Send,
  RefreshCw,
  Eye,
  Copy,
  MoreHorizontal,
} from "lucide-react";

export default function PaymentManager() {
  const [loading, setLoading] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch payment links and clients on component mount
  useEffect(() => {
    fetchPaymentLinks();
    fetchClients();
  }, [currentPage, filters]);

  const fetchPaymentLinks = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        status: filters.status,
        search: filters.search,
        dateRange: filters.dateRange,
      });

      const response = await getPayments({
        page: currentPage,
        status: filters.status,
        search: filters.search,
        dateRange: filters.dateRange,
      });

      if (response.success === true) {
        setPaymentLinks(response.data?.payments || response.payments || []);
        setTotalPages(
          response.data?.pagination?.pages || response.pagination?.pages || 1
        );
      } else {
        throw new Error(response.message || "Failed to fetch payment links");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch payment links");
    }
  };

  const fetchClients = async () => {
    try {
      const response = await getAppClients({ limit: 100 });
      if (response.status_code === 200) {
        setClients(response.data || []);
      }
    } catch (error) { }
  };

  const sendReminder = async (paymentLinkId) => {
    try {
      // Use the correct reminder endpoint from the backend
      const response = await fetchData(`app/payment/${paymentLinkId}/remind`, {
        tone: "friendly",
      });

      if (response.success === true) {
        toast.success("Reminder sent successfully");
        fetchPaymentLinks(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to send reminder");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send reminder");
    }
  };

  const regenerateLink = async (paymentLinkId) => {
    try {
      const response = await regeneratePaymentLink(paymentLinkId);

      if (response.status_code === 200) {
        toast.success("Payment link regenerated successfully");
        fetchPaymentLinks(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to regenerate link");
      }
    } catch (error) {
      toast.error(error.message || "Failed to regenerate link");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Paid
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getClientName = (clientId) => {
    if (typeof clientId === "object" && clientId?.name) {
      return clientId.name;
    }
    if (typeof clientId === "string") {
      const client = clients.find((c) => c._id === clientId);
      return client ? client.name : "Unknown Client";
    }
    return "Unknown Client";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Payment Links</h1>
          <p className="text-muted-foreground">
            Track and manage all your payment links
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client or amount..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, dateRange: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchPaymentLinks}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Links</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No payment links found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentLinks.map((link) => {
                    return (
                      <TableRow key={link._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {link.client?.name ||
                                link.clientName ||
                                getClientName(link.clientId || link.client)}
                            </div>

                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatAmount(link.amount)}
                          </div>
                          {link.discount?.voucherId && (
                            <div className="text-sm text-muted-foreground">
                              Voucher Applied: ₹{link.discount.amount}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(link.status)}</TableCell>
                        <TableCell>{formatDate(link.createdAt)}</TableCell>
                        <TableCell>
                          {link.invoice?.dueDate
                            ? formatDate(link.invoice.dueDate)
                            : "No due date"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(link.paymentLink)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {link.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendReminder(link._id)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => regenerateLink(link._id)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
