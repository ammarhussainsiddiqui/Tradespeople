import { verifySessionToken } from "../lib/auth/session";

// Verifies a Bearer token. `payload` is included so routes can check who is calling.
const authenticateToken = async (token) => {
  // Check if the token is provided
  if (!token) {
    return { error: 'Token missing', status: 401 };
  }

  // jwtVerify rejects forged and expired tokens
  const payload = await verifySessionToken(token);
  if (!payload) {
    return { error: 'Invalid or expired token', status: 403 };
  }

  return { status: 200, payload };
};

export default authenticateToken;
