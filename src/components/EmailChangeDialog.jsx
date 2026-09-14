"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Step2 from "./RegistrationSteps/Step2";
import { getUserDetails } from "../actions/auth";
import Spinner from "./Spinner";
const EmailChangeDialog = ({
  isOpen,
  onClose,
  currentEmail,
  onEmailChange,
  isCrossClicked,
  resetCrossClicked,
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [ApiRes, setApiRes] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    if (isCrossClicked) {
      setNewEmail("");
      setEmailError("");
      setShowOtpStep(false);
      setApiRes("");
      setLoading(false);
      resetCrossClicked();
    }
  }, [isCrossClicked, resetCrossClicked]);

  const handleEmailChange = (e) => {
    if (newEmail === currentEmail) {
      setEmailError("New email is the same as the current email.");
      return;
    }
    setEmailError("");
    onEmailChange(newEmail);
    setShowOtpStep(true);
  };

  const handleEmailUpdate = async () => {
    setLoading(true); // Start loading
    const jwtuser = await getUserDetails();
    try {
      setApiRes("");
      const response = await fetch("/api/update-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtuser?.token}`,
        },
        body: JSON.stringify({ userId: jwtuser.id, newEmail }),
      });

      if (response.ok) {
        setApiRes("Email has been successfully updated")
        setShowOtpStep(false);
        onClose();
      } else {
        const errorData = await response.json();
        setApiRes(errorData.error || "Failed to update email.");
      }
    } catch (error) {
      setApiRes("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={isOpen || showOtpStep} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{showOtpStep ? "Verify Email" : "Change Email"}</DialogTitle>
        </DialogHeader>
        {showOtpStep ? (
          <>
            {ApiRes ? (
              <div className="flex flex-col items-center justify-center p-4  w-full max-w-md">
                <p className="text-destructive  p-2 text-lg font-semibold text-center w-full">
                  {ApiRes}
                </p>
                <p className="text-ink-soft text-sm text-center ">
                  Please double-check your email address and try again. If the problem persists, contact support.
                </p>
              </div>

            ) : (
              <Step2
                data={{ email: newEmail }}
                handleEmailVerification={(verified) => {
                  if (verified) {
                    handleEmailUpdate();
                  }
                }}
              />)}

          </>
        ) : (
          <form onSubmit={handleEmailChange}>
            <p className="text-ink-soft text-sm mb-2">
              Enter your new email address below, and we’ll send a verification code to confirm the update.
            </p>

            <Input
              className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-4"
              type="email"
              placeholder="Enter Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading} // Disable input while loading
            />
            {emailError && (
              <div className="flex justify-center">
                <p className="text-destructive text-sm mt-2 bg-destructive-soft p-2 rounded-md text-center w-full">
                  {emailError}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="submit"
                className="mt-8 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse"
                disabled={loading} // Disable button while loading
              >
                {loading ? (
                  <Spinner />
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailChangeDialog;
