"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, User } from "lucide-react";
import { toast } from "sonner";
import { sendDataWithFormData } from "@/lib/api";

export default function EditUserModal({ open, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    password: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        userId: user.userId || "",
        password: ""
      });
      setPreview(user.profilePhoto || null);
    }
  }, [user]);

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
    setPreview(user.profilePhoto || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("id", user._id);
      submitData.append("name", formData.name);
      submitData.append("userId", formData.userId);

      if (formData.password) {
        submitData.append("password", formData.password);
      }

      if (selectedFile) {
        submitData.append("file", selectedFile);
      }

      const response = await sendDataWithFormData("app/users?person=coach", submitData, "PUT");

      if (response.status_code === 200) {
        toast.success("User updated successfully!");
        onSuccess();
        resetForm();
      } else {
        throw new Error(response.message || "Failed to update user");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update user");
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter user's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">User ID *</Label>
            <Input
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              placeholder="Enter unique user ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password (Leave blank to keep current)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="space-y-3">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeFile}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload new profile photo</p>
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
                    >
                      Choose File
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90"
            >
              {loading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
