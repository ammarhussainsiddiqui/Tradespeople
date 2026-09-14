
import { SignJWT } from 'jose';
import Stripe from 'stripe';


export const timeAgo = (createdAt) => {
    const now = Date.now();
    const difference = now - new Date(createdAt).getTime(); // time difference in milliseconds
  
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) return `${days}d${days > 1 ? '' : ''} ago`;
    if (hours > 0) return `${hours}h${hours > 1 ? '' : ''} ago`;
    if (minutes > 0) return `${minutes}min${minutes > 1 ? '' : ''} ago`;
    return `${seconds}sec${seconds > 1 ? '' : ''} ago`;
  };
  


const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);


export const generateToken = async () => {
  // Get the current time in seconds (Unix timestamp)
  const currentTime = Math.floor(Date.now() / 1000);

  // Set token expiration time (1 hour from current time)
  const expirationTime = currentTime + 60 * 60; // 1 hour = 60 minutes * 60 seconds

  // Create the JWT
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' }) // Set the algorithm
    .setIssuedAt(currentTime) // Set issued time (iat)
    .setExpirationTime(expirationTime) // Set expiration time (exp)
    .sign(new TextEncoder().encode(JWT_SECRET)); // Sign the token with the secret

  return token;
};


export const isValidUKPostalCode =(postalCode) => {
  // Normalize the postal code by removing any extra spaces
  postalCode = postalCode?.replace(/\s+/g, '').toUpperCase();

  // Insert a space before the last three characters
  if (postalCode?.length > 3) {
    postalCode = postalCode?.slice(0, -3) + ' ' + postalCode?.slice(-3);
  }

  const regex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
  return regex.test(postalCode);
}

export const deleteSubscription = async (subsId)=>{
  const subscription = await stripe.subscriptions.cancel(subsId);
  return subscription;
}

