// Server-only session helpers shared by API routes and server actions.
// Never import this from a client component: it reads the JWT secret.
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// JWT_SECRET is the server-only name. NEXT_PUBLIC_JWT_SECRET is still read so
// existing deployments keep working until the env var is renamed and rotated.
export const getJwtSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET);

// Returns the verified payload, or null for a missing, forged or expired token.
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

// Login tokens carry the user record; other flows only carry an email.
// Anonymous tokens from generateToken() carry neither and resolve to null.
export async function resolveUser(payload) {
  if (!payload) return null;

  const id = Number(payload.user?.id ?? payload.id ?? payload.userId);
  if (Number.isInteger(id) && id > 0) {
    return { id, role: payload.role ?? payload.user?.roleId ?? null };
  }

  const email = payload.email ?? payload.user?.email;
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, roleId: true },
    });
    if (user) return { id: user.id, role: user.roleId };
  }

  return null;
}

// The logged-in user for an API request: the Bearer token if it identifies a
// user, otherwise the httpOnly `jwt` cookie that same-origin fetches send.
export async function getRequestUser(request) {
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;

  const fromBearer = await resolveUser(await verifySessionToken(bearer));
  if (fromBearer) return fromBearer;

  const cookieToken = request.cookies?.get?.("jwt")?.value;
  return resolveUser(await verifySessionToken(cookieToken));
}

export const unauthorized = () =>
  NextResponse.json({ success: false, message: "Please log in again." }, { status: 401 });

export const forbidden = () =>
  NextResponse.json({ success: false, message: "You don't have access to this." }, { status: 403 });
