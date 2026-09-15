"use client";

import dynamic from "next/dynamic";
import { GOOGLE_CLIENT_ID } from "../../lib/auth/googleClientId";

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
            clientId={GOOGLE_CLIENT_ID}
        >
            {children}
        </GoogleOAuthProvider>
    );
}
