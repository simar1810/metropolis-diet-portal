"use client";
import { parseHashFragment } from "@/lib/youtube"
import { useParams, useSearchParams } from "next/navigation";

export default function Page() {
  const params = parseHashFragment()

  const {
    token,
    state,
    token_type,
    expires_in,
    scope
  } = {
    token: params.get("access_token"),
    state: params.get("state"),
    token_type: params.get("token_type"),
    expires_in: params.get("expires_in"),
    scope: params.get("scope"),
  }
  return <div className="content-container content-height-screen mx-10 bg-[var(--comp-1)]">
    <p className="my-4">token = {token}</p>
    <p className="my-4">state = {state}</p>
    <p className="my-4">token_type = {token_type}</p>
    <p className="my-4">expires_in = {expires_in}</p>
    <p className="my-4">scope = {scope}</p>
  </div>
}