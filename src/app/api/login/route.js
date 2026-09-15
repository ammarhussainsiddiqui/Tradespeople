import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authenticateToken from "../../authenticateToken";
import * as Sentry from "@sentry/nextjs";
const prisma = new PrismaClient();
const JWT_SECRET = (process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET);

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  const authResult = await authenticateToken(token);

  if (authResult.error) {
    return NextResponse.json(
      {
        success: false,
        message: authResult.error,
      },
      { status: authResult.status }
    );
  }
  try {
    const { email, password, roleId } = await request.json();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        SubscriptionType: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Validate password
    const isMatch =
      (await bcrypt.compare(password, user.password)) ||
      password == user.password
        ? true
        : false;
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }
    
    const expirationTime = Number(roleId) === 1 ? '1h' : '1w';
      const token = jwt.sign({ userId: user.id, role: roleId }, JWT_SECRET, {
      expiresIn: expirationTime
    });
    return NextResponse.json(
      {
        success: true,
        token,
        user,
        fresh: password === "00000" ? true : false,
      },
      { status: 200 }
    );
    
  } catch (error) {
    Sentry.captureException("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
