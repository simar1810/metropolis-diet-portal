"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WalletOverview from "@/components/pages/coach/wallet/WalletOverview";

export default function WalletPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <WalletOverview />
    </div>
  );
}
