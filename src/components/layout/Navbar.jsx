"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Logomark from "./Logomark";
import { getUserDetails, logout } from "../../actions/auth";
import ThemeToggle from "../ui/theme-toggle";
import { Button } from "../ui/button";
import { useGlobalState } from '../../app/context/GlobalStateContext';
const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const { emailFlag, setEmailFlag } = useGlobalState();
  useEffect(() => {
    // Check if the user is logged in when the component mounts
    const fetchUserDetails = async () => {
      const user = await getUserDetails();
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.name || "User");
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchUserDetails();
  });

  const navigateLogin = async () => {
    try {
      const isDeleted = await caches.delete("job-cache");
    } catch (err) { }

    const emailTradeperson = emailFlag;
    if (emailTradeperson) {
    }
    if (true) {
      if (pathname == "/login") {
        window.location.reload();
      } else {
        router.push("/login"); // Navigate to the login page
      }
    }
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <div className="flex items-center">
          <Link href={"/"}>
            <Logomark className="h-8 w-8" />
          </Link>
        </div>
        <div className="hidden md:flex space-x-4">
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
          <Link
            href="/login/join-tradesperson"
            className="font-semibold text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm transition-colors"
          >
            Join as a Tradesperson
          </Link>
          <Link
            href="/login/hire-tradesperson"
            className="bg-accent hover:bg-accent/90 shadow-soft hover:shadow-soft-md transition-all font-semibold text-accent-foreground px-6 py-2 rounded-md text-sm"
          >
            Hire Tradesperson
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              navigateLogin();
            }}
            className="font-semibold px-3 py-2 text-sm"
          >
            Log In
          </Button>
        </div>
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground/70 hover:text-foreground focus:outline-none"
          >
            <Menu />
          </button>
        </div>
      </div>

      <div
        className={`fixed z-20 top-16 right-0 h-full w-full bg-background shadow-soft-lg transform ${isOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="text-foreground font-semibold flex hover:text-foreground/70 focus:outline-none absolute top-4 right-4"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="mt-10 space-y-1">
          <Link
            href="/login/hire-tradesperson"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 font-semibold text-base text-foreground hover:bg-muted rounded-md mx-2"
          >
            Post a Job for Free
          </Link>
          <Link
            href="/login/join-tradesperson"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 font-semibold text-base text-foreground hover:bg-muted rounded-md mx-2"
          >
            Tradesperson Sign up
          </Link>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 font-semibold text-base text-foreground hover:bg-muted rounded-md mx-2"
          >
            Log In
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
