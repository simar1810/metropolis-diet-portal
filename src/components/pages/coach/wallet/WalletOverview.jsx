"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Minus,
  CreditCard,
} from "lucide-react";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { useWallet } from "@/hooks/useWallet";
import { fetchData, sendData } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FaMoneyBills } from "react-icons/fa6";

// Money Animation Component
const MoneyAnimation = React.memo(function MoneyAnimation({ isVisible }) {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (isVisible) {
      const newCoins = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        delay: i * 100,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }));
      setCoins(newCoins);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            "--x": `${coin.x}px`,
            "--y": `${coin.y}px`,
            animationDelay: `${coin.delay}ms`,
          }}
        >
          <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg animate-pulse money-float" />
        </div>
      ))}
    </div>
  );
});

// Enhanced Balance Card with Animation
const AnimatedBalanceCard = React.memo(function AnimatedBalanceCard({
  balance,
  loading,
  onRefresh,
  onViewAll,
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsAnimating(true);
    onRefresh();
    setTimeout(() => setIsAnimating(false), 2000);
  }, [onRefresh]);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 border-0 shadow-xl wallet-card-hover">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-indigo-400/10" />
      <CardContent className="relative p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Current Balance
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                ₹{balance?.toLocaleString() || "0"}
              </div>
              <p className="text-sm text-gray-600 max-w-xs">
                Available for withdrawal and transfers
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onViewAll}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              View All
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading || isAnimating ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Money Animation Overlay */}
        <MoneyAnimation isVisible={isAnimating} />
      </CardContent>
    </Card>
  );
});

// Enhanced Stats Card
const StatsCard = React.memo(function StatsCard({
  icon: Icon,
  title,
  value,
  color,
  trend,
  isLoading,
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm wallet-card-hover">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded shimmer" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-xs ${
                    trend > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
                <TrendingUp
                  className={`h-3 w-3 ${
                    trend > 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Modal Component
const Modal = React.memo(function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[450px] relative max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          onClick={onClose}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
});

// Enhanced Quick Actions
const QuickActions = React.memo(function QuickActions({
  onCreatePayment,
  onWithdraw,
  onViewTransactions,
}) {
  const actions = useMemo(
    () => [
      {
        icon: CreditCard,
        title: "Create Payment Link",
        description: "Generate payment links for clients",
        color: "from-blue-500 to-blue-600",
        onClick: onCreatePayment,
      },
      {
        icon: FaMoneyBills,
        title: "Withdraw from Wallet",
        description: "Request money withdrawal",
        color: "from-emerald-500 to-emerald-600",
        onClick: onWithdraw,
      },
      {
        icon: Wallet,
        title: "View Transactions",
        description: "See all transaction history",
        color: "from-purple-500 to-purple-600",
        onClick: onViewTransactions,
      },
    ],
    [onCreatePayment, onWithdraw, onViewTransactions]
  );

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg wallet-card-hover">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className="h-24 flex flex-col items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group wallet-transition"
              variant="ghost"
            >
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-900 block">
                  {action.title}
                </span>
                <span className="text-xs text-gray-500">
                  {action.description}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Enhanced Transaction Item
const TransactionItem = React.memo(function TransactionItem({ transaction }) {
  // Use the same logic for determining transaction type
  const getTransactionType = useCallback((transaction) => {
    return (
      transaction.type ||
      transaction.transactionType ||
      transaction.status ||
      transaction.category
    );
  }, []);

  const getIcon = useCallback((type) => {
    switch (type) {
      case "credit":
      case "in":
      case "income":
      case "received":
        return {
          icon: Plus,
          color: "from-green-500 to-green-600",
          bg: "bg-green-100",
        };
      case "debit":
      case "out":
      case "expense":
      case "sent":
      case "withdrawal":
        return {
          icon: Minus,
          color: "from-red-500 to-red-600",
          bg: "bg-red-100",
        };
      default:
        return {
          icon: ArrowRightLeft,
          color: "from-blue-500 to-blue-600",
          bg: "bg-blue-100",
        };
    }
  }, []);

  const transactionType = getTransactionType(transaction);
  const { icon: Icon, color, bg } = getIcon(transactionType);

  return (
    <div className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 hover:border-gray-200 transition-all duration-200 wallet-transition">
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-xl ${bg} group-hover:scale-105 transition-transform duration-200`}
        >
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            {transaction.description}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(transaction.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-lg font-bold ${
            transactionType === "credit" ||
            transactionType === "in" ||
            transactionType === "income" ||
            transactionType === "received"
              ? "text-green-600"
              : transactionType === "debit" ||
                transactionType === "out" ||
                transactionType === "expense" ||
                transactionType === "sent" ||
                transactionType === "withdrawal"
              ? "text-red-600"
              : "text-blue-600"
          }`}
        >
          {transactionType === "credit" ||
          transactionType === "in" ||
          transactionType === "income" ||
          transactionType === "received"
            ? "+"
            : transactionType === "debit" ||
              transactionType === "out" ||
              transactionType === "expense" ||
              transactionType === "sent" ||
              transactionType === "withdrawal"
            ? "-"
            : ""}
          ₹{transaction.amount.toLocaleString()}
        </p>
        <Badge
          variant={transaction.status === "completed" ? "default" : "secondary"}
          className="mt-1"
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
});

export default function WalletOverview() {
  const router = useRouter();
  const { balance, transactions, loading, error, refreshData } = useWallet();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsError, setWithdrawalsError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [localWithdrawAmount, setLocalWithdrawAmount] = useState(""); // Local state for input
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  // Memoized callback functions
  const handleCreatePayment = useCallback(() => {
    router.push("/coach/payments/create");
  }, [router]);

  const handleWithdraw = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleViewTransactions = useCallback(() => {
    router.push("/coach/wallet/transactions");
  }, [router]);

  const handleViewAll = useCallback(() => {
    router.push("/coach/wallet/transactions");
  }, [router]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  // Handle local input changes
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setLocalWithdrawAmount(value);
  }, []);

  // Reset local input when modal opens/closes
  useEffect(() => {
    if (modalOpen) {
      setLocalWithdrawAmount("");
    }
  }, [modalOpen]);

  // Memoized expensive calculations
  const transactionsArray = useMemo(
    () => (Array.isArray(transactions) ? transactions : []),
    [transactions]
  );

  const sortedTransactions = useMemo(
    () =>
      transactionsArray.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [transactionsArray]
  );

  const paidWithdrawalsForTransactions = useMemo(
    () => withdrawals.filter((w) => w.status === "paid"),
    [withdrawals]
  );

  const withdrawalTransactions = useMemo(
    () =>
      paidWithdrawalsForTransactions.map((w) => ({
        _id: w._id,
        type: "debit",
        amount: w.amount,
        description: `Withdrawal - ${w.status}`,
        status: w.status,
        createdAt: w.createdAt || w.updatedAt,
        category: "withdrawal",
      })),
    [paidWithdrawalsForTransactions]
  );

  const allTransactions = useMemo(
    () => [...sortedTransactions, ...withdrawalTransactions],
    [sortedTransactions, withdrawalTransactions]
  );

  const allSortedTransactions = useMemo(
    () =>
      allTransactions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [allTransactions]
  );

  const recentTransactions = useMemo(
    () => allSortedTransactions.slice(0, 5) || [],
    [allSortedTransactions]
  );

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

  // Manual refresh function for withdrawals
  // Check for different possible field names for transaction type
  const getTransactionType = useCallback((transaction) => {
    // Check multiple possible field names
    let type =
      transaction.type ||
      transaction.transactionType ||
      transaction.status ||
      transaction.category;

    // If no type found, try to determine from amount or other fields
    if (!type) {
      // Check if amount is negative (might indicate debit)
      if (transaction.amount < 0) {
        type = "debit";
      } else if (transaction.amount > 0) {
        type = "credit";
      }

      // Check description for keywords
      const description = (transaction.description || "").toLowerCase();
      if (
        description.includes("withdrawal") ||
        description.includes("debit") ||
        description.includes("payment") ||
        description.includes("transfer")
      ) {
        type = "debit";
      } else if (
        description.includes("credit") ||
        description.includes("payment received") ||
        description.includes("income")
      ) {
        type = "credit";
      }
    }

    return type;
  }, []);

  // Memoized calculations for totals
  const totalCredited = useMemo(
    () =>
      transactionsArray
        .filter((t) => {
          const type = getTransactionType(t);
          const isCredit =
            type === "credit" ||
            type === "in" ||
            type === "income" ||
            type === "received";

          return isCredit;
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    [transactionsArray, getTransactionType]
  );

  // Calculate total debited from wallet transactions
  const debitTransactions = useMemo(
    () =>
      transactionsArray.filter((t) => {
        const type = getTransactionType(t);
        const isDebit =
          type === "debit" ||
          type === "out" ||
          type === "expense" ||
          type === "sent" ||
          type === "withdrawal";

        return isDebit;
      }),
    [transactionsArray, getTransactionType]
  );

  // Get paid withdrawal requests and convert them to debit transactions
  const paidWithdrawalsForDebit = useMemo(
    () => withdrawals.filter((w) => w.status === "paid"),
    [withdrawals]
  );

  const withdrawalDebitTransactions = useMemo(
    () =>
      paidWithdrawalsForDebit.map((w) => ({
        _id: w._id,
        type: "debit",
        amount: w.amount,
        description: `Withdrawal - ${w.status}`,
        status: w.status,
        createdAt: w.createdAt || w.updatedAt,
        category: "withdrawal",
      })),
    [paidWithdrawalsForDebit]
  );

  // Combine regular debit transactions with paid withdrawal transactions
  const allDebitTransactions = useMemo(
    () => [...debitTransactions, ...withdrawalDebitTransactions],
    [debitTransactions, withdrawalDebitTransactions]
  );

  const totalDebited = useMemo(
    () =>
      allDebitTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    [allDebitTransactions]
  );

  // Manual refresh function for withdrawals
  const refreshWithdrawals = useCallback(async () => {
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
  }, []);

  // Now we can have early returns after all hooks are called
  if (loading) return <ContentLoader />;
  if (error) return <ContentError title={error} />;

  async function handleWithdrawSubmit(e) {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawError("");
    setWithdrawSuccess("");

    // Use local withdraw amount for validation and submission
    const amountToSubmit = localWithdrawAmount;

    try {
      if (
        !amountToSubmit ||
        isNaN(amountToSubmit) ||
        Number(amountToSubmit) <= 0
      ) {
        setWithdrawError("Enter a valid amount.");
        setWithdrawLoading(false);
        return;
      }
      if (Number(amountToSubmit) < 100) {
        setWithdrawError("Minimum withdrawal amount is ₹100.");
        setWithdrawLoading(false);
        return;
      }
      if (Number(amountToSubmit) > balance) {
        setWithdrawError("Amount exceeds available balance.");
        setWithdrawLoading(false);
        return;
      }
      const res = await sendData("app/withdrawal", {
        amount: Number(amountToSubmit),
      });
      if (res?.success) {
        setWithdrawSuccess("Withdrawal request submitted!");
        setLocalWithdrawAmount("");
        setModalOpen(false);
        refreshWithdrawals(); // Refresh withdrawals after successful submission
      } else {
        setWithdrawError(res?.message || "Failed to submit request.");
      }
    } catch (err) {
      setWithdrawError("Failed to submit request.");
    } finally {
      setWithdrawLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Withdraw Modal */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <form onSubmit={handleWithdrawSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <FaMoneyBills className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Withdraw from Wallet
            </h2>
            <p className="text-gray-600">
              Enter the amount you'd like to withdraw
            </p>
          </div>

          {/* Amount Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max={balance}
                  value={localWithdrawAmount}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 px-6 py-4 rounded-xl text-lg font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 placeholder-gray-400"
                  placeholder="100.00"
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-medium">
                  ₹
                </div>
              </div>

              {/* Available Balance Display */}
              <div className="mt-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Available Balance:
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    ₹{balance?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Maximum withdrawal amount: ₹{balance?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {withdrawError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {withdrawError}
                </div>
              </div>
            )}

            {/* Success Messages */}
            {withdrawSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {withdrawSuccess}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={withdrawLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {withdrawLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Withdrawal...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FaMoneyBills className="h-5 w-5" />
                  <span>Submit Withdrawal Request</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => setModalOpen(false)}
              variant="outline"
              className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
          </div>

          {/* Additional Information */}
          <div className="pt-4 border-t border-gray-100">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>• Withdrawal requests are processed within 24-48 hours</p>
              <p>• Minimum withdrawal amount: ₹100</p>
              <p>• Processing fees may apply</p>
            </div>
          </div>
        </form>
      </Modal>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Manage your earnings and transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="gujarati">Gujarati</option>
            <option value="marathi">Marathi</option>
            <option value="tamil">Tamil</option>
            <option value="telugu">Telugu</option>
          </select>
        </div>
      </div>

      {/* Balance Card */}
      <AnimatedBalanceCard
        balance={balance}
        loading={loading}
        onRefresh={refreshData}
        onViewAll={handleViewAll}
      />

      {/* Quick Actions */}
      <QuickActions
        onCreatePayment={handleCreatePayment}
        onWithdraw={handleWithdraw}
        onViewTransactions={handleViewTransactions}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={TrendingUp}
          title="Total Credited"
          value={totalCredited.toLocaleString()}
          color="from-green-500 to-green-600"
          trend={0} // No trend data for total credited
          isLoading={loading}
        />
        <StatsCard
          icon={TrendingDown}
          title="Total Debited"
          value={totalDebited.toLocaleString()}
          color="from-red-500 to-red-600"
          trend={0} // No trend data for total debited
          isLoading={loading}
        />

        <StatsCard
          icon={Wallet}
          title="Transactions"
          value={transactionsArray.length || 0}
          color="from-purple-500 to-purple-600"
          trend={0} // No trend data for transactions
          isLoading={loading}
        />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <Button onClick={handleViewAll} variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
              <p className="text-sm">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Withdrawal Requests (Coach View) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wallet Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <ContentLoader />
          ) : withdrawalsError ? (
            <ContentError title={withdrawalsError} />
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Minus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No withdrawal requests yet</p>
              <p className="text-sm">
                Your withdrawal requests will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaMoneyBills className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        ₹{req.amount.toLocaleString()} requested
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      {req.adminNote && (
                        <p className="text-xs text-gray-400 mt-1">
                          Admin note: {req.adminNote}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        req.status === "approved"
                          ? "default"
                          : req.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
