'use client';

import React, { useEffect, useState } from "react";
import AuthProvider from "../providers/AuthProvider";
import MainTitle from "../../components/layout/MainTitle";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { getUserDetails, logout } from "../../actions/auth"; // Consolidated imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

export default function AdminLayout({ children }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleContinue = async () => {
    const user = await getUserDetails();
    if (user?.roleId === 1) {
      window.location.replace('/user/myjobs');
    } else if (user?.roleId === 2) {
      if (user.SubscriptionType === "Deactivate") {
        window.location.replace('/tradesperson/subscription');
      } else {
        window.location.replace('/tradesperson/home');
      }
    }
  };

  const handleLogout = async () => {
    logout();
    setShowPopup(false);
  };

  useEffect(() => {
    const validateUser = async () => {
      const user = await getUserDetails();
      if (user?.roleId) {
        setShowPopup(true);
      }
    };
    validateUser();
  }, []);

  return (
    <AuthProvider>
      <div className="main-container">
        {/* Dialog Popup */}
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <>
            <DialogContent>
              <DialogHeader>
                <div className="flex flex-col text-center">
                  <DialogTitle className="text-2xl">
                    <span> You’re already logged in</span>
                  </DialogTitle>
                  <DialogDescription className="text-sm font-bold">
                    Either you are looking to post a free job or sign up as a tradesperson please sign out first.
                  </DialogDescription>
                  <div className="flex gap-2 mt-4 space-y-4">
                    <button
                      type="button"
                      onClick={() => { handleLogout() }}
                      className="mt-4 bg-neutral-300 w-full text-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                    >
                      Sign out
                    </button>
                    <button
                      type="button"
                      onClick={() => { handleContinue() }}
                      className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                    >
                      Stay here
                    </button>
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </>
        </Dialog>

        {/* Main Content */}
        <div>
          <MainTitle />
          <Navbar />
        </div>
        <div className="my-auto">
          {children}
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
