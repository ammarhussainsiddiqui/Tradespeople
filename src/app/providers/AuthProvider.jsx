"use client";

import dynamic from "next/dynamic";

const GoogleOAuthProvider = dynamic(
    () =>
        import("@react-oauth/google").then(
            (mod) => mod.GoogleOAuthProvider
        ),
    { ssr: false }
);

export default function AuthProvider({ children }) {
    return (
        <GoogleOAuthProvider
            clientId="429629164570-fhm2b2njo7sad1tae89n5t4q4qjdaaut.apps.googleusercontent.com"
        >
            {children}
        </GoogleOAuthProvider>
    );
}
