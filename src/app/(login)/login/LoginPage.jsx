"use client"
import React, { useState, useEffect } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormState } from "react-dom";
import { login } from '../../../actions/auth';
import { generateToken } from '../../../utils/functions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { toast } from "react-toastify";
import { useGlobalState } from '../../context/GlobalStateContext';
import GoogleLoginButton from "../../../components/GoogleLoginButton";
import GoogleLoginButton_TP from "../../../components/(Tradesperson)/GoogleLoginButton_TP";
import loginArrow from "../../assets/login-arrow.webp"
import Image from 'next/image';

const LoginPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Customer");
  const { jobCache, setjobCache, emailFlag, setEmailFlag, userId, setUserId } =
    useGlobalState();
  const [dialogOpen, setDialogOpen] = useState(true);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDialogOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Customer':
        return 1;
      case 'Tradespersons':
        return 2;
      default:
        return 1;
    }
  };

  const [currentState, loginAction, isPending] = useFormState(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const [emailLink, setEmailLink] = useState(false);
  const [thisEmail, setThisEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email_error, seterror] = useState();
  const [email_dilogerror, setdilogerror] = useState();
  const [cache, setCache] = useState();
  const [Pwd, SetPwd] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [redirect, SetRedirect] = useState(false);
  const [redirectTrade, SetRedirectTrade] = useState(false);
  const [login_error, setLogin_error] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingGoogle, setIsPendingGoogle] = useState(false);
  const [mounted, setMounted] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };



  useEffect(() => {
    const fetchEmail = async () => {
      const cachedJob = jobCache;
      const emailTradeperson = emailFlag;
      if (cachedJob) {
        setCache(cachedJob);
        setEmailLink(true);
        SetRedirect(true);
        SetRedirectTrade(false)
      } else if (emailTradeperson && emailTradeperson !== 'null') {
        let cache = { email: emailTradeperson }
        setCache(cache);
        SetRedirectTrade(true)
        setEmailLink(false);
        SetRedirect(false);
      } else {
        SetRedirectTrade(false)
        SetRedirect(false);
      }
    };

    fetchEmail();
  }, []);

  const loginThroughLink = (email, id) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    if (emailRegex.test(email)) {
      router.push(`login/link?email=${email}&id=${id}`)
      setdilogerror()
    } else {
      setdilogerror('Please enter a valid email')
    }
  }


  const validateEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    const email = document.getElementById('email').value;
    setThisEmail(email)
    if (emailRegex.test(email)) {
      seterror()
      setEmailLink(true);
    } else {
      setEmailLink(false);
    }
  }

  useEffect(() => {
    if (currentState?.other) {
      toast.warning(currentState?.other, {
        position: "top-center",
      });
      setIsLoading(false)
    }
    setIsLoading(false)
  }, [currentState]);


  // Ensure metadata is updated after the page is hydrated
  useEffect(() => {
    setMounted(true); // Metadata can be updated after mounting
  }, []);

  if (!mounted) return null;
  return (
    <>
      {/* Title, description, Open Graph and canonical tags come from `metadata` in login/page.jsx. */}
      <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
        <Dialog
          open={dialogOpen}
          onOpenChange={(isOpen) => setDialogOpen(isOpen)}
        >
          <DialogContent
            className="sm:max-w-md [&>button]:hidden"
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
            a
          >
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">
                Login Options
              </DialogTitle>
              <DialogDescription className="text-center">
                Select a login based on your user type
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4 py-4">
              <Button
                variant="outline"
                className={`py-6 text-lg font-medium ${activeTab === "Customer"
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : ""
                  }`}
                onClick={() => handleTabChange("Customer")}
              >
                Login as Homeowner
              </Button>
              <Button
                variant="outline"
                className={`py-6 text-lg font-medium ${activeTab === "Tradespersons"
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : ""
                  }`}
                onClick={() => {
                  handleTabChange("Tradespersons");
                }}
              >
                Login as Tradesperson
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex flex-row items-center justify-center w-screen p-4">
          <div className='absolute hidden md:flex flex-col  justify-center items-center mr-[520px] -mt-[260px]'>
            <Image src={loginArrow} alt="Arrow indicator" width={100} height={100} className='ml-8 mb-[90px]' priority
              fetchPriority="high"
              loading="eager" />
            <button className="relative -rotate-90 z-[1] font-extrabold text-[17px] text-accent-foreground transition-all [transition-duration:250ms] overflow-hidden  px-12 md:px-8 lg:px-12 py-2 rounded-[15px] bgColor border-none group  hidden md:block mr-5" onClick={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}>
              <span className="absolute inset-0 w-0 bg-primary z-[-1] shadow-[4px_8px_19px_-3px_hsl(var(--shadow-strong))] transition-all [transition-duration:250ms] rounded-[15px] left-0 top-0 group-hover:w-full"></span>
              <span className="relative block group-hover:text-ink-inverse">Switch login type</span>
            </button>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <div className='w-full max-w-md  items-center justify-center'>

              <h2 className="md:text-2xl px-6 text-xl font-bold mb-4"> {activeTab == 'Customer' ? 'Login as Homeowner' : 'Login as Tradesperson'}</h2>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-neutral-200 w-full max-w-md mb-4">

              <form action={loginAction} onSubmit={() => { setIsLoading(true) }}>
                <div className="mb-4">
                  <label className="block text-ink-soft">Email <span className="text-destructive">*</span></label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    onChange={validateEmail}
                    placeholder="Enter your email address"
                    className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                  />
                </div>
                {currentState?.zod_errors?.email && (
                  <p className="text-destructive-soft-foreground">{currentState.zod_errors.email}</p>
                )}
                {email_error && (
                  <p className="text-destructive-soft-foreground">{email_error}</p>
                )}
                <div className="mb-4">
                  <label className="block text-ink-soft">Password <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                    />

                    <span
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6" />
                      ) : (
                        <EyeIcon className="h-6 w-6" />
                      )}
                    </span>
                  </div>
                  {currentState?.zod_errors?.password && (
                    <p className="text-destructive-soft-foreground">{currentState.zod_errors.password}</p>
                  )}
                </div>
                <input
                  hidden
                  name="roleId"
                  type='text'
                  value={renderContent()}
                  className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                />
                <div style={{ textAlign: 'end' }} className="w-full  mb-2">
                  <Link href={'/login/forget-password'} className="text-sm cursor-pointer text-muted-foreground  ">Forgot Password?</Link>
                </div>
                {isLoading ?
                  <>
                    <button disabled className="bgColor mb-2 w-full text-accent-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary hover:text-ink-inverse focus:outline-none">
                      Loading...
                    </button>
                  </> :
                  <>
                    <button type="submit" className="bgColor mb-2 w-full text-accent-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary hover:text-ink-inverse focus:outline-none">
                      Log In
                    </button>
                  </>}
                <div className="text-center text-neutral-600 mb-2">OR</div>

                <>
                  <Dialog>
                    <DialogContent>
                      <DialogHeader>
                        {thisEmail ?
                          <>
                            <DialogTitle>The login link will be sent at {thisEmail}</DialogTitle>
                            <DialogDescription>
                              <span className='text-xs text-muted-foreground'>Link will expire in 1 hour.</span>
                            </DialogDescription>
                          </>
                          :
                          <>
                            <DialogTitle>The login link will be sent to your email.</DialogTitle>
                            <DialogDescription>
                              <span className='text-xs text-muted-foreground'>Link will expire in 1 hour.</span>
                            </DialogDescription>
                            <form>
                              <div className="mb-4">
                                <label className="block text-ink-soft">Email <span className="text-destructive">*</span></label>
                                <input
                                  type="email"
                                  name="email"
                                  id="email"
                                  onChange={(e) => { setInputEmail(e.target.value) }}
                                  placeholder="Enter your email address"
                                  className="w-full p-3 border rounded-md focus:outline-none focus:border-accent"
                                />
                              </div>
                            </form>
                          </>
                        }
                        <div className='grid md:grid-cols-2 gap-2 justify-around'>
                          <DialogDescription>
                            <button onClick={() => loginThroughLink(thisEmail || inputEmail, 2)} className="bg-neutral-200 font-semibold text-foreground px-3 py-2 w-full rounded-md text-sm font-medium">
                              Sign me in as a Tradesperson
                            </button>
                          </DialogDescription>
                          <DialogDescription>
                            <button onClick={() => loginThroughLink(thisEmail || inputEmail, 1)} className="bg-accent font-semibold  w-full text-accent-foreground px-3 py-2 rounded-md text-sm font-medium">
                              Sign me in as a Customer
                            </button>
                          </DialogDescription>
                        </div>
                        <DialogDescription>
                          <span className='text-xs text-muted-foreground'>Select Your Role and Check your Email.</span>
                        </DialogDescription>
                        <DialogDescription>
                          {email_dilogerror && (
                            <p className="text-destructive-soft-foreground text-xs text-center">{email_dilogerror}</p>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </>

                <div className="">
                  {activeTab === "Customer" ? (
                    <div id="googlebtn" className="w-full flex justify-center">
                      <GoogleLoginButton className="w-full max-w-sm" />
                    </div>
                  ) : (
                    <div id="googlebtn1" className="w-full flex justify-center">
                      <GoogleLoginButton_TP className="w-full max-w-sm" />
                    </div>
                  )}
                </div>
              </form>

            </div>
            <button className="relative z-[1] mb-4 font-extrabold text-[17px] text-accent-foreground transition-all [transition-duration:250ms] overflow-hidden px-12 py-2 rounded-[15px] bgColor border-none group  md:hidden block" onClick={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}>
              <span className="absolute inset-0 w-0 bg-primary z-[-1] shadow-[4px_8px_19px_-3px_hsl(var(--shadow-strong))] transition-all [transition-duration:250ms] rounded-[15px] left-0 top-0 group-hover:w-full"></span>
              <span className="relative group-hover:text-ink-inverse -rotate-90">Switch user role</span>
            </button>
            <div className="bg-surface p-6 rounded-lg  w-full max-w-md border border-neutral-200">
              <h2 className="md:text-2xl text-xl font-bold ">New here?</h2>
              <p className="text-foreground mb-2 mt-2">

                Need help? &nbsp;

                <Link className='text-foreground font-bold border-b-2 border-accent' href="/login/hire-tradesperson">

                  Post a job for FREE now
                </Link>

              </p>
              <p className="text-foreground mb-4">

                Are you a tradesperson?&nbsp;

                <Link className='text-foreground font-bold  border-b-2 border-accent' href="/login/join-tradesperson">

                  Sign up
                </Link>
                &nbsp;to get local trade work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage