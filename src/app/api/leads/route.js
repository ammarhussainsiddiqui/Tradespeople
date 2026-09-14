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

        // Parse body to get page, pageSize, and other filters
        const { page, pageSize, mainData, user } = await request.json();
        
        if (!page) {
            return NextResponse.json({
                success: false,
                message: 'Page number not found.',
            }, { status: 400 });
        }
        
        const skip = (page - 1) * (pageSize || 5);  // Default to 5 items per page if pageSize not provided
        const take = pageSize || 5;

        // Fetch user details and filter by user's service and location
        const userDetails = await prisma.user.findFirst({
            where: { id: user.id },
            include: {
                tradeService: { include: { Service: true } },
                tradeLocation: true
            }
        });

        if (!userDetails) {
            return NextResponse.json({
                success: false,
                message: 'User not found.',
            }, { status: 404 });
        }

        const serviceIds = userDetails.tradeService.map(service => service.Service.type);
        // Retrieve jobs with filtering, pagination, and relational data
        const incompleteJobs = await prisma.jobs.findMany({
            where: {
                isCompleted: false,
                OR : [
                    {service: 
                        {
                            mainTrade: {
                                type:"Other"
                               }
                        }
                    },
                    {service: 
                        {
                            mainTrade: {
                                type:userDetails.trade
                               }
                        }
                    },
                    {service: 
                        {
                        type: { in: serviceIds },
                        }
                    },
                    {service: 
                        {
                        type:"Other"
                        }
                    }
                ]
            },
            include: {
                service: { include: { mainTrade: true } },
                user: true,
            },
            orderBy: {
                createdAt: 'desc' 
            },
            skip: skip,
            take: take,
        });

        // Transform job data for response
        const jobsWithServices = incompleteJobs.map(job => ({
            ...job,
            mainTrade: job.service.mainTrade, 
            serviceType: job.service.type,
            postcode: job.job.postcode,
            userDetail: job.user.firstName,
            userImage: job.user.profileUrl,
            phone: job.user.phone,
        }));
        
        // Calculate total filtered job count
        const totalJobsCount = await prisma.jobs.count({
            where: {
                isCompleted: false,
                OR : [
                    {service: 
                        {
                            mainTrade: {
                                type:"Other"
                               }
                        }
                    },
                    {service: 
                        {
                            mainTrade: {
                                type:userDetails.trade
                               }
                        }
                    },
                    {service: 
                        {
                        type: { in: serviceIds },
                        }
                    },
                    {service: 
                        {
                        type:"Other"
                        }
                    }
                ]
            },
        });

        return NextResponse.json({
            success: true,
            jobs: jobsWithServices,
            pagination: {
                totalJobs: totalJobsCount,
                page: page,
                pageSize: pageSize || 5,
                totalPages: Math.ceil(totalJobsCount / (pageSize || 5)),
            }
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
