"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Users,
  UserPlus,
  UserMinus,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  getAvailableClients,
  getUserClients,
  assignClientsToUser,
  addClientToUser,
  removeClientFromUser
} from "@/lib/fetchers/app";

export default function UserClientAssignmentModal({ open, onClose, user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableClients, setAvailableClients] = useState([]);
  const [userClients, setUserClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUserClients();
      fetchAvailableClients();
    }
  }, [open, user]);

  useEffect(() => {
    if (searchTerm) {
      const debounceTimer = setTimeout(() => {
        fetchAvailableClients(1, searchTerm);
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      fetchAvailableClients();
    }
  }, [searchTerm]);

  const fetchUserClients = async () => {
    try {
      setLoadingClients(true);
      const response = await getUserClients(user._id);
      if (response.status_code === 200) {
        setUserClients(response.data.clients || []);
      }
    } catch (error) { } finally {
      setLoadingClients(false);
    }
  };

  const fetchAvailableClients = async (page = 1, search = "") => {
    try {
      setLoadingClients(true);
      const response = await getAvailableClients(page, 1000, search);
      if (response.status_code === 200) {
        setAvailableClients(response.data.clients || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      // Error handling
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

  const handleAssignClients = async () => {
    if (selectedClients.length === 0) {
      toast.error("Please select at least one client to assign");
      return;
    }

    try {
      setLoading(true);
      const clientIds = selectedClients.map(client => client._id);
      const response = await assignClientsToUser(user._id, clientIds);

      if (response.status_code === 200) {
        toast.success(`Successfully assigned ${selectedClients.length} client(s) to ${user.name}`);
        setSelectedClients([]);
        fetchUserClients();
        fetchAvailableClients();
        onSuccess?.();
      } else {
        throw new Error(response.message || "Failed to assign clients");
      }
    } catch (error) {
      toast.error(error.message || "Failed to assign clients");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClient = async (client) => {
    try {
      setLoading(true);
      const response = await removeClientFromUser(user._id, client._id);

      if (response.status_code === 200) {
        toast.success(`Removed ${client.name} from ${user.name}`);
        fetchUserClients();
        fetchAvailableClients();
        onSuccess?.();
      } else {
        throw new Error(response.message || "Failed to remove client");
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove client");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedClients([]);
    setSearchTerm("");
    setCurrentPage(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[800px] w-full h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Manage Clients for {user?.name}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Assign or remove clients for this user
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          <div className="space-y-4 flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">Available Clients</h3>
              <Badge variant="outline">{selectedClients.length} selected</Badge>
            </div>

            <div className="space-y-3 flex flex-col flex-1 min-h-0">
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg flex-1 overflow-y-auto min-h-[300px] max-h-[400px] custom-scrollbar">
                {loadingClients ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {availableClients.map((client) => {
                      const isAssigned = userClients.some(uc => uc._id === client._id);
                      const isSelected = selectedClients.some(sc => sc._id === client._id);

                      return (
                        <label
                          key={client._id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${isAssigned
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : isSelected
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isAssigned}
                            onCheckedChange={() => handleClientSelect(client)}
                          />

                          <Avatar className="h-10 w-10">
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

                          {isAssigned && (
                            <Badge variant="secondary" className="text-xs">
                              Assigned
                            </Badge>
                          )}
                        </label>
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
            </div>
          </div>

          <div className="space-y-4 flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">Assigned Clients</h3>
              <Badge variant="outline">{userClients.length} assigned</Badge>
            </div>

            <div className="border rounded-lg flex-1 overflow-y-auto min-h-[300px] max-h-[400px] custom-scrollbar">
              {loadingClients ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {userClients.map((client) => (
                    <div
                      key={client._id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white"
                    >
                      <Avatar className="h-10 w-10">
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

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveClient(client)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {userClients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No clients assigned</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {selectedClients.length > 0 && (
              <span>{selectedClients.length} client(s) selected for assignment</span>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignClients}
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
