"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Globe,
  Shield,
  CreditCard,
  Smartphone,
  Mail,
} from "lucide-react";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { useRouter } from "next/navigation";

export default function WalletSettings() {
  const router = useRouter();

  const [settings, setSettings] = useState({
    language: "english",
    notifications: {
      paymentReceived: true,
      paymentReminders: true,
      lowBalance: true,
      weeklyReport: false,
      monthlyReport: true,
    },
    security: {
      twoFactorAuth: false,
      withdrawalConfirmation: true,
      transactionAlerts: true,
    },
    limits: {
      dailyWithdrawal: 50000,
      monthlyWithdrawal: 500000,
      maxTransaction: 100000,
    },
    preferences: {
      autoSave: true,
      defaultCurrency: "INR",
      timezone: "Asia/Kolkata",
    },
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) { } finally {
      setLoading(false);
    }
  };

  const languages = [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "gujarati", label: "Gujarati" },
    { value: "marathi", label: "Marathi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
  ];

  const currencies = [
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
  ];

  const timezones = [
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
    { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Settings</h1>
          <p className="text-gray-600">
            Configure your wallet preferences and security
          </p>
        </div>
        <Button onClick={() => router.push("/coach/wallet")} variant="outline">
          Back to Wallet
        </Button>
      </div>

      {/* Language & Regional Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Language & Regional</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={settings.preferences.defaultCurrency}
                onValueChange={(value) =>
                  handleSettingChange("preferences", "defaultCurrency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={settings.preferences.timezone}
              onValueChange={(value) =>
                handleSettingChange("preferences", "timezone", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <div>
                  <Label className="text-sm font-medium">
                    Payment Received
                  </Label>
                  <p className="text-xs text-gray-500">
                    Get notified when payments are received
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.paymentReceived}
                onCheckedChange={(checked) =>
                  handleSettingChange(
                    "notifications",
                    "paymentReceived",
                    checked
                  )
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-orange-600" />
                <div>
                  <Label className="text-sm font-medium">
                    Payment Reminders
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive reminders for pending payments
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.paymentReminders}
                onCheckedChange={(checked) =>
                  handleSettingChange(
                    "notifications",
                    "paymentReminders",
                    checked
                  )
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-red-600" />
                <div>
                  <Label className="text-sm font-medium">
                    Low Balance Alerts
                  </Label>
                  <p className="text-xs text-gray-500">
                    Get notified when balance is low
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.lowBalance}
                onCheckedChange={(checked) =>
                  handleSettingChange("notifications", "lowBalance", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-purple-600" />
                <div>
                  <Label className="text-sm font-medium">Weekly Reports</Label>
                  <p className="text-xs text-gray-500">
                    Receive weekly wallet summary
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  handleSettingChange("notifications", "weeklyReport", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-indigo-600" />
                <div>
                  <Label className="text-sm font-medium">Monthly Reports</Label>
                  <p className="text-xs text-gray-500">
                    Receive detailed monthly analytics
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.monthlyReport}
                onCheckedChange={(checked) =>
                  handleSettingChange("notifications", "monthlyReport", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Transaction Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dailyWithdrawal">
                Daily Withdrawal Limit (₹)
              </Label>
              <Input
                id="dailyWithdrawal"
                type="number"
                value={settings.limits.dailyWithdrawal}
                onChange={(e) =>
                  handleSettingChange(
                    "limits",
                    "dailyWithdrawal",
                    parseInt(e.target.value)
                  )
                }
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="monthlyWithdrawal">
                Monthly Withdrawal Limit (₹)
              </Label>
              <Input
                id="monthlyWithdrawal"
                type="number"
                value={settings.limits.monthlyWithdrawal}
                onChange={(e) =>
                  handleSettingChange(
                    "limits",
                    "monthlyWithdrawal",
                    parseInt(e.target.value)
                  )
                }
                placeholder="500000"
              />
            </div>
            <div>
              <Label htmlFor="maxTransaction">Max Transaction Amount (₹)</Label>
              <Input
                id="maxTransaction"
                type="number"
                value={settings.limits.maxTransaction}
                onChange={(e) =>
                  handleSettingChange(
                    "limits",
                    "maxTransaction",
                    parseInt(e.target.value)
                  )
                }
                placeholder="100000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-green-600" />
              <div>
                <Label className="text-sm font-medium">
                  Auto-Save Transactions
                </Label>
                <p className="text-xs text-gray-500">
                  Automatically save transaction history
                </p>
              </div>
            </div>
            <Switch
              checked={settings.preferences.autoSave}
              onCheckedChange={(checked) =>
                handleSettingChange("preferences", "autoSave", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : saved ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              Saved!
            </div>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
