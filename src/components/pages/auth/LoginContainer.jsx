"use client";
import { useAppSelector } from "@/providers/global/hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UserLoginForm from "./UserLoginForm";

export default function LoginContainer() {
  const { isLoggedIn } = useAppSelector((state) => state.coach);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/coach/dashboard");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="grow">
      <UserLoginForm />
    </div>
  );
}