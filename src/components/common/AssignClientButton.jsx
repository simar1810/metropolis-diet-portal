"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { assignClientsToUser } from "@/lib/fetchers/app";

export default function AssignClientButton({ 
  userId, 
  clientIds, 
  onSuccess, 
  className = "",
  variant = "default",
  size = "default",
  children = "Assign Clients"
}) {
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!userId) {
      toast.error("User ID is required");
      return;
    }

    if (!clientIds || clientIds.length === 0) {
      toast.error("Please select at least one client");
      return;
    }

    try {
      setLoading(true);
      const response = await assignClientsToUser(userId, clientIds);
      
      if (response.status_code === 200) {
        toast.success(`Successfully assigned ${clientIds.length} client(s)`);
        onSuccess?.(response);
      } else {
        throw new Error(response.message || "Failed to assign clients");
      }
    } catch (error) {
      toast.error(error.message || "Failed to assign clients");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAssign}
      disabled={loading || !userId || !clientIds || clientIds.length === 0}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Assigning...
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}
