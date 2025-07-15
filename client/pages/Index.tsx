import { useEffect, useState } from "react";
import { UserService, type User } from "@/lib/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Users, Database } from "lucide-react";

export default function Index() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await UserService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) return;

    setIsAddingUser(true);
    try {
      await UserService.createUser(newUser);
      setNewUser({ name: "", email: "" });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await UserService.deleteUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Firebase User Data App
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            A modern app powered by Firebase Firestore for user data storage.
            Create, view, and manage users in real-time.
          </p>
        </div>

        {/* Add User Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="flex-1"
              />
              <Input
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="flex-1"
              />
              <Button
                onClick={handleCreateUser}
                disabled={isAddingUser || !newUser.name || !newUser.email}
                className="whitespace-nowrap"
              >
                {isAddingUser ? "Adding..." : "Add User"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({users.length})
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={loading}
                className="ml-auto"
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && users.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 mx-auto mb-4 text-slate-400">
                  <Database className="h-8 w-8" />
                </div>
                <p className="text-slate-600">Loading users from Firebase...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-2">No users found</p>
                <p className="text-sm text-slate-500">
                  Add your first user using the form above
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {user.name}
                      </h3>
                      <p className="text-slate-600 text-sm">{user.email}</p>
                      {user.createdAt && (
                        <p className="text-xs text-slate-500 mt-1">
                          Created:{" "}
                          {new Date(
                            user.createdAt.seconds * 1000,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        ID: {user.id?.slice(-6)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => user.id && handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Firebase Setup Instructions */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🔧 Firebase Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700">
            <p className="mb-2">To connect to your Firebase project:</p>
            <ol className="list-decimal list-inside space-y-1 mb-4">
              <li>
                Create a new Firebase project at console.firebase.google.com
              </li>
              <li>Enable Firestore Database in your project</li>
              <li>
                Copy your config from Project Settings → General → Your apps
              </li>
              <li>Create a .env file and add your Firebase config variables</li>
              <li>Update client/lib/firebase.ts with your configuration</li>
            </ol>
            <p className="text-xs">
              See .env.example for the required environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
