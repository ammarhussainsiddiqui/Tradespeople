import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/nextjs";
import { login } from "../actions/auth";
import { useFormState } from "react-dom";
const GoogleLoginButton = () => {
  const [isPendingGoogle, setIsPendingGoogle] = useState(false);
  // Google renders a fixed-width button, so pick the width once on mount
  // instead of mounting two buttons (each one re-initialises Google Sign-In).
  const [buttonWidth, setButtonWidth] = useState(null);

  const [currentState, loginAction, isPending] = useFormState(login, {});

  useEffect(() => {
    setButtonWidth(window.matchMedia("(min-width: 1024px)").matches ? "400" : "345");
  }, []);

  // The raw Google ID token goes to the server, which verifies it and reads
  // the email from it. Decoding it here and sending the email isn't trustworthy.
  const handleSuccess = async (response) => {
    await handleGoogleSignupSuccess(response.credential);
  };

  const handleError = (error) => {
    toast.warning("Google Sign-In failed. Please try again.", {
      position: "top-center",
    });
  };

  const handleGoogleSignupSuccess = async (credential) => {
    setIsPendingGoogle(true);

    try {
      const apiResponse = await fetch("/api/google-auth-home-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const data = await apiResponse.json();

      if (data.success) {
        const formDataEntries = new FormData();
        formDataEntries.append("email", data.email);
        formDataEntries.append("password", data.password || "00000"); // Use the password returned from the API
        formDataEntries.append("roleId", 1); // Assuming 1 is for the "Customer" role

        // Call the login function with the form data
        const loginResponse = await loginAction(formDataEntries);
        if (loginResponse?.zod_errors) {
          toast.warning("Validation errors occurred", {
            position: "top-center",
          });
        } else if (loginResponse?.other) {
          toast.warning(loginResponse.other, {
            position: "top-center",
          });
        } else {
          toast.success("User successfully logged in.", {
            position: "top-center",
          });
        }
      } else {
        toast.warning(
          data.message || "Something went wrong. Please try again.",
          {
            position: "top-center",
          }
        );
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error("An error occurred. Please try again later.", {
        position: "top-center",
      });
    } finally {
      setIsPendingGoogle(false);
    }
  };

  if (!buttonWidth) return null;

  return (
    <div className="flex justify-center items-center w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={true}
        type="standard"
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="center"
        width={buttonWidth}
      />
    </div>
  );
};

export default GoogleLoginButton;
