"use client";
import { useRouter } from "next/navigation";
import WalletAnalytics from "@/components/pages/coach/wallet/WalletAnalytics";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <WalletAnalytics />
    </div>
  );
}
