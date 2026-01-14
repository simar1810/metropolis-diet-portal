"use client";
import { useRouter } from "next/navigation";
import PaymentManager from "@/components/pages/coach/payments/PaymentManager";

export default function ManagePaymentsPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <PaymentManager />
    </div>
  );
}
