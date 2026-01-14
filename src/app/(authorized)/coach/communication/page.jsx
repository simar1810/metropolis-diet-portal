"use client";
import { useRouter } from "next/navigation";
import CommunicationCenter from "@/components/pages/coach/communication/CommunicationCenter";

export default function CommunicationPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <CommunicationCenter />
    </div>
  );
}
