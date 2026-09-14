import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
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
    const { tradepersonId, JobId } = await request.json();
    // Validate input data
    if (!tradepersonId || !JobId) {
      return NextResponse.json({
        success: false,
        message: 'Tradeperson ID and Job ID are required.',
      }, { status: 400 });
    }

    // Check if lead already exists to prevent duplicates
    const existingLead = await prisma.viewed_leads.findFirst({
      where: {tradepersonId: tradepersonId,JobId: JobId },
    });

    if (existingLead) {
      return NextResponse.json({
        success: false,
        message: 'Lead already viewed.',
      }, { status: 409 }); // Conflict status code for already existing records
    }

    // Insert the viewed lead record
    const viewedLead = await prisma.viewed_leads.create({
      data:  {tradepersonId: tradepersonId,JobId: JobId },
    });

    return NextResponse.json({
      success: true,
      message: 'Viewed lead created successfully.',
      viewedLead,
    }, { status: 201 });

  } catch (error) {
    Sentry.captureException('Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create viewed lead.',
      details: error.message,
    }, { status: 500 });
  }
}



export async function PATCH(request) {
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
    const { tradepersonId, JobId } = await request.json();

    // Validate input data
    if (!tradepersonId || !JobId) {
      return NextResponse.json({
        success: false,
        message: 'Tradeperson ID and Job ID are required.',
      }, { status: 400 });
    }
    
    // Check if the lead has been viewed
    const existingLead = await prisma.viewed_leads.findFirst({
      where: { tradepersonId, JobId },
    });
    
    if (existingLead) {
      return NextResponse.json({
        success: true,
        message: 'Lead has already been viewed.',
        viewed: true,
      }, { status: 200 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Lead has not been viewed yet.',
      viewed: false,
    },{ status: 201 });

  } catch (error) {
    Sentry.captureException('Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to viewed lead.',
      details: error.message,
    }, { status: 500 });
  }
}
