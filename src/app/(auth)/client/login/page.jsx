"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendData } from "@/lib/api";
import { useAppDispatch } from "@/providers/global/hooks";
import { storeClient } from "@/providers/global/slices/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatchRedux = useAppDispatch();

  const router = useRouter();

  async function loginClient() {
    try {
      setLoading(true);
      const response = await sendData("app/clientLogin", { code: clientId });

      if (response.status_code !== 200) throw new Error(response.message);

      const authHeaderResponse = await fetch("/api/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: response?.data?.refreshToken, _id: response?.data?._id })
      })
      const authHeaderData = await authHeaderResponse.json()
      if (authHeaderData.status_code !== 200) throw new Error(authHeaderData.message);
      dispatchRedux(storeClient(response.data))

      toast.success(response.message);
      router.push("/client/app/dashboard")
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="w-full max-w-md mx-auto p-4">
    <h3 className="text-2xl font-semibold mb-4">Hi, Welcome</h3>
    <h5 className="text-lg mb-1">Ready to Inspire Wellness?</h5>
    <p className="text-gray-600 text-sm mb-6">
      Sign up or log in now to transform.
    </p>
    <Input
      value={clientId}
      onChange={e => setClientId(e.target.value)}
      placeholder="Enter Client ID"
      className="mb-4 bg-[var(--comp-1)]"
    />
    <Button
      variant="wz"
      size="lg"
      className="w-full"
      onClick={loginClient}
      disabled={loading}
    >
      Login
    </Button>
  </div>
}