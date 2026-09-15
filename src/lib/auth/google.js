// Server-only: verifies a Google Sign-In ID token against Google's public keys.
import { createRemoteJWKSet, jwtVerify } from "jose";
import { GOOGLE_CLIENT_ID } from "./googleClientId";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

// Returns the verified Google profile, or null if the token is missing, forged,
// expired, issued for another app, or the email isn't verified.
export async function verifyGoogleCredential(credential) {
  if (typeof credential !== "string" || !credential) return null;
  try {
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: GOOGLE_CLIENT_ID,
    });
    if (!payload.email || payload.email_verified !== true) return null;
    return {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      profilePicture: payload.picture,
    };
  } catch {
    return null;
  }
}
