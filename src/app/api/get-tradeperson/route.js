import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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
        const headers = new Headers();
        headers.set('Cache-Control', 'no-store, max-age=0');

        // Parse the request body to get page and pageSize
        const { page = 1, pageSize = 5 , myjob} = await request.json(); // Default page 1 and pageSize 10 if not provided
        const skip = (page - 1) * pageSize;
        
        const filterTrade = myjob?.job?.service?.mainTrade?.type;
        const filterService = myjob?.job?.service?.type;
        if(filterTrade == 'Other'){
            const tradepersonDetails = await prisma.user.findMany({
                where: { 
                    subscription: true ,
                    // firstName: { not: null },
                    // lastName: { not: null },
                    profileUrl:{ not: null }, 
                },
                include: {
                    tradepersonDetails: true, 
                    tradeService: {
                        include: {
                            Service: true, 
                        },
                    },
                    tradeLocation: true,  
                },
                skip: skip,
                take: pageSize,
            });
    
            // Count total tradepersons that match the filter
            const totalTradepersonsCount = await prisma.user.count({
                where: { subscription: true , 
                    // firstName: { not: null },
                    // lastName: { not: null },
                    profileUrl:{ not: null },
                },
            });
            // If no tradepersons are found, return a message
            if (!tradepersonDetails || tradepersonDetails.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No tradepersons found',
                }, { status: 200 });
            }
    
            // Return the paginated tradepersons details and pagination info
            return NextResponse.json({
                success: true,
                data: tradepersonDetails,
                pagination: {
                    totalItems: totalTradepersonsCount,
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(totalTradepersonsCount / pageSize),
                },
            }, { status: 200 });
        }else{
            const tradepersonDetails = await prisma.user.findMany({
                where: { 
                    subscription: true ,
                    // firstName: { not: null },
                    // lastName: { not: null },
                    profileUrl:{ not: null },
                    OR: [
                        { trade: filterTrade }, // Match the trade field
                        { tradeService: {
                            some: { // Use 'some' to check for at least one matching tradeService
                                Service: {
                                    type: filterService
                                }
                            }
                        }}
                    ]
                    
                },
                include: {
                    tradepersonDetails: true, 
                    tradeService: {
                        include: {
                            Service: true, 
                        },
                    },
                    tradeLocation: true,  
                },
                skip: skip,
                take: pageSize,
            });
    
            // Count total tradepersons that match the filter
            const totalTradepersonsCount = await prisma.user.count({
                where: { subscription: true , 
                    // firstName: { not: null },
                    // lastName: { not: null },
                    profileUrl:{ not: null },
                    OR: [
                        { trade: filterTrade }, // Match the trade field
                        { tradeService: {
                            some: { // Use 'some' to check for at least one matching tradeService
                                Service: {
                                    type: filterService
                                }
                            }
                        }}
                    ]
                },
            });
            // If no tradepersons are found, return a message
            if (!tradepersonDetails || tradepersonDetails.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: 'No tradepersons found',
                }, { status: 200 });
            }
    
            // Return the paginated tradepersons details and pagination info
            return NextResponse.json({
                success: true,
                data: tradepersonDetails,
                pagination: {
                    totalItems: totalTradepersonsCount,
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(totalTradepersonsCount / pageSize),
                },
            }, { status: 200 });
        }
   

    } catch (error) {
        Sentry.captureException('Error fetching tradepersons:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
