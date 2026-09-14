import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  const authResult = await authenticateToken(token);
  
  if (authResult.error) {
      return NextResponse.json({
        success: false,
        message: authResult.error,
      }, { status: authResult.status });
  }
  try {
    const { email } = await request.json();
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user !== null) {
      if (user?.roleId === 1) {
        return NextResponse.json(
          {
            success: "true",
            message: "User found.",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: "exist",
            message: "User already exist!",
          },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: "false",
          message: "User not found.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    Sentry.captureException("Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error.message}`, // Include error message in the response
      },
      { status: 500 }
    );
  }
}
