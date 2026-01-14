"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendData } from "@/lib/api";
import { getMeeting } from "@/lib/fetchers/club";
import { generateMeetingBaseLink } from "@/lib/utils";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [rollno, setRollno] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { id } = useParams();

  async function joinMeeting() {
    try {
      setLoading(true);
      const response = await sendData("verifyClientMeeting?wellnessZLink=" + generateMeetingBaseLink(id), { rollno, person: "client" });
      if (!response.status) throw new Error(response.message);
      router.push(response.data)
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onboardClient() {
    try {
      const response = await getMeeting(id)
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      router.push(`/onboarding-form?id=${response?.data?.coach}`)
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    }
  }

  return <div className="container h-screen flex flex-col">
    <Image
      src="/wz-landscape.png"
      height={200}
      width={200}
      alt=""
      className="w-full max-h-[80px] object-left object-contain border-b-2"
    />
    <div className="max-w-[500px] w-full bg-[var(--comp-1)] py-6 px-8 mx-auto my-auto border-1 shadow-2xl rounded-[8px]">
      <h3 className="text-[32px] text-center">
        <span className="text-[var(--accent-1)]">Metro Polis</span>&nbsp;
        <span>Club</span>
      </h3>
      <p className="text-[14px] text-[var(--dark-1)]/25 text-center font-semibold mt-2">Please Enter Allocated Roll Number given by your Coach</p>
      <div className="flex gap-2 mt-10">
        <Input
          placeholder="Please enter your Roll No."
          value={rollno}
          onChange={e => setRollno(e.target.value)}
        />
        <Button
          onClick={joinMeeting}
          variant="wz"
          disabled={loading}
        >
          Enter
        </Button>
      </div>
      <Button
        size="sm"
        onClick={onboardClient}
        className="block mt-4 mx-auto"
      >
        Don't Have Roll Number
      </Button>
    </div>
  </div>
}