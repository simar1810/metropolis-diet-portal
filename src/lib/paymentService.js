"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

// Helper function to get token
const getToken = async () => {
  const cookieStore = await cookies();
  const TOKEN = cookieStore.get("token")?.value;

  if (!TOKEN) {
    throw new Error("No authentication token found");
  }

  return TOKEN;
};

// Create payment link with integrated AI
export async function createPaymentLink(paymentData) {
  try {
    const TOKEN = await getToken();

    const response = await fetch(`${API_ENDPOINT}/app/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create payment link",
    };
  }
}

// Get payment list
export async function getPayments(filters = {}) {
  try {
    const TOKEN = await getToken();

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(
      `${API_ENDPOINT}/app/payment/getpayments?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        status_code: response.status,
        message: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch payments",
    };
  }
}

// Send payment reminder with integrated AI
export async function sendPaymentReminder(paymentId, tone = "friendly") {
  try {
    const TOKEN = await getToken();

    const response = await fetch(
      `${API_ENDPOINT}/app/payment/${paymentId}/remind`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ tone }),
      }
    );

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to send reminder",
    };
  }
}

// Regenerate payment link
export async function regeneratePaymentLink(paymentId) {
  try {
    const TOKEN = await getToken();

    const response = await fetch(
      `${API_ENDPOINT}/app/payment/${paymentId}/regenerate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to regenerate payment link",
    };
  }
}

// Get vouchers
export async function getVouchers() {
  try {
    const TOKEN = await getToken();

    const response = await fetch(`${API_ENDPOINT}/app/vouchers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      return {
        success: false,
        status_code: response.status,
        message: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch vouchers",
    };
  }
}

// Create voucher
export async function createVoucher(voucherData) {
  try {
    const TOKEN = await getToken();

    const response = await fetch(`${API_ENDPOINT}/app/vouchers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(voucherData),
    });

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to create voucher",
    };
  }
}

// Update voucher
export async function updateVoucher(voucherId, voucherData) {
  try {
    const TOKEN = await getToken();

    const response = await fetch(`${API_ENDPOINT}/app/vouchers/${voucherId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(voucherData),
    });

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to update voucher",
    };
  }
}

// Delete voucher
export async function deleteVoucher(voucherId) {
  try {
    const TOKEN = await getToken();

    const response = await fetch(`${API_ENDPOINT}/app/vouchers/${voucherId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to delete voucher",
    };
  }
}

// Get voucher analytics
export async function getVoucherAnalytics() {
  try {
    const TOKEN = await getToken();

    const response = await fetch(`${API_ENDPOINT}/app/vouchers/analytics`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const data = await response.json();

    if (data.status_code === 408) {
      const cookieStore = await cookies();
      cookieStore.delete("token");
      redirect("/login");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch voucher analytics",
    };
  }
}
