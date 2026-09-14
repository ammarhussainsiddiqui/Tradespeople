import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import { getSignedUrlFromS3 } from '../../../utils/imageUploads';
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
        // Fetch all users
        const users = await prisma.user.findMany({
            include: {
                SubscriptionType: true,
            },
        });

        // Separate users into roleId 1 and roleId 2 arrays
        const usersWithRole1 = [];
        const usersWithRole2 = [];

        for (const user of users) {
            // const signedImageUrl = await getSignedUrlFromS3(user?.profileUrl);
            // user.profileUrl = signedImageUrl;

            if (user.roleId === 1) {
                usersWithRole1.push(user);
            } else if (user.roleId === 2) {
                usersWithRole2.push(user);
            }
        }

        // Send response with separate roleId arrays
        return NextResponse.json({
            success: true,
            usersWithRole1,  // Users with roleId 1
            usersWithRole2,  // Users with roleId 2
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}