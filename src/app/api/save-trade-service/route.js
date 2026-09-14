import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

// GET: Fetch all services for a specific user
export async function GET(request) {
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
        const url = new URL(request.url);
        const userId = parseInt(url.searchParams.get('userId'), 10);

        if (isNaN(userId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid or missing userId.',
            }, { status: 400 });
        }

        // Fetch all services for the given userId
        const services = await prisma.tradeService.findMany({
            where: { userId },
            include: {
                Service: true, // Include related service details
            },
        });

        return NextResponse.json({
            success: true,
            services,
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error fetching services:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

// POST: Create a new service for a user
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
        const { serviceId, userId } = await request.json();

        if (!serviceId || !userId) {
            return NextResponse.json({
                success: false,
                message: 'Service ID and User ID are required.',
            }, { status: 400 });
        }

        // Check if the service already exists for the user
        const existingService = await prisma.tradeService.findFirst({
            where: {
                serviceId,
                userId,
            },
        });

        if (existingService) {
            return NextResponse.json({
                success: false,
                message: 'Service already exists for this user.',
                service: existingService,
            }, { status: 409 }); // 409 Conflict status code
        }

        // Create a new service in the database
        const newService = await prisma.tradeService.create({
            data: {
                serviceId,
                userId,
            },
        });

        return NextResponse.json({
            success: true,
            service: newService,
        }, { status: 201 });
    } catch (error) {
        Sentry.captureException('Error creating service:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}


// DELETE: Remove a service by ID
export async function DELETE(request) {
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
        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());
        const id = parseInt(params.id, 10); 

        if (isNaN(id)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid service ID.',
            }, { status: 400 });
        }

        // Delete the service by ID
        const deletedService = await prisma.tradeService.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Service deleted successfully.',
            service: deletedService,
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException('Error deleting service:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
export async function PUT(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
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
    const { trade, id } = await request.json();

    if (!trade || !id) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID and trade are required.',
        },
        { status: 400 }
      );
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        trade,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Trade updated successfully.',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error.',
      },
      { status: 500 }
    );
  }
}
