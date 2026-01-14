"use client";
import { Button } from "@/components/ui/button";
import { sendData } from "@/lib/api";
import { copyText } from "@/lib/utils";
import { getYoutubeLink_OAuth } from "@/lib/youtube";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [loading, setLoading] = useState(false)

  async function createAuthorizationURL() {
    try {
      setLoading(true);
      const response = await sendData("app/youtube/oauth", {}, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      window.location.href = response.data;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <div className="content-container content-height-screen mx-10 bg-[var(--comp-1)]">
    {/* <Link
      href={getYoutubeLink_OAuth("123213213")}
      target="_blank"
    > */}
    <Button
      onClick={createAuthorizationURL}
      disabled={loading}
      variant="destructive"
    >
      <Play />
      Youtube
    </Button>
    {/* </Link> */}
  </div>
}