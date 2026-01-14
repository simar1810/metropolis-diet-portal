"use client";
import { useRouter } from "next/navigation";
import WalletSettings from "@/components/pages/coach/wallet/WalletSettings";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="mt-8">
      <WalletSettings />
    </div>
  );
}
