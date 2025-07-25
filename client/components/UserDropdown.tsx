import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  Package,
  Settings,
  ChevronDown,
  LogIn,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthService, type UserProfile } from "@/lib/authService";
import { AdminService } from "@/lib/adminService";
import { LoginModal } from "./LoginModal";

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setUserProfile(user);

      // Check if user is admin
      if (user) {
        const adminStatus = await AdminService.isCurrentUserAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setUserProfile(null);
      setIsOpen(false);
      alert("Logged out successfully!");
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLoginSuccess = () => {
    loadCurrentUser();
    setShowLoginModal(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <User className="h-5 w-5" />
          {userProfile ? (
            <span className="hidden sm:inline text-sm">
              {userProfile.firstName}
            </span>
          ) : (
            <span className="hidden sm:inline text-sm">Account</span>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {userProfile ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userProfile.firstName} {userProfile.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {userProfile.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      Order History
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>

                    {/* Admin Dashboard Link - Only show for admin users */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors border-t border-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Not authenticated - show login option */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-600">
                      Welcome to SZN by Ondieki
                    </p>
                    <p className="text-xs text-gray-500">
                      Sign in to access your account
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In / Sign Up
                    </button>

                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
