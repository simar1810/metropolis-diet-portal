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
import { fetchData, sendData } from "@/lib/api";
import {
  Award,
  Gift,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

export default function RewardsDashboard() {
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [rewardStats, setRewardStats] = useState({
    totalPoints: 0,
    totalRedemptions: 0,
    activeClients: 0,
    totalRewards: 0,
  });
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [configData, setConfigData] = useState({
    pointsPerRupee: 1,
    minimumRedemption: 100,
    expiryDays: 365,
    autoExpiry: true,
  });
  const [rewardFormData, setRewardFormData] = useState({
    name: "",
    description: "",
    pointsRequired: "",
    category: "general",
    isActive: true,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchRewardsData();
    fetchClients();
  }, []);

  const fetchRewardsData = async () => {
    try {
      // Fetch rewards
      const rewardsResponse = await fetchData("app/rewards/catalog");
      if (rewardsResponse.status_code === 200) {
        setRewards(rewardsResponse.data || []);
      }

      // Fetch redemptions
      const redemptionsResponse = await fetchData("app/rewards/redemptions");
      if (redemptionsResponse.status_code === 200) {
        setRedemptions(redemptionsResponse.data || []);
      }

      // Fetch stats
      const statsResponse = await fetchData("app/rewards/stats");
      if (statsResponse.status_code === 200) {
        setRewardStats(
          statsResponse.data || {
            totalPoints: 0,
            totalRedemptions: 0,
            activeClients: 0,
            totalRewards: 0,
          }
        );
      }
    } catch (error) {
      toast.error("Failed to load rewards data");
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetchData("app/allClient?limit=100");
      if (response.status_code === 200) {
        setClients(response.data || []);
      }
    } catch (error) { }
  };

  const createReward = async () => {
    if (!rewardFormData.name || !rewardFormData.pointsRequired) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: rewardFormData.name,
        description: rewardFormData.description,
        pointsRequired: parseInt(rewardFormData.pointsRequired),
        category: rewardFormData.category,
        isActive: rewardFormData.isActive,
      };
      const response = await sendData("app/rewards/catalog", payload);  
      if (response.status_code === 200) {
        toast.success("Reward created successfully");
        setIsRewardDialogOpen(false);
        resetRewardForm();
        fetchRewardsData();
      } else {
        throw new Error(response.message || "Failed to create reward");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create reward");
    } finally {
      setLoading(false);
    }
  };

  const updateReward = async () => {
    if (
      !editingReward ||
      !rewardFormData.name ||
      !rewardFormData.pointsRequired
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: rewardFormData.name,
        description: rewardFormData.description,
        pointsRequired: parseInt(rewardFormData.pointsRequired),
        category: rewardFormData.category,
        isActive: rewardFormData.isActive,
      };

      const response = await sendData(
        `app/rewards/catalog/${editingReward._id}`,
        payload,
        "PUT"
      );

      if (response.status_code === 200) {
        toast.success("Reward updated successfully");
        setIsRewardDialogOpen(false);
        resetRewardForm();
        fetchRewardsData();
      } else {
        throw new Error(response.message || "Failed to update reward");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update reward");
    } finally {
      setLoading(false);
    }
  };

  const deleteReward = async (rewardId) => {
    if (!confirm("Are you sure you want to delete this reward?")) {
      return;
    }

    try {
      const response = await sendData(
        `app/rewards/catalog/${rewardId}`,
        {},
        "DELETE"
      );

      if (response.status_code === 200) {
        toast.success("Reward deleted successfully");
        fetchRewardsData();
      } else {
        throw new Error(response.message || "Failed to delete reward");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete reward");
    }
  };

  const updateConfig = async () => {
    setLoading(true);
    try {
      const response = await sendData("app/rewards/config", configData, "PUT");

      if (response.status_code === 200) {
        toast.success("Rewards configuration updated successfully");
        setIsConfigDialogOpen(false);
      } else {
        throw new Error(response.message || "Failed to update configuration");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update configuration");
    } finally {
      setLoading(false);
    }
  };

  const resetRewardForm = () => {
    setRewardFormData({
      name: "",
      description: "",
      pointsRequired: "",
      category: "general",
      isActive: true,
    });
    setEditingReward(null);
  };

  const openEditRewardDialog = (reward) => {
    setEditingReward(reward);
    setRewardFormData({
      name: reward.name,
      description: reward.description || "",
      pointsRequired: reward.pointsRequired.toString(),
      category: reward.category,
      isActive: reward.isActive,
    });
    setIsRewardDialogOpen(true);
  };

  const openCreateRewardDialog = () => {
    resetRewardForm();
    setIsRewardDialogOpen(true);
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c._id === clientId);
    return client ? client.name : "Unknown Client";
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
          <h1 className="text-2xl font-bold">Rewards Dashboard</h1>
          <p className="text-muted-foreground">
            Manage client rewards and loyalty program
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isRewardDialogOpen}
            onOpenChange={setIsRewardDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                onClick={openCreateRewardDialog}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingReward ? "Edit Reward" : "Add New Reward"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Reward Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Free Consultation"
                    value={rewardFormData.name}
                    onChange={(e) =>
                      setRewardFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Reward description"
                    value={rewardFormData.description}
                    onChange={(e) =>
                      setRewardFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pointsRequired">Points Required *</Label>
                    <Input
                      id="pointsRequired"
                      type="number"
                      placeholder="100"
                      value={rewardFormData.pointsRequired}
                      onChange={(e) =>
                        setRewardFormData((prev) => ({
                          ...prev,
                          pointsRequired: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={rewardFormData.category}
                      onValueChange={(value) =>
                        setRewardFormData((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="consultation">
                          Consultation
                        </SelectItem>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingReward ? updateReward : createReward}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading
                      ? "Saving..."
                      : editingReward
                        ? "Update Reward"
                        : "Add Reward"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsRewardDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isConfigDialogOpen}
            onOpenChange={setIsConfigDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Rewards Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pointsPerRupee">Points per Rupee</Label>
                  <Input
                    id="pointsPerRupee"
                    type="number"
                    placeholder="1"
                    value={configData.pointsPerRupee}
                    onChange={(e) =>
                      setConfigData((prev) => ({
                        ...prev,
                        pointsPerRupee: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="minimumRedemption">
                    Minimum Redemption (Points)
                  </Label>
                  <Input
                    id="minimumRedemption"
                    type="number"
                    placeholder="100"
                    value={configData.minimumRedemption}
                    onChange={(e) =>
                      setConfigData((prev) => ({
                        ...prev,
                        minimumRedemption: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDays">Points Expiry (Days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    placeholder="365"
                    value={configData.expiryDays}
                    onChange={(e) =>
                      setConfigData((prev) => ({
                        ...prev,
                        expiryDays: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={updateConfig}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Saving..." : "Update Configuration"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfigDialogOpen(false)}
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
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-xl font-bold">
                  {rewardStats.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Redemptions
                </p>
                <p className="text-xl font-bold">
                  {rewardStats.totalRedemptions}
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
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-xl font-bold">{rewardStats.activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Available Rewards
                </p>
                <p className="text-xl font-bold">{rewardStats.totalRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rewards Catalog */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No rewards available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{reward.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {reward.pointsRequired} points
                          </Badge>
                          <Badge variant="secondary">{reward.category}</Badge>
                          {reward.isActive ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditRewardDialog(reward)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReward(reward._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Redemptions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            {redemptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No redemptions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.slice(0, 5).map((redemption) => (
                  <div key={redemption._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{redemption.rewardName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getClientName(redemption.clientId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(redemption.redeemedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {redemption.pointsUsed} points
                        </div>
                        <Badge variant="outline">Redeemed</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
