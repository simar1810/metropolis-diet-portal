"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  fetchData as fetchDataServer,
  sendData as sendDataServer
} from "@/lib/api";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

// Client-side API functions
const fetchData = async (endpoint) => {
  return fetchDataServer(endpoint)
  try {
    const TOKEN = Cookies.get("token");

    const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if ([408].includes(data.status_code)) {
      Cookies.remove("token");
      window.location.href = "/login";
      return;
    }

    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const sendData = async (...args) => { // ...args = {endpoint, data, method = "POST"}
  return sendDataServer(...args)
  try {
    const TOKEN = Cookies.get("token");

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

    const retrievedData = await response.json();
    return retrievedData;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const useWallet = () => {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet data
  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const balanceData = await fetchData("app/balance");
      const transactionsData = await fetchData("app/transactions");

      if (balanceData.success !== true) {
        throw new Error(
          balanceData.message || "Failed to fetch wallet balance"
        );
      }

      if (transactionsData.success !== true) {
        throw new Error(
          transactionsData.message || "Failed to fetch transactions"
        );
      }

      setBalance(balanceData.data?.balance || 0);


      // Ensure transactions is always an array
      const transactionsArray = Array.isArray(transactionsData.data)
        ? transactionsData.data
        : Array.isArray(transactionsData.data?.transactions)
          ? transactionsData.data.transactions
          : [];

      setTransactions(transactionsArray);
    } catch (err) {
      setError(err.message || "Failed to fetch wallet data");
      // Ensure transactions is always an array even on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Credit wallet
  const creditWallet = useCallback(
    async (amount, description) => {
      try {
        const response = await sendData("app/credit", {
          amount,
          description,
          type: "credit",
        });

        if (response.status_code !== 200) {
          throw new Error(response.message || "Failed to credit wallet");
        }

        // Refresh wallet data after successful credit
        await fetchWalletData();
        return { success: true, transaction: response.data };
      } catch (err) {
        setError(err.message || "Failed to credit wallet");
        return { success: false, error: err.message };
      }
    },
    [fetchWalletData]
  );

  // Debit wallet
  const debitWallet = useCallback(
    async (amount, description) => {
      try {
        const response = await sendData("app/debit", {
          amount,
          description,
          type: "debit",
        });

        if (response.status_code !== 200) {
          throw new Error(response.message || "Failed to debit wallet");
        }

        // Refresh wallet data after successful debit
        await fetchWalletData();
        return { success: true, transaction: response.data };
      } catch (err) {
        setError(err.message || "Failed to debit wallet");
        return { success: false, error: err.message };
      }
    },
    [fetchWalletData]
  );

  // Transfer to client
  const transferToClient = useCallback(
    async (clientId, amount, description) => {
      try {
        const response = await sendData("app/transfer", {
          clientId,
          amount,
          description,
          type: "transfer",
        });

        if (response.status_code !== 200) {
          throw new Error(response.message || "Failed to transfer to client");
        }

        // Refresh wallet data after successful transfer
        await fetchWalletData();
        return { success: true, transaction: response.data };
      } catch (err) {
        setError(err.message || "Failed to transfer to client");
        return { success: false, error: err.message };
      }
    },
    [fetchWalletData]
  );

  // Get wallet analytics
  const getWalletAnalytics = useCallback(async (period = "30d") => {
    try {
      const response = await fetchData(`app/analytics?period=${period}`);

      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to fetch analytics");
      }

      return response.data;
    } catch (err) {
      setError(err.message || "Failed to fetch analytics");
      return null;
    }
  }, []);

  // Get wallet settings
  const getWalletSettings = useCallback(async () => {
    try {
      const response = await fetchData("app/settings");

      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to fetch settings");
      }

      return response.data;
    } catch (err) {
      setError(err.message || "Failed to fetch settings");
      return null;
    }
  }, []);

  // Update wallet settings
  const updateWalletSettings = useCallback(async (settings) => {
    try {
      const response = await sendData("app/settings", settings, "PUT");

      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to update settings");
      }

      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || "Failed to update settings");
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchWalletData();

    // Auto-refresh wallet data every 30 seconds
    const interval = setInterval(() => {
      fetchWalletData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchWalletData]);

  return {
    balance,
    transactions,
    loading,
    error,
    creditWallet,
    debitWallet,
    transferToClient,
    getWalletAnalytics,
    getWalletSettings,
    updateWalletSettings,
    refreshData: fetchWalletData,
  };
};
