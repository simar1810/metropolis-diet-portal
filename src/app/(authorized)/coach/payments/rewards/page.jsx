"use client";
import { useRouter } from "next/navigation";
import RewardsDashboard from "@/components/pages/coach/payments/RewardsDashboard";

export default function RewardsPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <RewardsDashboard />
    </div>
  );
}
