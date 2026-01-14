"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/fetchers/app";

export default function UserLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser({ username, password });

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("userData", JSON.stringify(result.data));
      localStorage.setItem("userType", "coach");
      toast.success(result.message);
      router.push("/coach/clients");
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md md:mx-auto md:p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="w-6 h-6" />
            Login
          </CardTitle>
          <p className="text-gray-600 text-sm">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
