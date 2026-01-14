"use client";
import { useAppSelector } from "@/providers/global/hooks";
import Image from "next/image";
import { Youtube } from "lucide-react";
import { buildUrlWithQueryParams } from "@/lib/formatter";

const YT_REDIRECTION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
// const YT_OAUTH_CLIENT_ID = "92110669040-tjdv1tdl21qs0d1dk5epe4lhrb7cjqqi.apps.googleusercontent.com"
const YT_OAUTH_CLIENT_ID = "834817880706-uc3r0pbdiounqiqlvunjn3tqf2lquu18.apps.googleusercontent.com"
const YT_RESPONSE_TYPE = "code"
// const YT_REDIRECT_URL = "https://api.wellnessz.in/api/app/youtube/oauth"
const YT_REDIRECT_URL = "https://314767e40d3e.ngrok-free.app/api/app/youtube/oauth"
const YT_SCOPES = [
  // "https://www.googleapis.com/auth/youtube.upload"
  "https://www.googleapis.com/auth/youtube"
]

export default function Layout({ children }) {
  const { features, ytDocRef, _id } = useAppSelector(state => state.coach.data)

  function redirectToYoutube() {
    const endpoint = buildUrlWithQueryParams(
      YT_REDIRECTION_URL,
      {
        client_id: YT_OAUTH_CLIENT_ID,
        response_type: YT_RESPONSE_TYPE,
        redirect_uri: YT_REDIRECT_URL,
        scope: YT_SCOPES.join(" "),
        state: _id,
        access_type: "offline",
        prompt: "consent"
      }
    )
    window.location.href = endpoint;
  }

  if (!features.includes(6)) return <div className="content-height-screen content-container">
    <div className="relative">
      <Image
        src="/illustrations/support.svg"
        alt=""
        height={300}
        width={300}
        className="object-contain mx-auto mt-24"
      />
      <h3 className="text-center mt-4">This feature is not enabled. Please contact our customer support.</h3>
    </div>
  </div>

  if (features.includes(6) && !ytDocRef) return (
    <div className="content-container content-height-screen flex flex-col justify-center items-center">
      <Youtube size={120} className="text-red-600 mb-6" />
      <h3 className="text-lg font-semibold mb-2">Connect your YouTube account</h3>
      <p className="text-center mb-4 text-gray-600 max-w-md">
        To access this feature, please connect your YouTube account. This enables you to import and manage your course videos more easily.
      </p>
      <button
        className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
        onClick={redirectToYoutube}
      >
        Connect YouTube Account
      </button>
    </div>
  );

  return children
}