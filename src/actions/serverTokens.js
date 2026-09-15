"use server";
// These used to live in utils/functions.js, which client components import,
// so the JWT secret and Stripe secret key were bundled into browser JavaScript.
// As server actions they run on the server and the secrets never leave it.
import { SignJWT } from "jose";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { getJwtSecret, resolveUser, verifySessionToken } from "../lib/auth/session";

const prisma = new PrismaClient();

export async function generateToken() {
  // Get the current time in seconds (Unix timestamp)
  const currentTime = Math.floor(Date.now() / 1000);

  // Set token expiration time (1 hour from current time)
  const expirationTime = currentTime + 60 * 60;

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(currentTime)
    .setExpirationTime(expirationTime)
    .sign(getJwtSecret());
}

// Cancels a Stripe subscription, but only one that belongs to the logged-in user.
export async function deleteSubscription(subsId) {
  const user = await resolveUser(await verifySessionToken(cookies().get("jwt")?.value));
  if (!user) throw new Error("Not authenticated");

  const owned = await prisma.subscription.findUnique({
    where: { subsid: subsId },
    select: { userid: true },
  });
  if (!owned || owned.userid !== user.id) throw new Error("Subscription not found");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
  const subscription = await stripe.subscriptions.cancel(subsId);
  return { id: subscription.id, status: subscription.status };
}
