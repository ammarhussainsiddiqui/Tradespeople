"use client";
import React, { useState } from "react";
import { EyeIcon, EyeOff } from "lucide-react";
import GoogleLoginButton from "../../../../../components/GoogleLoginButton";
import { toast } from "react-toastify";
import { generateToken } from '../../../../../utils/functions'
import * as Sentry from '@sentry/nextjs';

const Page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isPending, setIsPending] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Password do not match.";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsPending(true);
    const token = await generateToken();
    try {
      const response = await fetch("/api/trade-sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("User registered successfully", {
          position: "top-center",
        });
        // You can handle further actions like redirecting the user here
      } else {
        toast.info("Message Of Google " + data.message, {
          position: "top-center",
        });
      }
    } catch (error) {
      Sentry.captureException("Error:", error);
      toast.error("An error occurred", {
        position: "top-center",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleSignupSuccess = async (response) => {
    setIsPending(true);
    const token = await generateToken();
    try {
      const { tokenId: id_token } = response;
      const apiResponse = await fetch("/api/google-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_token }),
      });

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        toast.success("User registered successfully with Google", {
          position: "top-center",
        });
      } else {
        toast.warning(data.message, {
          position: "top-center",
        });
      }
    } catch (error) {
      Sentry.captureException("Error:", error);
      toast.error(error, {
        position: "top-center",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleSignupFailure = (response) => {
    Sentry.captureException("Google Sign-In Error:", response);
    toast.warning("Google Sign-In failed. Please try again.", {
      position: "top-center",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="flex flex-col items-center justify-center w-screen p-4">
        <div className="bg-surface p-6 rounded-lg border border-neutral-200 w-full max-w-md mb-4">
          <h2 className="md:text-2xl text-xl font-bold mb-4">
            Sign Up as a Tradesperson
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-ink-soft">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
              />
              {errors.name && <p className="text-destructive-soft-foreground">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-ink-soft">
                User Name <span className="text-destructive">*</span>
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
              />
              {errors.username && (
                <p className="text-destructive-soft-foreground">{errors.username}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-ink-soft">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
              />
              {errors.email && <p className="text-destructive-soft-foreground">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-ink-soft">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-ink-soft" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-ink-soft" />
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="text-destructive-soft-foreground">{errors.password}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-ink-soft">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
              />
              {errors.confirmPassword && (
                <p className="text-destructive-soft-foreground">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className={`bg-accent hover:bg-accent/90 text-ink-inverse hover:text-accent-foreground py-3 px-4 rounded-lg w-full font-bold ${isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Sign Up"}
            </button>
          </form>

          <div className="relative my-4">
            <hr className="border-neutral-400" />
            <p className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 text-neutral-600 bg-surface px-2 text-center">
              or
            </p>
          </div>

          <GoogleLoginButton
            onSuccess={handleGoogleSignupSuccess}
            onFailure={handleGoogleSignupFailure}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
