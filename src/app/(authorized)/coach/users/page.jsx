"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Search, UserPlus, Settings, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { nameInitials } from "@/lib/formatter";
import AddUserModal from "@/components/modals/user/AddUserModal";
import EditUserModal from "@/components/modals/user/EditUserModal";
import UserPermissionsModal from "@/components/modals/user/UserPermissionsModal";
import UserClientAssignmentModal from "@/components/modals/user/UserClientAssignmentModal";
import { getUsers } from "@/lib/fetchers/app";
import { isCoach } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/providers/global/hooks";
import { Switch } from "@/components/ui/switch";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { mutate } from "swr";

export default function UsersPage() {
  const router = useRouter();
  const coach = useAppSelector(state => state.coach.data);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showClientAssignmentModal, setShowClientAssignmentModal] = useState(false);

  useEffect(() => {
    if (!isCoach()) {
      router.push("/coach/dashboard");
      return;
    }

    if (coach?._id) {
      fetchUsers();
    }
  }, [router, coach?._id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Pass the current coach's ID to filter users
      const coachId = coach?._id;
      const response = await getUsers(coachId);
      if (response.status_code === 200) {
        setUsers(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await sendData("app/users", { id: userId }, "DELETE");
      if (response.status_code === 200) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        throw new Error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <ContentLoader />;

  return (
    <div className="content-container content-height-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-base md:text-2xl font-bold text-gray-900 mb-2">Users Management</h1>
          <p className="text-xs md:text-base text-gray-600">Manage your users and their accounts</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <ContentError title="No users found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0 md:pb-3">
                <div className="flex flex-col md:flex-row gap-4 md:gap-1 items-start md:items-center justify-center md:justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePhoto} />
                      <AvatarFallback>{nameInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name || "No Name"}</CardTitle>
                      <p className="text-sm text-gray-600">ID: {user.userId}</p>
                    </div>
                  </div>
                  <div className="flex md:space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowClientAssignmentModal(true);
                      }}
                      title="Manage Clients"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPermissionsModal(true);
                      }}
                      title="Manage Permissions"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user.profilePhoto && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profile:</span>
                      <Badge variant="secondary">Has Photo</Badge>
                    </div>
                  )}
                  {user.permissions && user.permissions.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Permissions:</span>
                      <Badge variant="outline">{user.permissions.length} assigned</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <UpdateUserStatus
                  userId={user._id}
                  status={user.isActive}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddUserModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}

      {showPermissionsModal && selectedUser && (
        <UserPermissionsModal
          open={showPermissionsModal}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            setShowPermissionsModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}

      {showClientAssignmentModal && selectedUser && (
        <UserClientAssignmentModal
          open={showClientAssignmentModal}
          onClose={() => {
            setShowClientAssignmentModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            setShowClientAssignmentModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

function UpdateUserStatus({ userId, status = true }) {
  const triggerRef = useRef()
  async function udpateUserStatus(setLoading) {
    try {
      setLoading(true);
      const response = await sendData(
        "app/users/actions",
        { userId, status: !Boolean(status) },
        "PATCH"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure? You are changing the status of user!"
    action={(setLoading, btnRef) => udpateUserStatus(setLoading, btnRef)}
  >
    <Switch
      checked={status}
      onCheckedChange={() => triggerRef.current.click()}
    />
    <AlertDialogTrigger ref={triggerRef} />
  </DualOptionActionModal>
}