"use client";
import { useRouter } from "next/navigation";
import VoucherManager from "@/components/pages/coach/payments/VoucherManager";

export default function VouchersPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <VoucherManager />
    </div>
  );
}
