"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getVouchers,
  getVoucherAnalytics,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "@/lib/paymentService";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Users,
  Percent,
  RefreshCw,
} from "lucide-react";

export default function VoucherManager() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [vouchers, setVouchers] = useState([]); // Ensure it's always an array

  const [voucherStats, setVoucherStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    totalUsage: 0,
    totalDiscount: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    discountType: "percentage",
    maxUses: "",
    validFrom: "",
    validUntil: "",
    description: "",
    minimumAmount: "",
  });

  // Fetch vouchers and stats on component mount
  useEffect(() => {
    fetchVouchers();
    fetchVoucherStats();

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchVouchers();
      fetchVoucherStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchVouchers = async () => {
    try {
      setFetchingData(true);
      const response = await getVouchers();

      if (response.success === true) {
        // Extract vouchers from the correct path in response
        const vouchersData = response.data?.vouchers || [];
        setVouchers(Array.isArray(vouchersData) ? vouchersData : []);

        // Also extract stats from vouchers response as fallback
        if (response.data?.stats) {
          const stats = response.data.stats;
          const fallbackStats = {
            totalVouchers:
              (stats.active?.count || 0) + (stats.inactive?.count || 0),
            activeVouchers: stats.active?.count || 0,
            totalUsage:
              (stats.active?.totalUsage || 0) +
              (stats.inactive?.totalUsage || 0),
            totalDiscount: 0,
          };
          setVoucherStats(fallbackStats);
        }
      } else {
        throw new Error(response.message || "Failed to fetch vouchers");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch vouchers");
      setVouchers([]);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchVoucherStats = async () => {
    try {
      const response = await getVoucherAnalytics();

      if (response.success === true) {
        // Handle both possible response structures from backend
        let overallStats = {};

        // Check if it's the analytics response structure
        if (response.data?.overallStats) {
          overallStats = response.data.overallStats;
        }
        // Check if it's the vouchers response structure (fallback)
        else if (response.data?.stats) {
          const stats = response.data.stats;
          overallStats = {
            totalVouchers:
              (stats.active?.count || 0) + (stats.inactive?.count || 0),
            activeVouchers: stats.active?.count || 0,
            totalUsage:
              (stats.active?.totalUsage || 0) +
              (stats.inactive?.totalUsage || 0),
            totalDiscountGiven: 0, // This might need to be calculated differently
          };
        } else { }


        const transformedStats = {
          totalVouchers: overallStats.totalVouchers || 0,
          activeVouchers: overallStats.activeVouchers || 0,
          totalUsage: overallStats.totalUsage || 0,
          totalDiscount: overallStats.totalDiscountGiven || 0,
        };

        setVoucherStats(transformedStats);
      } else {
      }
    } catch (error) {
      setVoucherStats({
        totalVouchers: 0,
        activeVouchers: 0,
        totalUsage: 0,
        totalDiscount: 0,
      });
    }
  };

  const handleCreateVoucher = async () => {
    if (!formData.code || !formData.discount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.discount <= 0) {
      toast.error("Discount amount must be greater than 0");
      return;
    }

    if (formData.discountType === "percentage" && formData.discount > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discount: parseFloat(formData.discount),
        discountType: formData.discountType,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        description: formData.description,
        minimumAmount: formData.minimumAmount
          ? parseFloat(formData.minimumAmount)
          : null,
      };

      const response = await createVoucher(payload);

      if (response.success === true) {
        toast.success("Voucher created successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchVouchers();
        fetchVoucherStats();
      } else {
        throw new Error(response.message || "Failed to create voucher");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVoucher = async () => {
    if (!editingVoucher || !formData.code || !formData.discount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.discount <= 0) {
      toast.error("Discount amount must be greater than 0");
      return;
    }

    if (formData.discountType === "percentage" && formData.discount > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discount: parseFloat(formData.discount),
        discountType: formData.discountType,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        description: formData.description,
        minimumAmount: formData.minimumAmount
          ? parseFloat(formData.minimumAmount)
          : null,
      };

      const response = await updateVoucher(editingVoucher._id, payload);

      if (response.success === true) {
        toast.success("Voucher updated successfully");
        setIsDialogOpen(false);
        resetForm();
        setEditingVoucher(null);
        fetchVouchers();
        fetchVoucherStats();
      } else {
        throw new Error(response.message || "Failed to update voucher");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!confirm("Are you sure you want to delete this voucher?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteVoucher(voucherId);

      if (response.success === true) {
        toast.success("Voucher deleted successfully");
        fetchVouchers();
        fetchVoucherStats();
      } else {
        throw new Error(response.message || "Failed to delete voucher");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete voucher");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      discountType: "percentage",
      maxUses: "",
      validFrom: "",
      validUntil: "",
      description: "",
      minimumAmount: "",
    });
    setEditingVoucher(null);
  };

  const openEditDialog = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      discount: voucher.discount.toString(),
      discountType: voucher.discountType,
      maxUses: voucher.maxUses ? voucher.maxUses.toString() : "",
      validFrom: voucher.validFrom ? voucher.validFrom.split("T")[0] : "",
      validUntil: voucher.validUntil ? voucher.validUntil.split("T")[0] : "",
      description: voucher.description || "",
      minimumAmount: voucher.minimumAmount
        ? voucher.minimumAmount.toString()
        : "",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusBadge = (voucher) => {
    const now = new Date();
    const validFrom = new Date(voucher.validFrom);
    const validUntil = new Date(voucher.validUntil);
    const isExpired = now > validUntil;
    const isNotStarted = now < validFrom;
    const isUsageExceeded =
      voucher.maxUses && voucher.usageCount >= voucher.maxUses;

    if (isExpired || isUsageExceeded) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isNotStarted) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Active
        </Badge>
      );
    }
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
          <h1 className="text-2xl font-bold">Discount Vouchers</h1>
          <p className="text-muted-foreground">
            Create and manage discount vouchers for your clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              fetchVouchers();
              fetchVoucherStats();
            }}
            variant="outline"
            size="sm"
            disabled={fetchingData}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${fetchingData ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateDialog}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Voucher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingVoucher ? "Edit Voucher" : "Create New Voucher"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Voucher Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., WELCOME10"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Discount *</Label>
                    <Input
                      id="discount"
                      type="number"
                      placeholder="10"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxUses">Maximum Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxUses: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validFrom: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validUntil: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="minimumAmount">Minimum Order Amount</Label>
                  <Input
                    id="minimumAmount"
                    type="number"
                    placeholder="No minimum"
                    value={formData.minimumAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minimumAmount: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={
                      editingVoucher ? handleUpdateVoucher : handleCreateVoucher
                    }
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading
                      ? "Saving..."
                      : editingVoucher
                        ? "Update Voucher"
                        : "Create Voucher"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Percent className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vouchers</p>
                <p className="text-xl font-bold">
                  {voucherStats.totalVouchers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Vouchers</p>
                <p className="text-xl font-bold">
                  {voucherStats.activeVouchers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-xl font-bold">{voucherStats.totalUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Discount</p>
                <p className="text-xl font-bold">
                  {formatAmount(voucherStats.totalDiscount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(vouchers) || vouchers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No vouchers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {voucher.code}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(voucher.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {voucher.discountType === "percentage"
                              ? `${voucher.value}%`
                              : (`${voucher.value}%`)}
                          </div>
                          {voucher.minimumAmount && (
                            <div className="text-sm text-muted-foreground">
                              Min: {formatAmount(voucher.minimumAmount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {voucher.usageCount || 0}
                            {voucher.maxUses && ` / ${voucher.maxUses}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatAmount(voucher.totalDiscount || 0)} saved
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>From: {formatDate(voucher.validFrom)}</div>
                          <div>Until: {formatDate(voucher.validUntil)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(voucher)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(voucher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVoucher(voucher._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
