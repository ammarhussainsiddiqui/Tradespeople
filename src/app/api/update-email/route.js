import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient()

export async function PUT(request) {
  try {
 // Extract Authorization token from header
 const authHeader = request.headers.get('authorization');
 const token = authHeader && authHeader.split(' ')[1];
 
 // Authenticate user
 const authResult = await authenticateToken(token);
 if (authResult.error) {
     return NextResponse.json({
         success: false,
         message: authResult.error,
     }, { status: authResult.status });
 }


    const { userId, newEmail } = await request.json()

    // Validate input
    if (!userId || !newEmail) {
      return NextResponse.json({ error: "User ID and new email are required" }, { status: 400 })
    }

    const existingEmail = await prisma.user.findUnique({
        where: { email: newEmail },
      });
  
      if (existingEmail) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
      }
  
    // Update user email
    const updatedUser = await prisma.user.update({
      where: { id: Number.parseInt(userId) },
      data: { email: newEmail },
    })

    return NextResponse.json({ message: "Email updated successfully", user: updatedUser })
  } catch (error) {
    Sentry.captureException("Error updating user email:", error);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 })
  }
}

