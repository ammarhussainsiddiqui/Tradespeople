import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { decodeJwt } from "jose";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/nextjs";
import { login } from "../actions/auth";
import { useFormState } from "react-dom";
const GoogleLoginButton = () => {
  const [isPendingGoogle, setIsPendingGoogle] = useState(false);

  const [currentState, loginAction, isPending] = useFormState(login, {});

  const handleSuccess = async (response) => {
    const credential = response.credential;

    // Decode the JWT token to extract user information
    const decodedToken = decodeJwt(credential);
    // Destructure the needed info and set as constants
    const {
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profile,
    } = decodedToken;

    // Set these as constants for easier access
    const USER_EMAIL = email;
    const USER_FIRST_NAME = firstName;
    const USER_LAST_NAME = lastName;
    const USER_PROFILE = profile;
    // Now call your API with just the email (USER_EMAIL)
    await handleGoogleSignupSuccess(
      USER_EMAIL,
      USER_FIRST_NAME,
      USER_LAST_NAME,
      USER_PROFILE
    );
  };

  const handleError = (error) => {
    toast.warning("Google Sign-In failed. Please try again.", {
      position: "top-center",
    });
  };

  const handleGoogleSignupSuccess = async (
    email,
    firstName,
    lastName,
    profilePicture
  ) => {
    setIsPendingGoogle(true);

    try {
      // Send just the email to your API for login/registration

      const apiResponse = await fetch("/api/google-auth-home-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, firstName, lastName, profilePicture }), // Only send email
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

  return (
    <>
      <div className="flex justify-center items-center w-full block lg:hidden">
        <GoogleLogin
          onSuccess={handleSuccess}
          onFailure={handleError}
          useOneTap={true}
          type="standard"
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          logo_alignment="center"
          width="345"
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="w-full max-w-xs py-2 px-4 text-destructive-foreground bg-destructive hover:bg-primary-hover rounded-lg shadow-md text-lg font-semibold"
            >
              Sign In with Google
            </button>
          )}
        />
      </div>

      <div className="flex justify-center items-center w-full hidden lg:block">
        <GoogleLogin
          onSuccess={handleSuccess}
          onFailure={handleError}
          useOneTap={true}
          type="standard"
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          logo_alignment="center"
          width="400"
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="w-full max-w-xs py-2 px-4 text-destructive-foreground bg-destructive hover:bg-primary-hover rounded-lg shadow-md text-lg font-semibold"
            >
              Sign In with Google
            </button>
          )}
        />
      </div>
    </>
  );
};


export default GoogleLoginButton;

