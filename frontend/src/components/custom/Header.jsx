import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import GoogleSignInDialog from "@/pages/Googledialog"; // Adjust path as needed
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Check for user in localStorage on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [openDialog]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleAuthClick = () => {
    if (user) {
      handleSignOut();
    } else {
      setOpenDialog(true);
    }
  };

  // Update user state when sign-in is successful
  const handleSignInSuccess = (userData) => {
    setUser(userData);
    setOpenDialog(false);
  };

  return (
    <>
      <div className="p-2 shadow-sm flex justify-between items-center px-5">
        <img src="/logo.svg" alt="Logo" className="w-20 h-10 shadow-sm" />
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          )}
          <Button
            onClick={handleAuthClick}
            variant={user ? "destructive" : "default"}
          >
            {user ? "Sign out" : "Sign in"}
          </Button>
        </div>
      </div>

      <GoogleSignInDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSignInSuccess={handleSignInSuccess}
      />
    </>
  );
}

export default Header;
