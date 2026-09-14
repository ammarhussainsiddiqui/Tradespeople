import { jwtVerify } from "jose";
import * as Sentry from '@sentry/nextjs';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

const authenticateToken = async (token) => {
  try {
    // Check if the token is provided
    if (!token) {
      return { error: 'Token missing', status: 401 };
    }

    // Verify the JWT token
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    // Extract the payload (user data) from the verified token
    const { payload } = verified;

    // Check for token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      return { error: 'Token expired', status: 403 };
    }

    // Return the user data if the token is valid and not expired
    return { status: 200 };
  } catch (error) {
    Sentry.captureException('JWT verification failed:', error);
    

    // Handle invalid or expired tokens
    return { error: 'Invalid or expired token', status: 403 };
  }
};

export default authenticateToken;
