"use client";
import { useRouter } from "next/navigation";
import TransactionHistory from "@/components/pages/coach/wallet/TransactionHistory";

export default function TransactionsPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <TransactionHistory />
    </div>
  );
}
