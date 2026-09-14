import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();
function flattenArray(array) {
    if (!Array.isArray(array)) {
        throw new Error("Input must be an array");
    }
    return array.reduce((acc, item) => {
      if (Array.isArray(item)) {
        const isValid = item.every((el) => typeof el === "string");
        if (!isValid) {
          throw new Error("Inner array contains invalid elements");
        }
        acc.push(...item);
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
}
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

        const { page, pageSize, userId ,areafilter} = await request.json();
        const resultAreafilter = flattenArray(areafilter);
        if (!page) {
            return NextResponse.json({
                success: false,
                message: 'Page number not found.',
            }, { status: 400 });
        }
        
        const skip = (page - 1) * (pageSize || 5); 
        const take = pageSize || 5;
        
        if(resultAreafilter.length > 0){
            const Jobs = await prisma.viewed_leads.findMany({
                where: {
                    tradepersonId: userId,
                    job: {
                        // statusId: { not: parseInt(process.env.DELETED_STATUS_ID) },
                        OR: resultAreafilter.map((segment) => ({
                          postcode: {
                            startsWith: segment,
                            mode: "insensitive", 
                          },
                        })),
                    },
                },
                include: {
                    User:true,
                    job:{
                        include:{
                            service:true,
                            user:true,
                            jobStatus: true, // Include jobStatus relation to fetch status name
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc' 
                },
                skip: skip,
                take: take,
            });
    
            const jobsWithServices = Jobs.map(job => ({
                ...job,
                mainTrade: job.job.service.MainTradeId, 
                serviceType: job.job.service.type,
                postcode: job.job.postcode,
                userDetail: job.User.firstName,
                userImage: job.User.profileUrl,
                phone: job.User.phone,
                status: job.job.jobStatus?.status || "Unknown", // Add status field
            }));
            
            // Calculate total filtered job count
            const totalJobsCount = await prisma.viewed_leads.count({
                where: {
                    tradepersonId: userId,
                    job: {
                        // statusId: { not: parseInt(process.env.DELETED_STATUS_ID) },
                        OR: resultAreafilter.map((segment) => ({
                          postcode: {
                            startsWith: segment,
                            mode: "insensitive", 
                          },
                        })),
                    },
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
        }else{
            const Jobs = await prisma.viewed_leads.findMany({
                where: {
                    tradepersonId: userId,
                    // job:{
                    //     statusId:{ not: parseInt(process.env.DELETED_STATUS_ID) }
                    // }
                },
                include: {
                    User:true,
                    
                    job:{
                        include:{
                            service:true,
                            user:true,
                            jobStatus: true, // Include jobStatus relation to fetch status name
                            
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc' 
                },
                skip: skip,
                take: take,
            });
    
            const jobsWithServices = Jobs.map(job => ({
                ...job,
                mainTrade: job.job.service.MainTradeId, 
                serviceType: job.job.service.type,
                postcode: job.job.postcode,
                userDetail: job.User.firstName,
                userImage: job.User.profileUrl,
                phone: job.User.phone,
                status: job.job.jobStatus?.status || "Unknown", // Add status field
            }));
            
            // Calculate total filtered job count
            const totalJobsCount = await prisma.viewed_leads.count({
                where: {
                    tradepersonId: userId,
                    // job:{
                    //     statusId:{ not: parseInt(process.env.DELETED_STATUS_ID) }
                    // }
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
        }
        

    } catch (error) {
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}
