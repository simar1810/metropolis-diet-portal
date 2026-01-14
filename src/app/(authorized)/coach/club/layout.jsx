"use client";
import { permit } from "@/lib/permit";
import { useAppSelector } from "@/providers/global/hooks";
import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }) {
  const { roles, clubType, _id } = useAppSelector(state => state.coach.data);

  const clubFeaturesPermitted = permit("club", roles);
  if (!clubFeaturesPermitted && !["Club Leader"].includes(clubType)) return <div className="content-height-screen content-container">
    <div className="relative">
      <Image
        src="/illustrations/support.svg"
        alt=""
        height={300}
        width={300}
        className="object-contain mx-auto mt-24"
      />
      <h3 className="text-center mt-4">Buy Pro Subscription to Unlock Club Features</h3>
      <Link
        href={`https://wellnessz.in/plans/${_id}`}
        className="w-fit bg-[var(--accent-1)] text-white font-bold block mx-auto mt-4 px-4 py-2 rounded-[8px]"
        target="_blank"
      >
        Buy Now
      </Link>
    </div>
  </div>

  return children
}