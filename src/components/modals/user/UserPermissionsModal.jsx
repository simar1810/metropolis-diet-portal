"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { sendData } from "@/lib/api";

// Define available permissions with their descriptions
const AVAILABLE_PERMISSIONS = [
  { id: 1, name: "Meal Plans", description: "View and manage meal plans" },
  { id: 2, name: "Feed", description: "View and manage feed content" },
  { id: 3, name: "Wallet", description: "View wallet and payment features" },
  { id: 4, name: "Retail", description: "View retail orders and products" },
  { id: 5, name: "Chats", description: "Access chat and messaging features" },
  { id: 6, name: "Workouts", description: "View and manage workout plans" },
  { id: 7, name: "Marathon", description: "View marathon tasks and progress" },
  { id: 8, name: "Club", description: "View club activities and members" }
];

export default function UserPermissionsModal({ open, onClose, user, onSuccess }) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissions || []);
    }
  }, [user]);

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("No user selected");
      return;
    }

    try {
      setLoading(true);
      
      const response = await sendData("app/users/permissions", {
        id: user._id,
        permissions: selectedPermissions
      }, "PUT");
      
      if (response.status_code === 200) {
        toast.success("User permissions updated successfully!");
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Failed to update permissions");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPermissions([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage User Permissions</DialogTitle>
          {user && (
            <p className="text-sm text-gray-600">
              Setting permissions for: <strong>{user.name}</strong> ({user.userId})
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Available Permissions</Label>
            <div className="grid gap-3">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <Card key={permission.id} className="p-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.id, checked)
                      }
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90"
            >
              {loading ? "Updating..." : "Update Permissions"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
