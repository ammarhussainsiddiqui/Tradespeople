import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    const response = user !== null
      ? {
            success: "true",
            message: "User found.",
          }
      : {
          success: "false",
          message: "User not found.",
        };

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Allow all origins
      "Access-Control-Allow-Methods": "GET, OPTIONS", // Allowed HTTP methods
      "Access-Control-Allow-Headers": "Content-Type, Authorization", // Allowed headers
    };

    return NextResponse.json(response, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    Sentry.captureException("Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error.message}`, // Include error message in the response
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204, // No Content
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
