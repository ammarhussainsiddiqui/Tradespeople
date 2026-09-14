import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

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
        const idsParam = searchParams.get('ids'); 

        if (!idsParam) {
            return NextResponse.json({
                success: false,
                message: 'IDs parameter is required',
            }, { status: 400 });
        }

        const cleanedIdsParam = idsParam.replace(/\[|\]/g, ''); 
        const ids = cleanedIdsParam.split(',').map(id => Number(id.trim()));

        // Fetch user details excluding the password
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: ids, // Filter by the provided IDs
                },
            },
            select: {
                id: true,
                profileUrl: true,
                firstName: true,
                lastName: true,
                name: true,
                username: true,
                phone: true,
                email: true,
                introduction: true,
                understand: true,
                postcode: true,
                trade: true,
                distance: true,
                tradepersonDetails: {
                    select: {
                        info: true,
                    },
                },
                tradeService: {
                    select: {
                        Service: {
                            select: {
                                id: true,
                                type: true,
                            },
                        },
                    },
                },
                tradeLocation: {
                    select: {
                        postcode: true,
                        distance: true,
                    },
                },
            },
        });

        if (users.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No user details found for the provided IDs',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: users,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
