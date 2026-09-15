"use client";
import Logomark from '../layout/Logomark';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import Notification from "../../components/Notification";
import { getUserDetails, logout } from '../../actions/auth';
import ThemeToggle from '../ui/theme-toggle';
import EmailChangeDialog from "../EmailChangeDialog"

const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [isOpenmin, setIsOpenmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState();
    const [user, setUser] = useState();
    const [userProfile, setUserProfile] = useState();

    const [Email, setEmail] = useState("");
    const [showEmailDialog, setShowEmailDialog] = useState(false)
    const [isCrossClicked, setIsCrossClicked] = useState(false); // New state
    const handleCloseEmailDialog = () => {
        setShowEmailDialog(false);
        setIsCrossClicked(true); // Set to true only when the cross button is clicked
    };

    const getUserUsingId = async (id) => {
        const jwt = await getUserDetails();
        try {
            const response = await fetch('/api/get-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt?.token}`,
                },
                body: JSON.stringify({ id: id }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();

            if (data.success) {
                setUserProfile(data.user.profileUrl)
            }
        } catch (error) {
        }
    }

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
                setUserName(userDetails.name || 'User');
            } else {
                setIsLoggedIn(false);
            }
        };
        fetchUserDetails();

    }, []); // Dependency array ensures this runs only once when the component mounts

    const handleLogout = async () => {
        handleClick()
        sessionStorage.clear();
        await logout();
        setIsLoggedIn(false);
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

    return (
        <>
            <nav className="border-b border-neutral-200 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link href={'/'}>
                            <Logomark className="h-8 w-8" />
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-4">
                        <div className="hidden md:flex space-x-4">

                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        {isLoggedIn ? (
                            <>
                                <Notification />
                                <DropdownMenu
                                    open={isOpenmin}>
                                    <DropdownMenuTrigger
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <Avatar>
                                            <AvatarImage
                                                src={userProfile || 'https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg'}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                            />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <Link onClick={handleClick} href={`/user/profile`}>
                                            <DropdownMenuItem className="cursor-pointer">
                                                Profile Settings
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuSeparator />
                                        <Link onClick={handleClick} href="/user/myjobs"  >
                                            <DropdownMenuItem className="cursor-pointer">
                                                My Jobs
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuSeparator />
                                        <a
                                            onClick={() => {
                                                setShowEmailDialog(true)
                                                handleClick()
                                            }}
                                        >
                                            <DropdownMenuItem className="text-foreground text-sm font-medium cursor-pointer hover:bg-neutral-200 rounded-lg">
                                                Change email
                                            </DropdownMenuItem>
                                        </a>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer">
                                            <button onClick={handleLogout} className="text-destructive-soft-foreground text-sm font-medium">
                                                Log Out
                                            </button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className="md:hidden flex items-center">
                        <div className='p-2'>
                            <Notification />
                        </div>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-ink-soft hover:text-foreground focus:outline-none">
                            <Menu />


                        </button>
                    </div>
                </div>
                {/* Viewport-sized clip so the off-screen drawer can't widen the page on mobile. */}
                <div className="fixed inset-0 z-20 overflow-hidden pointer-events-none md:hidden">
                <div className={`absolute inset-0 bg-secondary shadow-2xl rounded-lg transform pointer-events-auto ${isOpen ? "translate-x-0" : "translate-x-full invisible"} transition-[transform,visibility] duration-300 ease-in-out`}>
                    <div className='flex justify-between'>
                        <div className='p-4 text-lg font-semibold'>
                            <Link href={'/'}>
                                <Logomark className="h-8 w-8" />
                            </Link>
                        </div>


                        <button onClick={() => setIsOpen(false)}
                            className="text-foreground font-semibold flex  hover:text-foreground focus:outline-none absolute top-4 right-4">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {isOpen ? 'Close' : ''}
                        </button>
                    </div>

                    <div style={{ lineHeight: '12px' }} className="mt-10 text-bold space-y-4 ">


                        <Link href="/user/myjobs" onClick={() => setIsOpen(false)} className="block px-4 py-2  font-bold text-[17px] text-foreground ">
                            My Jobs
                        </Link>


                        <Link href={`/user/profile`} onClick={() => setIsOpen(false)} className="block px-4 py-2  font-bold text-[17px]  text-foreground ">

                            Profile Settings
                        </Link>
                        <a
                            onClick={() => {
                                setShowEmailDialog(true)
                            }}
                            className='block px-4 py-2  font-bold text-[17px]  text-foreground '
                        >
                            Change email
                        </a>
                        <Link href={`https://tradepeople.co.uk/help-center/`} target='_blank' className="block px-4 py-2  font-bold text-[17px]  text-foreground ">

                            Help Center
                        </Link>
                        <Link href={`/login`} onClick={handleLogout} className="block px-4 py-2  font-bold text-[17px]  text-foreground ">

                            Log Out
                        </Link>
                        <div className='justify-center'>

                        </div>
                    </div>
                </div>
                </div>
            </nav>
            <EmailChangeDialog
                isOpen={showEmailDialog}
                onClose={handleCloseEmailDialog} // Pass the custom close handler
                currentEmail={user?.email || ""}
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

