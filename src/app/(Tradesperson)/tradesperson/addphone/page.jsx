"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidNumber, parsePhoneNumber } from "libphonenumber-js";
import { getUserDetails } from "../../../../actions/auth";
import Spinner from "./../../../../components/Spinner";
import { cn } from "./../../../../lib/utils";
import { ArrowRight } from "lucide-react";
import { ArrowDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../../../components/ui/input-otp";
import * as Sentry from '@sentry/nextjs';


const Page = () => {
  const [counter, setCounter] = useState(60);
  const [OtpError, setOtpError] = useState("");
  const [otp, setOtp] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [canVerify, setCanVerify] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("gb");
  const [showOTPInput, setShowOTPInput] = useState(false);

  const otpSentRef = useRef(false);
  const router = useRouter();

  function isValidPhoneNumber(number, countryCode) {
    try {
      const phoneNumber = parsePhoneNumber(number, countryCode.toUpperCase());
      return phoneNumber.isValid();
    } catch (error) {
      return false;
    }
  }

  const sendOTP = async () => {
    setLoading(true);
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
      setCanResend(false);
      setCounter(60);
      otpSentRef.current = true;
      setShowOTPInput(true);
    } catch (error) {
      Sentry.captureException("Error sending OTP:", error);
      setOtpError("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
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
      setIsVerified(true);
      setOtpError('');
      return { status: 200 };
    } catch (error) {
      Sentry.captureException('Error verifying OTP:', error);
      setOtpError('Invalid OTP. Please try again.');
      return { status: 400 };
    }
  };

  const handleSubmit = () => {
    if (phoneNumber == "" || phoneNumber == undefined) {
      toast.error("Please Enter Phone Number.", {
        position: "top-center",
      });
      return;
    } else if (!isValidPhoneNumber(phoneNumber, selectedCountry)) {
      toast.error("Number is Not Valid.", {
        position: "top-center",
      });
      return;
    } else {
      setDialogError("");
    }

    setLoading(true);
    setTimeout(async () => {
      await sendOTP();
      setLoading(false);
      setShowOTPInput(true);
    }, 2000);
  };

  const verifyPhone = async () => {
    setVerifyLoading(true);
    const user = await getUserDetails();
    try {
      const verifyResponse = await verifyOtp(); // This should call your API
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
          setIsVerified(true);
          router.push(`/tradesperson/subscription`);
        }
      } else {
        setOtpError("OTP verification failed. Please try again.");
      }
    } catch (error) {
      setOtpError(error.message || "Something went wrong.");
    }
    setVerifyLoading(false);
  };

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [counter]);

  useEffect(() => {
    setCanVerify(otp.length === 6);
    if (otp.length < 6) setOtpError("");
  }, [otp]);
  const handleChangeNumber = () => {
    setPhoneNumber("");
    setShowOTPInput(false);
    setOtp("");
    setOtpError("");
    setIsVerified(false);
    setCanVerify(false);
    setGeneratedCode("");
    setCounter(60);
    setCanResend(false);
    otpSentRef.current = false;
  };
  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="w-screen">
        <div className="flex flex-col xl:text-center md:text-center justify-between">
          <h2 className="mt-4 text-2xl font-semibold text-ink-soft">
            Your number is safe with us.
          </h2>
          <p className="text-sm">
            Please provide a phone number that can receive text messages.
          </p>
        </div>

        <div className="mt-4 mb-10">
          <div className="w-full bg-neutral-200 h-1.5 rounded-full">
            <div className="bg-accent text-accent-foreground h-1.5 rounded-full"></div>
          </div>
        </div>
        <div className="max-h-screen h-auto mt-14 flex flex-col items-center justify-center mb-10">
          <div className="md:flex items-center">
            <div className="h-32 w-full max-w-md mr-2 mt-5 px-8 py-6 bg-surface rounded-lg shadow-md border border-neutral-200">
              <div className="flex justify-between text-sm font-medium ">
                <div className=" text-ink-soft">
                  Phone Number
                </div>
                {showOTPInput && (
                  <b onClick={handleChangeNumber} className="text-xs text-ink-soft cursor-pointer">
                    <u>Change Number</u>
                  </b>
                )}
              </div>
              <div className="flex flex-col mt-[9px] items-center justify-center space-y-4 relative">
                <PhoneInput
                  className="py-2 rounded-lg bg-[hsl(var(--surface-subtle))]"
                  country={"gb"}
                  value={phoneNumber}
                  onChange={(phone, country) => {
                    setSelectedCountry(country.countryCode);
                    setPhoneNumber(phone);
                    setDialogError("");
                  }}
                  disabled={showOTPInput}
                  inputStyle={{
                    width: "100%",
                    paddingLeft: "45px",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--surface-subtle))",
                    backgroundColor: "hsl(var(--surface-subtle))",
                    fontSize: "18px",
                  }}
                  containerStyle={{ width: "100%" }}
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
            </div>

            {/* OTP Input Field (Initially Hidden) */}
            {showOTPInput && (
              <>
                <div className="hidden md:block  my-auto mr-5 ml-4">
                  <ArrowRight />
                </div>
                <div className="block md:hidden flex justify-center items-center mt-4 mb-4">
                  <ArrowDown />
                </div>

                <div className="flex">
                  <div className="max-w-md p-6 rounded-lg shadow-lg bg-surface border">
                    <h2 className="text-center font-semibold text-2xl">
                      OTP (One-Time Verification Password)
                    </h2>
                    <p className="text-sm text-center mt-2 text-muted-foreground">
                      Enter the 6-digit verification code sent to <br /> +
                      {phoneNumber}
                    </p>

                    <div className="mt-4 flex justify-center">
                      <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                        <InputOTPGroup>
                          {[0, 1, 2].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-10 h-10 text-xl text-center border rounded-md"
                            />
                          ))}
                        </InputOTPGroup>
                        <InputOTPSeparator>
                          <span className="text-2xl">â€¢</span>
                        </InputOTPSeparator>
                        <InputOTPGroup>
                          {[3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-10 h-10 text-xl text-center border rounded-md"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {OtpError && (
                      <p className="text-destructive text-center mt-2">
                        {OtpError}
                      </p>
                    )}

                    <div className="text-center mt-4">
                      {canResend ? (
                        <span
                          className="text-xs text-muted-foreground cursor-pointer"
                          onClick={sendOTP}
                        >
                          Didnâ€™t receive the code?{" "}
                          <b>
                            <u>Resend Code</u>
                          </b>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Resend code in {counter} seconds
                        </span>
                      )}
                    </div>

                    {canVerify && (
                      <button
                        onClick={verifyPhone}
                        className={cn(
                          "mt-4 w-full bg-accent text-accent-foreground font-semibold py-3 rounded-md",
                          { "hover:bg-primary hover:text-ink-inverse": !verifyLoading }
                        )}
                        disabled={verifyLoading}
                      >
                        {verifyLoading ? <Spinner className="w-5 h-5 mx-auto" /> : "Verify"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 mb-4 flex justify-end">
          <button
            onClick={() => {
              handleSubmit();
            }}
            className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse rounded-md flex items-center"
            disabled={loading || verifyLoading || showOTPInput}
          >
            {loading ? <Spinner className="w-5 h-5" /> : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
