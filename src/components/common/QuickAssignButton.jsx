"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Loader2, 
  Search, 
  Users 
} from "lucide-react";
import { toast } from "sonner";
import { getAvailableClients, assignClientsToUser } from "@/lib/fetchers/app";

export default function QuickAssignButton({ 
  userId, 
  onSuccess, 
  className = "",
  variant = "default",
  size = "default",
  children = "Quick Assign"
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableClients();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const debounceTimer = setTimeout(() => {
        fetchAvailableClients(searchTerm);
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      fetchAvailableClients();
    }
  }, [searchTerm]);

  const fetchAvailableClients = async (search = "") => {
    try {
      setLoadingClients(true);
      const response = await getAvailableClients(1, 1000, search);
      if (response.status_code === 200) {
        setAvailableClients(response.data.clients || []);
      }
    } catch (error) {
      console.error("Error fetching available clients:", error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClients(prev => {
      const isSelected = prev.some(c => c._id === client._id);
      if (isSelected) {
        return prev.filter(c => c._id !== client._id);
      } else {
        return [...prev, client];
      }
    });
  };

  const handleAssign = async () => {
    if (selectedClients.length === 0) {
      toast.error("Please select at least one client");
      return;
    }

    try {
      setLoading(true);
      const clientIds = selectedClients.map(client => client._id);
      const response = await assignClientsToUser(userId, clientIds);
      
      if (response.status_code === 200) {
        toast.success(`Successfully assigned ${selectedClients.length} client(s)`);
        setSelectedClients([]);
        setSearchTerm("");
        setOpen(false);
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

  const handleClose = () => {
    setSelectedClients([]);
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {children}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Quick Assign Clients</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Count */}
          {selectedClients.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{selectedClients.length} selected</Badge>
            </div>
          )}

          {/* Clients List */}
          <div className="border rounded-lg h-[300px] overflow-y-auto">
            {loadingClients ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {availableClients.map((client) => {
                  const isSelected = selectedClients.some(sc => sc._id === client._id);
                  
                  return (
                    <div
                      key={client._id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleClientSelect(client)}
                      />
                      
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client.profilePhoto} />
                        <AvatarFallback>
                          {client.name?.charAt(0)?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {client.email || client.mobileNumber || client.clientId}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {availableClients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No clients found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={loading || selectedClients.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign {selectedClients.length} Client(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
