"use client";
import { useRouter } from "next/navigation";
import PaymentLinkCreator from "@/components/pages/coach/payments/PaymentLinkCreator";

export default function CreatePaymentPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <PaymentLinkCreator />
    </div>
  );
}
