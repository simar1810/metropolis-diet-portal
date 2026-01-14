"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Brain,
  AlertTriangle,
  TrendingUpIcon,
  Sparkles,
  Zap,
  Rocket,
  Shield,
} from "lucide-react";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/providers/global/hooks";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchData, sendData } from "@/lib/api";

// Animated Metric Card Component
function AnimatedMetricCard({
  icon: Icon,
  title,
  value,
  color,
  trend,
  isLoading,
  delay = 0,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card
      className={`group border-0 bg-white/90 backdrop-blur-sm shadow-lg wallet-card-hover transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-xl group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded shimmer" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
            {trend && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs font-medium ${trend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
                <TrendingUp
                  className={`h-3 w-3 ${trend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Chart Card Component
function EnhancedChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <Card
      className={`border-0 bg-white/90 backdrop-blur-sm shadow-lg wallet-card-hover ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// AI Insights Card with Animation
function AIInsightsCard({ insights, loading }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (insights) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [insights]);

  return (
    <Card className="border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-xl wallet-card-hover">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            AI-Powered Insights
          </CardTitle>
          {loading && (
            <div className="ml-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            </div>
          )}
          <div className="ml-auto">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600 font-medium">
                Analyzing your data...
              </p>
              <p className="text-sm text-gray-500">AI is generating insights</p>
            </div>
          </div>
        ) : insights ? (
          <div
            className={`space-y-6 transition-all duration-1000 ${isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
              }`}
          >
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                Executive Summary
              </h4>
              <p className="text-purple-800 leading-relaxed">
                {insights.summary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Strategic Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {rec}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-1">
                  Growth Rate
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {insights.trends.monthlyGrowth}%
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <p className="text-sm text-green-600 font-medium mb-1">
                  Avg Transaction
                </p>
                <p className="text-2xl font-bold text-green-900">
                  ₹{insights.trends.averageTransaction}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-600 font-medium mb-1">
                  Top Type
                </p>
                <p className="text-xl font-bold text-purple-900 capitalize">
                  {insights.trends.topTransactionType.replace("_", " ")}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${insights.riskAssessment.riskLevel === "low"
                  ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                  : insights.riskAssessment.riskLevel === "medium"
                    ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
                    : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                  }`}
              >
                <p
                  className={`text-sm font-medium mb-1 ${insights.riskAssessment.riskLevel === "low"
                    ? "text-green-600"
                    : insights.riskAssessment.riskLevel === "medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                    }`}
                >
                  Risk Level
                </p>
                <p
                  className={`text-xl font-bold ${insights.riskAssessment.riskLevel === "low"
                    ? "text-green-900"
                    : insights.riskAssessment.riskLevel === "medium"
                      ? "text-yellow-900"
                      : "text-red-900"
                    }`}
                >
                  {insights.riskAssessment.riskLevel.charAt(0).toUpperCase() +
                    insights.riskAssessment.riskLevel.slice(1)}
                </p>
              </div>
            </div>

            {insights.riskAssessment.riskFactors.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-yellow-600" />
                  Risk Assessment
                </h4>
                <ul className="space-y-2">
                  {insights.riskAssessment.riskFactors.map((factor, index) => (
                    <li
                      key={index}
                      className="text-yellow-800 text-sm flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-400">
              No insights available
            </p>
            <p className="text-sm text-gray-400">
              AI insights will be generated based on your data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WalletAnalytics() {
  const router = useRouter();
  const { transactions, balance, loading, error } = useWallet();
  const coachId = useAppSelector((state) => state.coach.data?._id);

  const [period, setPeriod] = useState("30d");
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [fraudData, setFraudData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsError, setWithdrawalsError] = useState("");

  useEffect(() => {
    if (Array.isArray(transactions) && transactions.length > 0 && coachId) {
      generateAIInsights();
      fetchAnalyticsData();
      fetchFraudData();
      fetchPredictions();
    }
  }, [transactions, period, coachId]);

  useEffect(() => {
    async function fetchWithdrawals() {
      setWithdrawalsLoading(true);
      setWithdrawalsError("");
      try {
        const res = await fetchData("app/withdrawals", {});
        setWithdrawals(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setWithdrawalsError("Could not load withdrawal requests.");
      } finally {
        setWithdrawalsLoading(false);
      }
    }
    fetchWithdrawals();
  }, []);

  // Manual refresh function for withdrawals (same as WalletOverview.jsx)
  const refreshWithdrawals = async () => {
    setWithdrawalsLoading(true);
    setWithdrawalsError("");
    try {
      const res = await fetchData("app/withdrawals", {});
      setWithdrawals(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setWithdrawalsError("Could not load withdrawal requests.");
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await sendData(
        `app/analytics/dashboard?period=${period}&coachId=${coachId}`
      );
      setAnalyticsData(response.data);
    } catch (error) { } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchFraudData = async () => {
    try {
      const response = await sendData(
        `app/analytics/fraud-detection?period=${period}&coachId=${coachId}`
      );
      setFraudData(response.data);
    } catch (error) { }
  };

  const fetchPredictions = async () => {
    try {
      const response = await sendData(
        `app/analytics/predictions?period=${period}&horizon=30d&coachId=${coachId}`
      );
      setPredictions(response.data);
    } catch (error) { }
  };

  const generateAIInsights = async () => {
    setInsightsLoading(true);
    try {
      const insights = {
        summary: generateSummary(),
        recommendations: generateRecommendations(),
        trends: generateTrends(),
        riskAssessment: generateRiskAssessment(),
      };
      setAiInsights(insights);
    } catch (error) { } finally {
      setInsightsLoading(false);
    }
  };

  const generateSummary = () => {
    if (analyticsData) {
      const growth = analyticsData.growthRate || 0;
      const totalCredited = analyticsData.totalCredited || 0;
      const totalDebited = analyticsData.totalDebited || 0;
      const transactionCount = analyticsData.transactionCount || 0;

      return `Your wallet shows a ${growth >= 0 ? "positive" : "negative"
        } trend with ${Math.abs(growth).toFixed(1)}% ${growth >= 0 ? "growth" : "decline"
        } this ${period}. You've processed ${transactionCount} transactions totaling ₹${totalCredited.toLocaleString()} in credits and ₹${totalDebited.toLocaleString()} in debits.`;
    }

    const growth = ((netFlow / (totalCredited + totalDebited)) * 100).toFixed(
      1
    );
    return `Your wallet shows a ${netFlow >= 0 ? "positive" : "negative"
      } trend with ${Math.abs(growth)}% ${netFlow >= 0 ? "growth" : "decline"
      } this ${period}. Most transactions are from ${getTopTransactionType()}.`;
  };

  const generateRecommendations = () => {
    if (predictions?.recommendations) {
      return predictions.recommendations.slice(0, 3);
    }

    const recommendations = [];
    if (netFlow < 0) {
      recommendations.push(
        "Consider reducing expenses and focusing on revenue-generating activities"
      );
    }
    if (transactionCount < 10) {
      recommendations.push(
        "Increase transaction frequency by promoting your services more actively"
      );
    }
    if (averageTransaction < 1000) {
      recommendations.push(
        "Consider premium pricing strategies to increase average transaction value"
      );
    }
    recommendations.push(
      "Set up automatic payment reminders for better cash flow management"
    );
    recommendations.push(
      "Monitor your peak earning hours and optimize your schedule accordingly"
    );

    return recommendations.slice(0, 3);
  };

  const generateTrends = () => {
    if (analyticsData) {
      return {
        monthlyGrowth: (analyticsData.growthRate || 0).toFixed(1),
        averageTransaction: Math.round(analyticsData.averageTransaction || 0),
        topTransactionType:
          analyticsData.topTransactionTypes?.[0]?.type ||
          getTopTransactionType(),
        transactionFrequency: Math.round(
          (analyticsData.transactionCount || 0) /
          (period === "7d" ? 7 : period === "30d" ? 30 : 90)
        ),
      };
    }

    return {
      monthlyGrowth: ((netFlow / (totalCredited + totalDebited)) * 100).toFixed(
        1
      ),
      averageTransaction: Math.round(averageTransaction),
      topTransactionType: getTopTransactionType(),
      transactionFrequency: Math.round(
        transactionCount / (period === "7d" ? 7 : period === "30d" ? 30 : 90)
      ),
    };
  };

  const generateRiskAssessment = () => {
    if (fraudData) {
      return {
        riskLevel: fraudData.riskLevel || fraudData.overallRiskLevel || "low",
        riskFactors: fraudData.riskFactors || [],
      };
    }

    const riskFactors = [];
    let riskLevel = "low";

    if (netFlow < 0) {
      riskFactors.push("Negative cash flow");
      riskLevel = "medium";
    }
    if (transactionCount < 5) {
      riskFactors.push("Low transaction volume");
      riskLevel = "medium";
    }

    return { riskLevel, riskFactors };
  };

  const getTopTransactionType = () => {
    const typeCounts = {};
    allFilteredTransactions.forEach((t) => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });
    return Object.keys(typeCounts).reduce(
      (a, b) => (typeCounts[a] > typeCounts[b] ? a : b),
      "credit"
    );
  };

  if (loading || withdrawalsLoading || !coachId) return <ContentLoader />;
  if (error || withdrawalsError)
    return <ContentError title={error || withdrawalsError} />;

  // Define transactionsArray like in WalletOverview.jsx
  const transactionsArray = Array.isArray(transactions) ? transactions : [];

  const getFilteredTransactions = () => {
    if (!Array.isArray(transactions)) return [];

    const now = new Date();
    const daysToSubtract = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
    const cutoffDate = new Date(
      now.getTime() - daysToSubtract[period] * 24 * 60 * 60 * 1000
    );
    return transactions.filter((t) => new Date(t.createdAt) >= cutoffDate);
  };

  // Get paid withdrawal requests and convert them to transaction format
  const getPaidWithdrawalsAsTransactions = () => {
    // Use the same logic as WalletOverview.jsx - no date filtering for withdrawals
    const paidWithdrawals = withdrawals.filter((w) => w.status === "paid");

    return paidWithdrawals.map((w) => ({
      _id: w._id,
      type: "debit",
      amount: w.amount,
      description: `Withdrawal - ${w.status}`,
      status: w.status,
      createdAt: w.createdAt || w.updatedAt,
      category: "withdrawal",
    }));
  };

  const filteredTransactions = getFilteredTransactions();
  const paidWithdrawalTransactions = getPaidWithdrawalsAsTransactions();

  // Combine regular transactions with paid withdrawal transactions
  const allFilteredTransactions = [
    ...filteredTransactions,
    ...paidWithdrawalTransactions,
  ];

  const totalCredited = allFilteredTransactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebited = allFilteredTransactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalCredited - totalDebited;
  const transactionCount = allFilteredTransactions.length;
  const averageTransaction =
    transactionCount > 0
      ? (totalCredited + totalDebited) / transactionCount
      : 0;

  const getTransactionTypeDistribution = () => {
    const distribution = {};
    allFilteredTransactions.forEach((t) => {
      distribution[t.type] = (distribution[t.type] || 0) + 1;
    });
    return distribution;
  };

  const transactionDistribution = getTransactionTypeDistribution();

  const prepareTransactionFlowData = () => {
    const dailyData = {};
    // Include both regular transactions and withdrawal transactions
    allFilteredTransactions.forEach((t) => {
      const date = new Date(t.createdAt).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { date, credit: 0, debit: 0, net: 0 };
      }
      if (t.type === "credit") {
        dailyData[date].credit += t.amount;
      } else {
        dailyData[date].debit += t.amount;
      }
      dailyData[date].net = dailyData[date].credit - dailyData[date].debit;
    });
    return Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const preparePieChartData = () => {
    return Object.entries(transactionDistribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color:
        type === "credit"
          ? "#10B981"
          : type === "debit"
            ? "#EF4444"
            : "#3B82F6",
    }));
  };

  const prepareBarChartData = () => {
    const weeklyData = {};
    allFilteredTransactions.forEach((t) => {
      const date = new Date(t.createdAt);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toLocaleDateString();

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { week: weekKey, amount: 0, count: 0 };
      }
      weeklyData[weekKey].amount += t.amount;
      weeklyData[weekKey].count += 1;
    });
    return Object.values(weeklyData).sort(
      (a, b) => new Date(a.week) - new Date(b.week)
    );
  };

  const transactionFlowData = prepareTransactionFlowData();
  const pieChartData = preparePieChartData();
  const barChartData = prepareBarChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Wallet Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered insights and financial analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => router.push("/coach/wallet")}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-200"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Back to Wallet
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedMetricCard
          icon={TrendingUp}
          title="Total Credited"
          value={`₹${totalCredited.toLocaleString()}`}
          color="from-green-500 to-green-600"
          trend={12}
          isLoading={loading}
          delay={100}
        />
        <AnimatedMetricCard
          icon={TrendingDown}
          title="Total Withdrawal"
          value={`₹${totalDebited.toLocaleString()}`}
          color="from-red-500 to-red-600"
          trend={-8}
          isLoading={loading}
          delay={200}
        />
        <AnimatedMetricCard
          icon={DollarSign}
          title="Net Flow"
          value={`${netFlow >= 0 ? "+" : ""}₹${netFlow.toLocaleString()}`}
          color="from-blue-500 to-blue-600"
          trend={netFlow >= 0 ? 15 : -12}
          isLoading={loading}
          delay={300}
        />
        <AnimatedMetricCard
          icon={Activity}
          title="Transactions (Period)"
          value={transactionCount}
          color="from-purple-500 to-purple-600"
          isLoading={loading}
          delay={400}
        />

      </div>

      {/* Enhanced Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedChartCard title="Transaction Flow" icon={TrendingUp}>
          <div className="h-64">
            {transactionFlowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transactionFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      name === "credit"
                        ? "Credits"
                        : name === "debit"
                          ? "Debits"
                          : "Net Flow",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="credit"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="debit"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transaction data available</p>
                  <p className="text-sm">Transaction flow over time</p>
                </div>
              </div>
            )}
          </div>
        </EnhancedChartCard>

        <EnhancedChartCard title="Transaction Types" icon={Activity}>
          <div className="h-64">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Transactions"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transaction data available</p>
                  <p className="text-sm">Transaction type distribution</p>
                </div>
              </div>
            )}
          </div>
        </EnhancedChartCard>
      </div>

      {/* Enhanced Weekly Transaction Volume */}
      <EnhancedChartCard title="Weekly Transaction Volume" icon={BarChart}>
        <div className="h-64">
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "amount" ? `₹${value.toLocaleString()}` : value,
                    name === "amount" ? "Amount" : "Count",
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="amount"
                  fill="#3B82F6"
                  name="Amount"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="count"
                  fill="#10B981"
                  name="Count"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transaction data available</p>
                <p className="text-sm">Weekly transaction volume</p>
              </div>
            </div>
          )}
        </div>
      </EnhancedChartCard>

      {/* Enhanced AI Insights */}
      <AIInsightsCard insights={aiInsights} loading={insightsLoading} />

      {/* Enhanced Fraud Detection & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedChartCard
          title="Fraud Detection"
          icon={Shield}
          className="bg-gradient-to-br from-orange-50 to-red-50"
        >
          <div className="space-y-4">
            {fraudData ? (
              <>
                <div
                  className={`p-4 rounded-xl ${(fraudData.overallRiskLevel || fraudData.riskLevel) ===
                    "low"
                    ? "bg-green-100 border border-green-200"
                    : (fraudData.overallRiskLevel || fraudData.riskLevel) ===
                      "medium"
                      ? "bg-yellow-100 border border-yellow-200"
                      : "bg-red-100 border border-red-200"
                    }`}
                >
                  <p
                    className={`text-sm font-medium mb-2 ${(fraudData.overallRiskLevel || fraudData.riskLevel) ===
                      "low"
                      ? "text-green-600"
                      : (fraudData.overallRiskLevel ||
                        fraudData.riskLevel) === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                      }`}
                  >
                    Overall Risk Level
                  </p>
                  <p
                    className={`text-2xl font-bold ${(fraudData.overallRiskLevel || fraudData.riskLevel) ===
                      "low"
                      ? "text-green-900"
                      : (fraudData.overallRiskLevel ||
                        fraudData.riskLevel) === "medium"
                        ? "text-yellow-900"
                        : "text-red-900"
                      }`}
                  >
                    {(
                      fraudData.overallRiskLevel ||
                      fraudData.riskLevel ||
                      "low"
                    )
                      .charAt(0)
                      .toUpperCase() +
                      (
                        fraudData.overallRiskLevel ||
                        fraudData.riskLevel ||
                        "low"
                      ).slice(1)}
                  </p>
                </div>

                {fraudData.riskFactors && fraudData.riskFactors.length > 0 && (
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Risk Factors
                    </h4>
                    <ul className="space-y-2">
                      {fraudData.riskFactors.map((factor, index) => (
                        <li
                          key={index}
                          className="text-gray-700 text-sm flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No fraud detection data available</p>
                <p className="text-sm">
                  Fraud analysis will be performed automatically
                </p>
              </div>
            )}
          </div>
        </EnhancedChartCard>

        <EnhancedChartCard
          title="Predictions"
          icon={TrendingUpIcon}
          className="bg-gradient-to-br from-blue-50 to-indigo-50"
        >
          <div className="space-y-4">
            {predictions ? (
              <>
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    Projected Revenue (30 days)
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    ₹
                    {predictions.revenueForecast?.[0]?.predictedRevenue?.toLocaleString() ||
                      predictions.revenue?.projected?.toLocaleString() ||
                      "N/A"}
                  </p>
                  <p className="text-sm text-blue-600">
                    Confidence:{" "}
                    {Math.round(
                      (predictions.revenueForecast?.[0]?.confidence ||
                        predictions.revenue?.confidence ||
                        0) * 100
                    )}
                    %
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-2">
                    Client Retention Rate
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {predictions.clientRetentionRate ||
                      predictions.clientActivity?.expectedNewClients ||
                      "N/A"}
                    %
                  </p>
                </div>

                {predictions.recommendations &&
                  predictions.recommendations.length > 0 && (
                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        AI Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {predictions.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="text-gray-700 text-sm flex items-center gap-2"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No prediction data available</p>
                <p className="text-sm">
                  Predictions will be generated based on your data
                </p>
              </div>
            )}
          </div>
        </EnhancedChartCard>
      </div>

      {/* Enhanced Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedChartCard title="Performance Metrics" icon={Target}>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <span className="text-gray-700 font-medium">
                Average Transaction Value
              </span>
              <span className="font-bold text-green-900">
                ₹
                {(
                  analyticsData?.averageTransaction || averageTransaction
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <span className="text-gray-700 font-medium">
                Transaction Frequency
              </span>
              <span className="font-bold text-blue-900">
                {aiInsights?.trends?.transactionFrequency ||
                  Math.round(
                    (analyticsData?.transactionCount || transactionCount) /
                    (period === "7d" ? 7 : period === "30d" ? 30 : 90)
                  )}{" "}
                per day
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <span className="text-gray-700 font-medium">Success Rate</span>
              <span className="font-bold text-purple-900">
                {analyticsData?.successRate || 98.5}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <span className="text-gray-700 font-medium">Growth Rate</span>
              <span
                className={`font-bold ${(analyticsData?.growthRate || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {(analyticsData?.growthRate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </EnhancedChartCard>

        <EnhancedChartCard title="Transaction Sources" icon={Activity}>
          <div className="space-y-4">
            {analyticsData?.topTransactionTypes?.map((type, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl"
              >
                <span className="text-gray-700 font-medium capitalize">
                  {type.type.replace("_", " ")}
                </span>
                <span className="font-bold text-indigo-900">
                  {type.count} transactions
                </span>
              </div>
            )) || (
                <>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                    <span className="text-gray-700 font-medium">
                      Client Payments
                    </span>
                    <span className="font-bold text-indigo-900">75%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <span className="text-gray-700 font-medium">Commission</span>
                    <span className="font-bold text-purple-900">15%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <span className="text-gray-700 font-medium">Referrals</span>
                    <span className="font-bold text-blue-900">10%</span>
                  </div>
                </>
              )}
          </div>
        </EnhancedChartCard>
      </div>
    </div>
  );
}
