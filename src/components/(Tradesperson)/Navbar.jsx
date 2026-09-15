"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidNumber, parsePhoneNumber } from "libphonenumber-js";
import CheckImage from "./../../app/assets/varified.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { Menu } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import Notification from "../../components/(Tradesperson)/Notification";
import Image from "next/image";
import Logomark from "../layout/Logomark";
import { getUserDetails, logout } from "../../actions/auth";
import { useRouter } from "next/navigation";
import Spinner from "../Spinner";
import bcrypt from "bcryptjs";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import EmailChangeDialog from "../EmailChangeDialog";
import * as Sentry from '@sentry/nextjs';
import ThemeToggle from "../ui/theme-toggle";

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenmin, setIsOpenmin] = useState(false);
  const [isOpenplan, setIsOpenplan] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState();
  const [users, setUser] = useState();
  const [userProfile, setUserProfile] = useState();
  const [userPhone, setUserphone] = useState();
  const [userSubscription, setUserSubscription] = useState("...");
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [showFinalPopupMessage, setShowFinalPopupMessage] = useState("");
  const [SubscriptionType, SetSubscriptionType] = useState("");
  const [Email, setEmail] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isCrossClicked, setIsCrossClicked] = useState(false); // New state
  const handleCloseEmailDialog = () => {
    setShowEmailDialog(false);
    setIsCrossClicked(true); // Set to true only when the cross button is clicked
  };

  const getUserUsingId = async (id) => {
    const jwtuser = await getUserDetails();
    try {
      const response = await fetch("/api/get-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtuser?.token}`,
        },
        body: JSON.stringify({ id: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {
        if (data.user.SubscriptionType.type == "Deactivate") {
          if (data.user.phone == null) {
            redirect(`/user/addphone`);
          } else {
            router.push("/tradesperson/subscription");
          }

          //router.push('/tradesperson/subscription')
        }
        SetSubscriptionType(data.user.SubscriptionType.type);
        setUserProfile(data.user.profileUrl);
        setUserphone(data.user.phone);
        setUserSubscription(data.user.type);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    // Check if the user is logged in when the component mounts
    const fetchUserDetails = async () => {
      const userDetails = await getUserDetails();
      if (userDetails) {
        setIsLoggedIn(true);
        setUserId(userDetails.id);
        if (userDetails.id) {
          getUserUsingId(userDetails.id);
        }
        setUser(userDetails);
        setUserName(userDetails.name || "User");
      } else {
      }
    };
    fetchUserDetails();
  }, []); // Dependency array ensures this runs only once when the component mounts

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await logout();
    setIsLoggedIn(false);
  };

  const [counter, setCounter] = useState(60);
  const [OtpError, setOtpError] = useState("");
  const [otp, setOtp] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [canVarify, setCanVarify] = useState(false);
  const [isVarify, setIsVarify] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resandLoading, setResandLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("gb");
  const otpSentRef = useRef(true);

  function isValidPhoneNumber(number, countryCode) {
    try {
      const phoneNumber = parsePhoneNumber(number, countryCode.toUpperCase());
      return phoneNumber.isValid();
    } catch (error) {
      return false;
    }
  }

  // Function to close the dialog
  const closeDialog = () => {
    setShowPhoneDialog(false);
    setShowOTPDialog(false);
    setDialogError("");
    setOtp("");
    setPhoneNumber("");
  };

  const sendOTP = async () => {
    setLoading(true);
    setResandLoading(true);
    const user = await getUserDetails();
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}` }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setGeneratedCode(result.otp);
      setCanResend(false); // Disable resend button immediately
      setCounter(60); // Reset counter
      otpSentRef.current = true; // Mark OTP as sent
    } catch (error) {
      Sentry.captureException("Error sending OTP:", error);
      setOtpError("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
      setResandLoading(false);
    }
  };
  const verifyOtp = async () => {
    const jwt = await getUserDetails();
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}`, otp }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setOtpError('');
      return { status: 200 };
    } catch (error) {
      Sentry.captureException('Error verifying OTP:', error);
      setOtpError('Invalid OTP. Please try again.');
      return { status: 400 };
    }
  };
  // Function to handle phone number submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber == "" || phoneNumber == undefined) {
      setDialogError("Please Enter Phone Number.");
      return;
    } else if (!isValidPhoneNumber(phoneNumber, selectedCountry)) {
      setDialogError("Number is Not Valid.");
      return;
    } else {
      setDialogError("");
    }

    setLoading(true);
    setTimeout(async () => {
      await sendOTP();
      setLoading(false);
      openOTPModal(); // Close the dialog after sending otp
    }, 2000);
  };

  const openOTPModal = () => {
    setShowOTPDialog(true);
    setShowPhoneDialog(false);
  };

  const varifyPhone = async (otp) => {
    setLoading(true);
    const user = await getUserDetails();
    try {
      const verifyResponse = await verifyOtp(); // This should call your API
      setOtpError(''); // Clear any previous errors

      if (verifyResponse?.status === 200) {
        const response = await fetch("/api/update-number", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ userId: user?.id, phoneNumber }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setOtpError(result.message);
        } else {
          setIsVarify(true);
          setTimeout(() => {
            window.location.reload();
            setShowOTPDialog(false);
          }, 2000);
        }
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }

    } catch (error) {
      setOtpError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const resendCode = useCallback(async () => {
    if (canResend) {
      await sendOTP();
      setOtp("");
      setCanResend(false); // Disable resend button immediately
      setCounter(60); // Reset counter
      setOtpError(""); // Clear previous errors
    }
  }, [canResend]);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [counter]);

  useEffect(() => {
    if (otp.length === 6) {
      setCanVarify(true);
    } else {
      setCanVarify(false);
      setOtpError("");
    }
  }, [otp]);

  const [userIdp, setUserIdP] = useState("");
  const [userData, setUserData] = useState({});
  const [pwdDefault, setPwdDefault] = useState(false);
  const [loadingp, setLoadingp] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [dialoagError, setDialoagError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserDetails();
      const effectiveUserId = user?.id;
      setUserIdP(effectiveUserId);
      if (!effectiveUserId) return;

      try {
        const response = await fetch("/api/get-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ id: effectiveUserId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
          setUserPassword(data.user.password);
          const isDefault = await bcrypt.compare("00000", data.user.password);
          setPwdDefault(isDefault);
        }
      } catch (error) {
        Sentry.captureException("Error fetching user data:", error);
      }
    };

    getUser();
  }, [userIdp]);

  const handleCreatePassword = async () => {
    const user = await getUserDetails();
    const effectiveUserId = user?.id;
    if (!effectiveUserId) return;
    if (newPassword == "00000") {
      setDialoagError("You can not set 00000 password try some different.");
      return;
    }
    if (newPassword.length < 5) {
      setDialoagError("Password is to short.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setDialoagError("Password do not match.");
    } else {
      setLoadingp(true);
      try {
        const response = await fetch("/api/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            userId: effectiveUserId,
            currentPassword: "00000",
            newPassword: newPassword,
          }),
        });

        if (!response.ok) {
          setLoadingp(false);
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.success) {
          setShowCreateDialog(false);
          setShowChangeDialog(false);
          setShowFinalPopup(true);
          setShowFinalPopupMessage(
            "Your password has been created successfully."
          );
          setLoadingp(false);
        }
      } catch (error) {
        setLoadingp(false);
        setDialoagError(error.message);
      }
    }
  };

  const handleChangePassword = async () => {
    const user = await getUserDetails();
    const effectiveUserId = user?.id;
    if (!effectiveUserId) return;
    if (newPassword == "00000") {
      setDialoagError("You can not set 00000 password try some different.");
      return;
    }
    if (newPassword.length < 5) {
      setDialoagError("Password is to short.");
      return;
    }
    const compare = await bcrypt.compare(newPassword, userPassword);
    if (compare) {
      setDialoagError("This Password is alredy set.");
      return;
    }
    const currentMatch = await bcrypt.compare(currentPassword, userPassword);
    if (!currentMatch) {
      setDialoagError("Current Password is not valid.");
    } else if (newPassword !== confirmPassword) {
      setDialoagError("Password do not match.");
    } else {
      setLoadingp(true);
      try {
        const response = await fetch("/api/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            userId: effectiveUserId,
            currentPassword: currentPassword,
            newPassword: newPassword,
          }),
        });

        if (!response.ok) {
          setLoadingp(false);
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.success) {
          setShowCreateDialog(false);
          setShowChangeDialog(false);
          setShowFinalPopup(true);
          setShowFinalPopupMessage(
            "Your password has been changed successfully."
          );
          setLoadingp(false);
        }
      } catch (error) {
        setLoadingp(false);
        setDialoagError(error.message);
      }
    }
  };

  const closeDialogpwd = () => {
    setShowCreateDialog(false);
    setShowChangeDialog(false);
  };

  const handleMouseEnter = () => {
    setIsOpenmin(true);
  };

  const handleMouseLeave = () => {
    setIsOpenmin(false);
  };

  const handleClick = () => {
    setIsOpenmin((prev) => !prev); // Toggle on click
  };
  const handleMouseEnterplan = () => {
    setIsOpenplan(true);
  };

  const handleMouseLeaveplan = () => {
    setIsOpenplan(false);
  };

  const handleClickplan = () => {
    setIsOpenplan((prev) => !prev); // Toggle on click
  };
  const [isLoading, SetISLoading] = useState(false);

  const manageSubs = async () => {
    const user = await getUserDetails();
    SetISLoading(true);
    try {
      const response = await fetch("/api/getSubs-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: `${userId}` }),
      });

      const getSubs = await response.json();

      if (getSubs?.success) {
        let customerid = getSubs.subscription.customerid;
        const response = await fetch("/api/create-customer-portal-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ customerId: `${customerid}` }),
        });
        let res = await response.json();
        if (res.url) {
          window.location = res.url;
        }
      }
    } catch (error) {
    } finally {
    }
  };

  const closeFinalPopup = () => {
    setShowFinalPopup(false);
    window.location.reload();
  };

  return (
    <>
      <Dialog
        open={showFinalPopup}
        onOpenChange={closeFinalPopup}
        className="relative z-60"
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col text-center">
              <DialogTitle className="text-3xl">Thank You</DialogTitle>
              <DialogDescription className="text-sm ">
                <span>{showFinalPopupMessage}</span>
              </DialogDescription>
              <div className="mt-4 space-y-4">
                <button
                  type="button"
                  onClick={closeFinalPopup}
                  className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                >
                  OK!
                </button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Create Password Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={closeDialogpwd}
        className="relative z-60"
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Create Password</DialogTitle>
              <DialogDescription className="text-xs mt-2">
                Please set your new password.
              </DialogDescription>
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-ink-soft"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showNewPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-ink-soft"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCreatePassword}
                  className="mt-4 bg-accent w-full text-accent-foreground px-4 py-2 rounded-md hover:bg-primary hover:text-ink-inverse flex justify-center items-center"
                  disabled={loadingp}
                >
                  {loadingp ? <Spinner className="w-5 h-5" /> : "Set Password"}
                </button>
                <span className="text-xs text-center text-destructive">
                  {dialoagError}
                </span>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={showChangeDialog}
        onOpenChange={closeDialogpwd}
        className="relative z-60"
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription className="text-xs mt-2">
                Please enter your current and new passwords.
              </DialogDescription>
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <label
                    htmlFor="current-password"
                    className="block text-sm font-medium text-ink-soft"
                  >
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showCurrentPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-ink-soft"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showNewPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative mb-4">
                  <label
                    htmlFor="confirm-new-password"
                    className="block text-sm font-medium text-ink-soft"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="mt-8 bg-accent w-full text-accent-foreground px-4 py-2 rounded-md flex justify-center hover:bg-primary hover:text-ink-inverse items-center"
                  disabled={loadingp}
                >
                  {loadingp ? (
                    <Spinner className="w-5 h-5" />
                  ) : (
                    "Change Password"
                  )}
                </button>
                <span className="text-xs text-center text-destructive">
                  {dialoagError}
                </span>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Varified OTP Dialog */}
      <Dialog
        open={showOTPDialog}
        onOpenChange={closeDialog}
        className="relative z-60"
      >
        <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <div className="flex flex-col items-center">
              {isVarify ? (
                <>
                  <DialogTitle className="text-center font-semibold text-2xl">
                    Phone Number Is Verified
                  </DialogTitle>
                  <Image
                    className="h-full w-40"
                    src={CheckImage}
                    alt="varifide"
                  />
                  <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                    Successfully Verified Your Phone Number
                    <br /> {"+" + phoneNumber}
                  </DialogDescription>
                </>
              ) : (
                <>
                  <DialogTitle className="text-center font-semibold text-2xl">
                    OTP (One-Time Verification Password)
                  </DialogTitle>
                  <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                    Enter the 6-digit verification code sent to <br />{" "}
                    {"+" + phoneNumber}
                  </DialogDescription>
                  <div className="mt-4">
                    <InputOTP
                      id="otpInput"
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            onChange={(e) => {
                              const newOtp = otp.split("");
                              newOtp[index] = e.target.value;
                              setOtp(newOtp.join(""));
                            }}
                          />
                        ))}
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        {[3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            onChange={(e) => {
                              const newOtp = otp.split("");
                              newOtp[index] = e.target.value;
                              setOtp(newOtp.join(""));
                            }}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {OtpError && <p className="text-destructive mt-2">{OtpError}</p>}
                  <div className="w-full text-center mt-4 justifu-center item-center">
                    {resandLoading ? (
                      <div
                        style={{ marginLeft: "auto", marginRight: "auto" }}
                        className=" w-full  text-center item-center"
                      >
                        <span
                          style={{ justifyContent: "center" }}
                          className="flex text-xs text-center item-center text-muted-foreground font-normal ml-auto cursor-pointer"
                        >
                          Didn’t receive the code?{" "}
                          <b>
                            <svg
                              style={{ marginTop: "2px", marginLeft: "10px" }}
                              className={`animate-spin h-3 w-3`}
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.414 1.414C8.204 18.047 10.042 18 12 18v-4c-1.506 0-2.933.432-4.14 1.172L6 17.291z"
                              ></path>
                            </svg>
                          </b>
                        </span>
                      </div>
                    ) : (
                      <>
                        {OtpError ? (
                          ""
                        ) : (
                          <>
                            {canResend ? (
                              <span
                                className="text-xs text-center text-muted-foreground font-normal cursor-pointer"
                                onClick={resendCode}
                              >
                                Didn’t receive the code?{" "}
                                <b>
                                  <u>Resend Code</u>
                                </b>
                              </span>
                            ) : (
                              <span className="text-xs text-center text-muted-foreground font-normal">
                                Resend code in {counter} seconds
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {OtpError ? (
                    ""
                  ) : (
                    <>
                      {
                        canVarify ? (
                          <button
                            type="button"
                            onClick={() => varifyPhone(otp)}
                            className="mt-4 w-full bg-accent text-accent-foreground font-semibold py-3 rounded-md flex hover:bg-primary hover:text-ink-inverse justify-center items-center"
                            disabled={loading}
                          >
                            {loading ? (
                              <Spinner className="w-5 h-5" />
                            ) : (
                              "Verify"
                            )}
                          </button>
                        ) : (
                          ""
                        )
                      }
                    </>
                  )}
                </>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Phone Number Dialog */}
      <Dialog
        open={showPhoneDialog}
        onOpenChange={closeDialog}
        className="relative z-60"
      >
        <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <div className="flex flex-col items-center">
              <DialogTitle className="text-center font-semibold text-2xl">
                Your number is safe with us.
              </DialogTitle>
              <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                Please provide a phone number that can receive text messages.
              </DialogDescription>
              <form onSubmit={handleSubmit} className="w-full mt-6">
                <div className="relative">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-ink-soft"
                  >
                    Phone Number
                  </label>
                  <PhoneInput
                    className="py-2 rounded-lg bg-[hsl(var(--surface-subtle))]"
                    country={"gb"} // Default country set to the United Kingdom
                    value={phoneNumber}
                    onChange={(phone, country) => {
                      setSelectedCountry(country.countryCode);
                      setPhoneNumber(phone);
                      setDialogError("");
                    }}
                    inputStyle={{
                      width: "100%",
                      paddingLeft: "45px",
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--surface-subtle))",
                      backgroundColor: "hsl(var(--surface-subtle))",
                      fontSize: "18px",
                    }}
                    containerStyle={{
                      width: "100%",
                    }}
                    buttonStyle={{
                      background: "hsl(var(--surface-subtle))",
                      border: "1px solid hsl(var(--surface-subtle))",
                      backgroundColor: "hsl(var(--surface-subtle))",
                      borderRadius: "8px",
                    }}
                  />
                  {dialogError && (
                    <p className="text-xs text-destructive mt-2">{dialogError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full bg-accent text-accent-foreground font-semibold py-3 rounded-md flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? <Spinner className="w-5 h-5" /> : "Continue"}
                </button>
              </form>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <nav className="border-b border-neutral-200 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href={"/"}>
              <Logomark className="h-8 w-8" />
            </Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <div className="hidden md:flex space-x-4">
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3 ">
            <ThemeToggle />
            {SubscriptionType == "" ? (
              ""
            ) : (
              <>
                {SubscriptionType == "Deactivate" || SubscriptionType == "One Time" ? (
                  ""
                ) : (
                  <>
                    <DropdownMenu open={isOpenplan}>
                      <DropdownMenuTrigger
                        onMouseEnter={handleMouseEnterplan}
                        onMouseLeave={handleMouseLeaveplan}
                      >
                        <div
                          style={{ margin: "auto 0" }}
                          className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm cursor-default"
                        >
                          Current Plan:{" "}
                          <span className="font-bold">{userSubscription}</span>
                        </div>
                      </DropdownMenuTrigger>
                      {SubscriptionType !== "Free" || SubscriptionType == "One Time" && (
                        <DropdownMenuContent
                          style={{ marginTop: "-4px" }}
                          className="bg-accent text-accent-foreground font-semibold rounded-lg text-sm px-10 py-3 "
                          onMouseEnter={handleMouseEnterplan}
                          onMouseLeave={handleMouseLeaveplan}
                        >
                          {isLoading ? (
                            <button disabled type="button">
                              &nbsp;&nbsp;&nbsp;&nbsp;Loading...&nbsp;
                            </button>
                          ) : (
                            <button onClick={manageSubs} type="button">
                              Manage Plan
                            </button>
                          )}
                          {/* </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      )}
                    </DropdownMenu>
                  </>
                )}
              </>
            )}
            {SubscriptionType == "" || SubscriptionType == "Deactivate" || SubscriptionType == "One Time" ? (
              ""
            ) : (
              <Link
                href="/tradesperson/subscription"
                className="bg-accent font-bold text-accent-foreground hover:bg-primary hover:text-ink-inverse px-8 py-2 rounded-md text-md "
              >
                {SubscriptionType == "Deactivate" ? "Get Plan" : "Change Plan"}
              </Link>
            )}
            <Notification />
            {isLoggedIn ? (
              <DropdownMenu open={isOpenmin}>
                <DropdownMenuTrigger
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        userProfile ||
                        "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg"
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                {SubscriptionType == "Deactivate" ? (
                  <DropdownMenuContent
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* <DropdownMenuSeparator /> */}
                    <a onClick={handleLogout}>
                      <DropdownMenuItem className="text-destructive-soft-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                        Log Out
                      </DropdownMenuItem>
                    </a>
                  </DropdownMenuContent>
                ) : (
                  <DropdownMenuContent
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link onClick={handleClick} href={`/tradesperson/profile`}>
                      <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                        My Profile
                      </DropdownMenuItem>
                    </Link>
                    {/* <DropdownMenuSeparator />
                    <Link onClick={handleClick} href="/tradesperson/myjobs">
                      <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                        My Jobs
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <Link onClick={handleClick} href="/tradesperson/leads">
                      <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                        View Leads
                      </DropdownMenuItem>
                    </Link> */}
                    <DropdownMenuSeparator />
                    {!userPhone ? (
                      <a
                        onClick={() => {
                          setShowPhoneDialog(true);
                          handleClick();
                        }}
                      >
                        <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                          Add phone number
                        </DropdownMenuItem>
                      </a>
                    ) : (
                      <a
                        onClick={() => {
                          setShowPhoneDialog(true);
                          handleClick();
                        }}
                      >
                        <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                          Change Phone Number
                        </DropdownMenuItem>
                      </a>
                    )}
                    <DropdownMenuSeparator />
                    {pwdDefault ? (
                      <a
                        onClick={() => {
                          setShowCreateDialog(true);
                          handleClick();
                        }}
                      >
                        <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                          Create password
                        </DropdownMenuItem>
                      </a>
                    ) : (
                      <a
                        onClick={() => {
                          setShowChangeDialog(true);
                          handleClick();
                        }}
                      >
                        <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                          Change Password
                        </DropdownMenuItem>
                      </a>
                    )}
                    <DropdownMenuSeparator />
                    <a
                      onClick={() => {
                        setShowEmailDialog(true);
                        handleClick();
                      }}
                    >
                      <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200 rounded-lg">
                        Change email
                      </DropdownMenuItem>
                    </a>
                    <DropdownMenuSeparator />
                    <a onClick={handleLogout}>
                      <DropdownMenuItem className="text-destructive-soft-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200  rounded-lg">
                        Log Out
                      </DropdownMenuItem>
                    </a>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            ) : (
              <></>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <div className="p-2">
              <Notification />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink-soft hover:text-foreground focus:outline-none"
            >
              <Menu />
            </button>
          </div>
        </div>
        {/* Viewport-sized clip so the off-screen drawer can't widen the page on mobile. */}
        <div className="fixed inset-0 z-20 overflow-hidden pointer-events-none md:hidden">
        <div
          className={`absolute inset-0 bg-secondary shadow-2xl rounded-lg transform pointer-events-auto ${isOpen ? "translate-x-0" : "translate-x-full invisible"
            } transition-[transform,visibility] duration-300 ease-in-out`}
        >
          <div className="flex justify-between">
            <div className="p-4 text-lg font-semibold">
              <Link href={"/"}>
                <Logomark className="h-8 w-8" />
              </Link>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-foreground font-semibold flex  hover:text-foreground focus:outline-none absolute top-4 right-4"
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
              {isOpen ? "Close" : ""}
            </button>
          </div>
          {/* border-t  */}
          {SubscriptionType == "Deactivate" ? (
            <div
              style={{ lineHeight: "12px" }}
              className="mt-10 text-bold space-y-4 "
            >
              <Link
                href="/tradesperson/subscription"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2  font-bold text-[17px]  text-foreground "
              >
                Get Plan
              </Link>
              <Link
                href={`/login`}
                onClick={handleLogout}
                className="block px-4 py-2  font-bold text-[17px]  text-foreground "
              >
                Log Out
              </Link>
            </div>
          ) : (
            <div
              style={{ lineHeight: "12px" }}
              className="mt-10 text-bold space-y-4 "
            >
              {/* <Link
                href="/tradesperson/myjobs"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2  font-bold text-[17px] text-foreground "
              >
                My Jobs
              </Link>
              <Link
                href="/tradesperson/leads"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2  font-bold text-[17px] text-foreground "
              >
                View Leads
              </Link> */}
              {SubscriptionType !== "Free" && SubscriptionType !== "One Time" &&
                (isLoading ? (
                  <button
                    disabled
                    className="block px-4 py-2  font-bold text-[17px] text-foreground "
                  >
                    Loading...&nbsp;
                  </button>
                ) : (
                  <span
                    onClick={manageSubs}
                    className="block px-4 py-2  font-bold text-[17px] text-foreground "
                  >
                    Manage Plan
                  </span>
                ))}
              {SubscriptionType === "One Time" ? null :
                (<Link
                  href="/tradesperson/subscription"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2  font-bold text-[17px]  text-foreground "
                >
                  Change Plan
                </Link>)}
              <Link
                href={`/tradesperson/profile`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2  font-bold text-[17px]  text-foreground "
              >
                Profile Settings
              </Link>
              {!userPhone ? (
                <a
                  onClick={() => setShowPhoneDialog(true)}
                  className="block px-4 py-2  font-bold text-[17px]  text-foreground "
                >
                  Add phone number
                </a>
              ) : (
                <a
                  onClick={() => setShowPhoneDialog(true)}
                  className="block px-4 py-2  font-bold text-[17px]  text-foreground "
                >
                  Change Phone Number
                </a>
              )}
              <a
                onClick={() => {
                  setShowEmailDialog(true);
                }}
                className="block px-4 py-2  font-bold text-[17px]  text-foreground "
              >
                Change email
              </a>
              {pwdDefault ? (
                <a
                  onClick={() => setShowCreateDialog(true)}
                  className="block px-4 py-2  font-bold text-[17px]  text-foreground "
                >
                  Create password
                </a>
              ) : (
                <a
                  onClick={() => setShowChangeDialog(true)}
                  className="block px-4 py-2  font-bold text-[17px]  text-foreground "
                >
                  Change Password
                </a>
              )}
              <Link
                href={`https://tradepeople.co.uk/help-center/`}
                target="_blank"
                className="block px-4 py-2  font-bold text-[17px]  text-foreground "
              >
                Help Center
              </Link>
              <Link
                href={`/login`}
                onClick={handleLogout}
                className="block px-4 py-2  font-bold text-[17px]  text-foreground "
              >
                Log Out
              </Link>
              <div className="justify-center">
                <div
                  style={{ margin: "auto 0" }}
                  className="bg-surface text-foreground px-6 py-4 w-full rounded-md text-md text-center cursor-default"
                >
                  Current Plan:{" "}
                  <span className="font-bold">{userSubscription}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </nav>
      <EmailChangeDialog
        isOpen={showEmailDialog}
        onClose={handleCloseEmailDialog} // Pass the custom close handler
        currentEmail={users?.email || ""}
        onEmailChange={(newEmail) => {
          setEmail(newEmail);
          setShowEmailDialog(false);
        }}
        isCrossClicked={isCrossClicked} // Pass the state to the child
        resetCrossClicked={() => setIsCrossClicked(false)} // Pass a function to reset the state
      />
    </>
  );
};

export default Navbar;