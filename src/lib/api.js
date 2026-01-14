"use server";

import { useExpireUserSession } from "@/components/common/AppNavbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export async function fetchData(endpoint, expireUserSession) {
  try {
    const cookieStore = await cookies();
    const TOKEN = cookieStore.get("token")?.value;

    const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      cache: "no-store",
    });

    if (response.status === 502) {
      redirect("/maintenance");
    }

    const data = await response.json();
    if (
      [408].includes(data.status_code)
      // || data.message?.toLowerCase() === "something went wrong"
    ) {
      cookieStore.delete("token");
      redirect("/login");
    }
    return data;
  } catch (error) {
    // Rethrow Next.js navigation errors (redirect, notFound, etc.)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return error;
  }
}

export async function sendData(
  endpoint,
  data,
  method = "POST",
  expireUserSession
) {
  try {
    if (typeof method !== "string") {
      throw new Error("HTTP method must be a string");
    }

    const cookieStore = await cookies();
    const TOKEN = cookieStore.get("token")?.value;

    const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (response.status === 502) {
      redirect("/maintenance");
    }

    const retrievedData = await response.json();
    if (response.status === 401) {
      if (expireUserSession) await expireUserSession();
      return null;
    }
    return retrievedData;
  } catch (error) {
    // Rethrow Next.js navigation errors (redirect, notFound, etc.)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return error;
  }
}

export async function sendDataWithFormData(
  endpoint,
  formData,
  method = "POST",
  expireUserSession
) {
  try {
    if (typeof method !== "string") {
      throw new Error("HTTP method must be a string");
    }

    const cookieStore = await cookies();
    const TOKEN = cookieStore.get("token")?.value;

    const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: formData,
      cache: "no-store",
    });

    if (response.status === 502) {
      redirect("/maintenance");
    }

    const retrievedData = await response.json();
    if (response.status === 401) {
      if (expireUserSession) await expireUserSession();
      return retrievedData;
    }
    return retrievedData;
  } catch (error) {
    // Rethrow Next.js navigation errors (redirect, notFound, etc.)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return error;
  }
}


export async function uploadImage(file) {
  try {
    const data = new FormData();
    data.append("file", file)
    const response = await sendDataWithFormData("app/getPlanImageWeb", data);
    if (response.status_code !== 200) throw new Error(response.message)
    return response;
  } catch (error) {
    return error
  }
}

export async function streamResponse(endpoint, data) {
  try {
    const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response
  } catch (error) {
    return error;
  }
}

export async function sendUserInsight(userId, payload) {
  try {
    if (!userId) return
    await sendData(`app/users/actions?person=coach`, { userId, payload }, "PUT")
  } catch (error) { }
}