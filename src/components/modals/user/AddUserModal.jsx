"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  X,
  User,
  Soup,
  Newspaper,
  CircleDollarSign,
  Dumbbell,
  Store,
  Footprints,
  LayoutDashboard,
  Bot,
  FileText,
  FolderOpen,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { sendDataWithFormData, sendData, fetchData } from "@/lib/api";
import { createUser } from "@/lib/fetchers/app";

// Define available permissions with their descriptions and icons
const AVAILABLE_PERMISSIONS = [
  { id: 1, name: "Meal Plans", description: "Access to meals and recipes", icon: Soup, color: "text-orange-500" },
  { id: 2, name: "Feed", description: "Access to feed and news", icon: Newspaper, color: "text-blue-500" },
  { id: 3, name: "Wallet", description: "Access to wallet and payments", icon: CircleDollarSign, color: "text-green-500" },
  { id: 4, name: "Retail", description: "Access to retail products", icon: Store, color: "text-pink-500" },
  { id: 5, name: "Chats", description: "Access to chat and messaging", icon: MessageCircle, color: "text-purple-500" },
  { id: 6, name: "Workout", description: "Access to workout plans", icon: Dumbbell, color: "text-purple-500" },
  { id: 7, name: "Marathon", description: "Access to marathon features", icon: Footprints, color: "text-red-500" },
  { id: 8, name: "Club", description: "Access to club activities", icon: LayoutDashboard, color: "text-indigo-500" }
];

// Group permissions by category for tab organization
const PERMISSION_CATEGORIES = {
  "Core Features": [1, 2, 3], // Meal Plans, Feed, Wallet
  "Business & Tools": [4, 5], // Retail, Chats
  "Fitness & Health": [6, 7], // Workout, Marathon
  "Community": [8] // Club
};

export default function AddUserModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    password: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState("Core Features");

  const handleTabChange = useCallback((category) => {
    if (activeTab !== category) {
      setActiveTab(category);
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handlePermissionChange = useCallback((permissionId, checked) => {
    setSelectedPermissions(prev => {
      if (checked) {
        if (!prev.includes(permissionId)) {
          return [...prev, permissionId];
        }
      } else {
        if (prev.includes(permissionId)) {
          return prev.filter(id => id !== permissionId);
        }
      }
      return prev;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.userId || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // if (!selectedFile) {
    //   toast.error("Image is required");
    //   return;
    // }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("userId", formData.userId);
      submitData.append("password", formData.password);
      submitData.append("permissions", JSON.stringify(selectedPermissions));
      if (selectedFile) submitData.append("file", selectedFile);

      const response = await sendDataWithFormData("app/users", submitData, "POST");

      if (response.status_code === 200) {
        if (selectedPermissions.length > 0) {
          try {
            if (response.data && response.data._id) {
              const permissionsData = {
                id: response.data._id,
                permissions: selectedPermissions
              };
              await sendData("app/users/permissions", permissionsData, "PUT");
            }
          } catch (permissionsError) {
            // Don't fail the entire request if permissions update fails
          }
        }

        toast.success("User created successfully!");
        onSuccess();
        resetForm();
      } else {
        throw new Error(response.message || "Failed to create user");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      userId: "",
      password: ""
    });
    setSelectedFile(null);
    setPreview(null);
    setSelectedPermissions([]);
    setActiveTab("Core Features");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent key="add-user-modal" className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New User</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Create a new user account with specific permissions</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter user's full name"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm font-medium text-gray-700">User ID *</Label>
                <Input
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Enter unique user ID"
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter secure password"
                className="h-10"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 border-b pb-2 flex-1">Access Permissions</h3>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {selectedPermissions.length} selected
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg mb-4">
                {Object.keys(PERMISSION_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleTabChange(category)}
                    className={`text-xs font-medium py-2 px-3 rounded-md transition-all duration-200 ${activeTab === category
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, permissionIds]) => (
                  <div
                    key={category}
                    className={`grid grid-cols-1 gap-3 ${activeTab === category ? 'block' : 'hidden'}`}
                  >
                    {permissionIds.map((permissionId) => {
                      const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
                      const IconComponent = permission.icon;
                      const isSelected = selectedPermissions.includes(permission.id);

                      return (
                        <div
                          key={permission.id}
                          className={`relative flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                            ? 'border-blue-200 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                            <IconComponent className={`w-5 h-5 ${permission.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <Label
                                htmlFor={`permission-${permission.id}`}
                                className="text-sm font-semibold text-gray-900 cursor-pointer"
                              >
                                {permission.name}
                              </Label>
                              {isSelected && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {permission.description}
                            </p>
                          </div>

                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                            className="flex-shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Select the features this user can access. Leave empty for no access.</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Profile Photo</h3>

            <div className="flex items-center space-x-4">
              {preview ? (
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeFile}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload').click()}
                  className="h-9"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {preview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-10 px-6"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
