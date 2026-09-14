import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
    

        const { name, email, password, roleId , trade , postcode , distance} = await request.json();

        // Convert email to lowercase before storing
const normalizedEmail = email.toLowerCase();


        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ 
            where: { email: normalizedEmail } 
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,

                userID: existingUser.id,
                password: existingUser.password,
                exist : true,
                message: 'User already exists.',
            }, { status: 409 });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                roleId,
                
                trade : trade,
                postcode:postcode,
                distance:distance
            }
        });
        
        
        return NextResponse.json({
            success: true,
            userID: newUser.id,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                roleId: newUser.roleId,
            },
        }, { status: 201 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

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
  
        const { id } = await request.json();

        // Validate ID
        if (!id || typeof id !== 'string') {
            return NextResponse.json({
                success: false,
                message: 'Invalid user ID.',
            }, { status: 400 });
        }

        // Find and delete the user
        const deletedUser = await prisma.user.delete({
            where: { id: parseInt(id) }, // Ensure ID is an integer
        });

        if (!deletedUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Send response
        return NextResponse.json({
            success: true,
            message: 'User deleted successfully.',
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

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
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        // Validate input
        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email is required.',
            }, { status: 400 });
        }

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({
                success: true,
                exist: true,
                message: 'Email exists in the database.',
                userId: existingUser.id, // Optional: Include the user ID if needed
            }, { status: 200 });
        } else {
            return NextResponse.json({
                success: true,
                exist: false,
                message: 'Email does not exist in the database.',
            }, { status: 200 });
        }

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

export async function PUT(request) {
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
        const { userId, roleId } = await request.json();

        // Validate input
        if (!userId || !roleId) {
            return NextResponse.json({
                success: false,
                message: 'Both userId and roleId are required.',
            }, { status: 400 });
        }

        // Check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(userId) }, // Ensure userId is an integer
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Update the user's roleId
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { roleId: parseInt(roleId) }, // Ensure roleId is an integer
        });

        return NextResponse.json({
            success: true,
            message: 'User role updated successfully.',
            userID: updatedUser.id,
            password: updatedUser.password,
            exist : true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                roleId: updatedUser.roleId,
            },
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
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
        const { userEmail, roleId } = await request.json();

        // Validate input
        if (!userEmail || !roleId) {
            return NextResponse.json({
                success: false,
                message: 'Both userEmail and roleId are required.',
            }, { status: 400 });
        }

        // Check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail}, // Ensure userId is an integer
        });

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        // Update the user's roleId
        const updatedUser = await prisma.user.update({
            where: { email: userEmail },
            data: { roleId: parseInt(roleId) }, // Ensure roleId is an integer
        });

        return NextResponse.json({
            success: true,
            message: 'User role updated successfully.',
            userID: updatedUser.id,
            password: updatedUser.password,
            exist : true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                roleId: updatedUser.roleId,
            },
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}