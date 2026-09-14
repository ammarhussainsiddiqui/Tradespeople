'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveUserDetails, login } from '../../../../actions/auth'
import { useFormState } from "react-dom";
import { toast } from 'react-toastify';
import { useGlobalState } from '../../../../app/context/GlobalStateContext';

const cacheName = 'pwd-cache';
const VerifyEmail = () => {
    const router = useRouter();
    const [currentState, loginAction, isPending] = useFormState(login, {});
    const { pwdCache, setpwdCache } = useGlobalState();

    const saveToCache = async (email) => {
        setpwdCache(email)
        router.push(`/login/reset-pwd`);
    };
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get('token');
        const email = query.get('email');
        const id = query.get('id');
        if (id == 5) {
            saveToCache(email)
        } else {
            if (token && email && id) {
                validateToken(token, email, id);
            } else {
                window.location.replace('/login')
            }
        }

    }, []);


    const validateToken = async (token, email, id) => {
        try {
            // Validate the token with your server
            const passwordlessLogin = await fetch('/api/passwordlessLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ token, email, id }),
            });
            const data = await passwordlessLogin.json();

            const formDataEntries = new FormData();
            formDataEntries.append("email", data.user.email);
            formDataEntries.append("password", data.user.password);
            formDataEntries.append("roleId", id);

            const response = await loginAction(formDataEntries);

            if (response?.zod_errors) {
                toast.error('Verification failed', {
                    position: "top-center",
                });
                router.push('/login');
            } else if (response?.other) {
                toast.error('Verification failed', {
                    position: "top-center",
                });
                router.push('/login');
            }
        } catch (error) {
            toast.error('Verification failed', {
                position: "top-center",
            });
            router.push('/login');
        }
    };

    return (
        <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
            <div className="flex flex-col items-center justify-center  p-2 md:p-8">
                <h2 className="text-2xl font-semibold">Verifying your email...</h2>
            </div>
        </div>
    );
};

export default VerifyEmail;
