"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchData, sendData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  Lock,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function PayPage({ params }) {
  const paymentId = params.paymentId;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [polling, setPolling] = useState(false);
  const [voucherCode, setVoucherCode] = useState(
    searchParams.get("voucher") || ""
  );
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "paid":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
          border: "border-green-200",
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          border: "border-red-200",
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-orange-600",
          bg: "bg-orange-100",
          border: "border-orange-200",
        };
      case "refunded":
        return {
          icon: RefreshCw,
          color: "text-blue-600",
          bg: "bg-blue-100",
          border: "border-blue-200",
        };
      default:
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          border: "border-yellow-200",
        };
    }
  };

  // Fetch payment details
  useEffect(() => {
    async function fetchPayment() {
      setLoading(true);
      setError("");
      try {
        const res = await fetchData(`app/payment/getpayment/${paymentId}`, {});
        if (res?.success) {
          setPayment(res.data.payment);
          setStatus(res.data.payment.status);
          // Initialize final amount with original payment amount
          setFinalAmount(res.data.payment.amount || 0);
        } else {
          setError(res?.message || "Could not fetch payment details.");
        }
      } catch (err) {
        setError("Could not fetch payment details.");
      } finally {
        setLoading(false);
      }
    }
    fetchPayment();
  }, [paymentId]);

  // Poll for payment status after checkout
  useEffect(() => {
    let interval;
    if (polling) {
      interval = setInterval(async () => {
        try {
          const res = await fetchData(
            `app/payment/getpayment/${paymentId}`,
            {}
          );
          if (res?.success) {
            setStatus(res.data.payment.status);
            if (
              ["paid", "failed", "cancelled", "refunded"].includes(
                res.data.payment.status
              )
            ) {
              setPolling(false);
            }
          }
        } catch { }
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [polling, paymentId]);

  // Razorpay script loader
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Launch Razorpay checkout
  async function handlePay() {
    setPayLoading(true);
    setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load Razorpay script.");
        setPayLoading(false);
        return;
      }
      // Create Razorpay order using backend API
      const res = await sendData(`app/payment/create-order`, {
        paymentId,
        amount: finalAmount || payment?.amount || 100,
        voucher: voucherCode,
      });
      if (!res?.success || !res.orderId) {
        setError(res?.message || "Could not create Razorpay order.");
        setPayLoading(false);
        return;
      }
      const options = {
        key: res.razorpayKey,
        amount: res.amount,
        currency: "INR",
        name: "Metro Polis",
        description: "Payment",
        order_id: res.orderId,
        handler: function () {
          setPolling(true); // Start polling for webhook update
        },
        prefill: {
          name: payment?.client?.name,
          email: payment?.client?.email,
          contact: payment?.client?.mobileNumber,
        },
        theme: { color: "#10B981" }, // Updated to emerald color
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Could not launch Razorpay checkout.");
    } finally {
      setPayLoading(false);
    }
  }

  // Validate and apply voucher code
  async function handleVoucherApply() {
    if (!voucherCode.trim()) {
      setVoucherError("Please enter a voucher code");
      return;
    }

    setVoucherLoading(true);
    setVoucherError("");
    setVoucherSuccess("");

    try {
      const res = await sendData("app/payment/validate-voucher", {
        voucherCode: voucherCode.trim(),
        paymentId,
        amount: payment?.amount || 0,
      });

      if (res?.success) {
        setVoucherApplied(true);
        setVoucherSuccess(
          `Voucher applied! ${res.message || "Discount has been applied to your payment."
          }`
        );

        // Extract discount details from API response
        const voucherData = res.data;
        const originalAmount =
          voucherData.originalAmount || payment?.amount || 0;
        const discount = voucherData.discountAmount || 0;
        const discountedAmount = voucherData.finalAmount || originalAmount;
        const discountPercent =
          originalAmount > 0
            ? Math.round((discount / originalAmount) * 100)
            : 0;

        setDiscountAmount(discount);
        setDiscountPercentage(discountPercent);
        setFinalAmount(discountedAmount);

        // Update payment object with discount info
        if (payment) {
          setPayment({
            ...payment,
            discount: {
              amount: discount,
              percentage: discountPercent,
            },
          });
        }
      } else {
        setVoucherError(res?.message || "Invalid voucher code");
        setVoucherApplied(false);
      }
    } catch (err) {
      setVoucherError("Failed to validate voucher. Please try again.");
      setVoucherApplied(false);
    } finally {
      setVoucherLoading(false);
    }
  }

  // Remove voucher
  function handleVoucherRemove() {
    setVoucherCode("");
    setVoucherApplied(false);
    setVoucherError("");
    setVoucherSuccess("");
    setDiscountAmount(0);
    setDiscountPercentage(0);
    setFinalAmount(payment?.amount || 0);

    // Reset payment object discount
    if (payment) {
      setPayment({
        ...payment,
        discount: {
          amount: 0,
          percentage: 0,
        },
      });
    }
  }

  if (loading) return <ContentLoader />;
  if (error) return <ContentError title={error} />;

  const statusInfo = getStatusInfo(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100/10 to-blue-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <CreditCard className="h-14 w-14 text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-28 h-28 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 leading-tight">
              Secure Payment Gateway
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {payment?.invoice?.note ||
                "Complete your secure payment with bank-grade encryption and instant confirmation"}
            </p>
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <Lock className="h-5 w-5" />
                <span className="text-sm font-medium">PCI DSS</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Instant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Payment Card */}
        <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl wallet-card-hover relative overflow-hidden">
          {/* Card background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-blue-50/50 to-indigo-50/50 opacity-50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-blue-200/20 rounded-full blur-2xl"></div>

          <CardHeader className="pb-8 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Details
                </CardTitle>
                <p className="text-gray-600">
                  Review and complete your secure transaction
                </p>
              </div>
              <Badge
                variant="outline"
                className={`${statusInfo.bg} ${statusInfo.border} ${statusInfo.color} font-semibold px-6 py-3 text-base shadow-lg`}
              >
                <statusInfo.icon className="h-5 w-5 mr-2" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 relative z-10">
            {/* Enhanced Amount Section */}
            <div className="p-8 bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 rounded-3xl border-2 border-emerald-200/50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xl font-semibold text-gray-700">
                    Total Amount
                  </span>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-none">
                  ₹{finalAmount?.toLocaleString()}
                </div>

                {/* Original Price (if discounted) */}
                {discountAmount > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl text-gray-500 line-through">
                      ₹{payment?.amount?.toLocaleString()}
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Save ₹{discountAmount.toLocaleString()} (
                        {discountPercentage}% off)
                      </span>
                    </div>
                  </div>
                )}

                {/* Show discount info if voucher is applied */}
                {voucherApplied && discountAmount > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-900">
                          Voucher Discount Applied
                        </p>
                        <p className="text-sm text-green-700">
                          Original: ₹{payment?.amount?.toLocaleString()} |
                          Final: ₹{finalAmount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-900">
                          -₹{discountAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-700">
                          {discountPercentage}% off
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Debug Info - Remove this in production */}

              </div>
            </div>

            {/* Voucher Section */}
            <div className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl border-2 border-purple-200/50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Have a Voucher Code?
                  </h3>
                </div>

                {!voucherApplied ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter voucher code"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 placeholder-gray-400"
                        disabled={voucherLoading}
                      />
                      <Button
                        onClick={handleVoucherApply}
                        disabled={voucherLoading || !voucherCode.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {voucherLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Applying...</span>
                          </div>
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>

                    {voucherError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">{voucherError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">
                          Voucher Applied Successfully!
                        </p>
                        <p className="text-sm text-green-700">
                          {voucherSuccess}
                        </p>
                      </div>
                      <Button
                        onClick={handleVoucherRemove}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Enter your voucher code to get instant discounts on your
                  payment
                </p>
              </div>
            </div>

            {/* Enhanced Client Information */}
            {payment?.client && (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200/50 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-gray-200/50">
                      <span className="text-gray-600 font-medium">
                        Full Name
                      </span>
                      <span className="font-semibold text-gray-900">
                        {payment.client.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-gray-200/50">
                      <span className="text-gray-600 font-medium">
                        Email Address
                      </span>
                      <span className="font-semibold text-gray-900">
                        {payment.client.email}
                      </span>
                    </div>
                  </div>
                  {payment.client.mobileNumber && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-gray-200/50">
                        <span className="text-gray-600 font-medium">
                          Mobile Number
                        </span>
                        <span className="font-semibold text-gray-900">
                          {payment.client.mobileNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-gray-200/50">
                        <span className="text-gray-600 font-medium">
                          Payment ID
                        </span>
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {paymentId}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Payment Actions */}
            {status === "pending" && (
              <div className="space-y-6">
                <Button
                  onClick={handlePay}
                  disabled={payLoading || polling}
                  className="w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 hover:from-emerald-600 hover:via-blue-600 hover:to-indigo-700 text-white py-8 rounded-2xl font-bold text-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {payLoading ? (
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Launching Secure Payment Gateway...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Lock className="h-6 w-6" />
                      <span>Pay Securely Now</span>
                      <ArrowRight className="h-6 w-6 animate-pulse" />
                    </div>
                  )}
                </Button>

                {/* Enhanced Security Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-emerald-900">
                      SSL Secured
                    </p>
                    <p className="text-sm text-emerald-700">
                      256-bit encryption
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-blue-900">PCI Compliant</p>
                    <p className="text-sm text-blue-700">Bank-grade security</p>
                  </div>
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-indigo-900">
                      Instant Confirmation
                    </p>
                    <p className="text-sm text-indigo-700">Real-time updates</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Status Messages */}
            {polling && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl text-blue-600 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-900">
                      Processing Your Payment...
                    </p>
                    <p className="text-blue-700">
                      Please wait while we securely confirm your transaction
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "paid" && (
              <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl text-green-600">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      Payment Successful! 🎉
                    </p>
                    <p className="text-green-700 text-lg">
                      Thank you for your payment. You will receive a
                      confirmation email shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {["failed", "cancelled", "refunded"].includes(status) && (
              <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl text-red-600">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-red-100 rounded-full">
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-900">
                      Payment {status.charAt(0).toUpperCase() + status.slice(1)}
                    </p>
                    <p className="text-red-700 text-lg">
                      Please try again or contact our support team for
                      assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Additional Information */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Bank-grade security</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              <span>Instant confirmation</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>
              • All payments are processed securely through Razorpay's
              enterprise-grade infrastructure
            </p>
            <p>
              • Your payment information is encrypted with 256-bit SSL
              encryption and protected by PCI DSS standards
            </p>
            <p>• For support, contact our 24/7 customer service team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
