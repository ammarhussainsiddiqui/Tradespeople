import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import { areaSegments } from '../../../actions/auth';
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
function getValuesBySegments(array, segments) {
    const matchingLabels = array
    .filter((item) => {
      if (Array.isArray(item.value)) {
        // Check if the value array contains any of the segments
        return item.value.some((val) => segments.includes(val));
      } else {
        // Direct comparison for string values
        return segments.includes(item.value);
      }
    })
    .map((item) => item.label); // Extract only the labels

  return matchingLabels;
}
function getArray(array,segment) {
    const segmentResult = array.find((item) => item.label === segment);
    const finalArray = getValuesBySegments(array , segmentResult.value) 
   return finalArray;
}

export async function POST(request) {
    const areas = await areaSegments();
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
        const { page, pageSize, mainData, user, areafilter } = await request.json();
        const resultAreafilter = flattenArray(areafilter);
        if(resultAreafilter.length > 0){
            if (!page) {
                return NextResponse.json({
                    success: false,
                    message: 'Page number not found.',
                }, { status: 400 });
            }
            const skip = (page - 1) * (pageSize || 5);  
            const take = pageSize || 5;
    
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
           

            const tradeLocationPostcodes = [
                userDetails.postcode, // Add userDetails.postcode
                ...userDetails.tradeLocation.map(location => location.postcode),
            ];
           
            const generateRange = (prefix, start, end) => Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
    
            const matchingValues = areas.filter(area =>
                tradeLocationPostcodes.some(
                    postcode => postcode.toLowerCase() === area.label.toLowerCase()
                )
            ).flatMap(area => {
                if (area.value === "E") {
                    return generateRange("E", 1, 20); // Add E1 to E20
                }
                if (area.value === "W") {
                    return generateRange("W", 1, 14); // Add W1 to W14
                }
                if (area.value === "N") {
                    return generateRange("N", 1, 22); // Add N1 to N22
                }
                return area.value; // Add regular values
            });
    
            const uniqueMatchConditionValues = [...new Set(matchingValues)];
    
            const matchCondition = [];
            tradeLocationPostcodes.forEach(postcode => {
                const firstLetter = postcode.charAt(0).toUpperCase(); // First letter
                const secondChar = postcode.charAt(1); // Second character
                const prefix = postcode.slice(0, 2).toUpperCase(); // First two characters
    
                // Determine match condition
                if (!isNaN(secondChar)) {
                    matchCondition.push(prefix);
                } else {
                    matchCondition.push(prefix);
                }
            });
    
            const incompleteJobs = await prisma.jobs.findMany({
                where: {
                    isCompleted: false,
                   // statusId: { not: parseInt(process.env.DELETED_STATUS_ID) },
                   statusId: { notIn: [parseInt(process.env.DELETED_STATUS_ID), parseInt(process.env.CLOSED_STATUS_ID)] },

                   // OR: resultAreafilter.map(condition => ({
                    OR: uniqueMatchConditionValues.map((condition) => ({
                        postcode: {
                            startsWith: condition,
                            mode: "insensitive",
                        },
                    })),
                    AND: [{
                        OR: [
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: "Other"
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: userDetails.trade
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    type: { in: serviceIds },
                                }
                            },
                            {
                                service:
                                {
                                    type: "Other"
                                }
                            }
                        ],
                    }]
                },
                include: {
                    service: { include: { mainTrade: true } },
                    user: true,
                    jobStatus: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: skip,
                take: take,
            });
    
            const jobsWithServices = incompleteJobs.map(job => ({
                ...job,
                mainTrade: job.service.mainTrade,
                serviceType: job.service.type,
                postcode: job.job.postcode,
                userDetail: job.user.firstName,
                userImage: job.user.profileUrl,
                phone: job.user.phone,
                status: job.jobStatus?.status || "Unknown", // Add status field
            }));
            
    
            const totalJobsCount = await prisma.jobs.count({
                where: {
                    isCompleted: false,
                    //statusId: { not: parseInt(process.env.DELETED_STATUS_ID) },
                    statusId: { notIn: [parseInt(process.env.DELETED_STATUS_ID), parseInt(process.env.CLOSED_STATUS_ID)] },

                    OR: resultAreafilter.map(condition => ({
                        postcode: {
                            startsWith: condition,
                            mode: "insensitive",
                        },
                    })),
                    AND: [{
                        OR: [
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: "Other"
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: userDetails.trade
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    type: { in: serviceIds },
                                }
                            },
                            {
                                service:
                                {
                                    type: "Other"
                                }
                            }
                        ],
                    }]
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
            if (!page) {
                return NextResponse.json({
                    success: false,
                    message: 'Page number not found.',
                }, { status: 400 });
            }
            const skip = (page - 1) * (pageSize || 5);  
            const take = pageSize || 5;
    
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

            const userTrafeFilter = getArray(areas,userDetails.postcode);
          

            const tradeLocationPostcodes = [
                ...userTrafeFilter.map(location => location),
                ...userDetails.tradeLocation.map(location => location.postcode),
            ];
            const generateRange = (prefix, start, end) => Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
    
            const matchingValues = areas.filter(area =>
                tradeLocationPostcodes.some(
                    postcode => postcode.toLowerCase() === area.label.toLowerCase()
                )
            ).flatMap(area => {
                if (area.value === "E") {
                    return generateRange("E", 1, 20); // Add E1 to E20
                }
                if (area.value === "W") {
                    return generateRange("W", 1, 14); // Add W1 to W14
                }
                if (area.value === "N") {
                    return generateRange("N", 1, 22); // Add N1 to N22
                }
                return area.value; // Add regular values
            });
    
            const uniqueMatchConditionValues = [...new Set(matchingValues)];
    
            const matchCondition = [];
            tradeLocationPostcodes.forEach(postcode => {
                const firstLetter = postcode.charAt(0).toUpperCase(); // First letter
                const secondChar = postcode.charAt(1); // Second character
                const prefix = postcode.slice(0, 2).toUpperCase(); // First two characters
    
                // Determine match condition
                if (!isNaN(secondChar)) {
                    matchCondition.push(prefix);
                } else {
                    matchCondition.push(prefix);
                }
            });
    
            const incompleteJobs = await prisma.jobs.findMany({
                where: {
                    isCompleted: false,
                    //statusId: { not: parseInt(process.env.DELETED_STATUS_ID) },
                    statusId: { notIn: [parseInt(process.env.DELETED_STATUS_ID), parseInt(process.env.CLOSED_STATUS_ID)] },

                    OR: uniqueMatchConditionValues.map(condition => ({
                        postcode: {
                            startsWith: condition,
                            mode: "insensitive",
                        },
                    })),
                    AND: [{
                        OR: [
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: "Other"
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: userDetails.trade
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    type: { in: serviceIds },
                                }
                            },
                            {
                                service:
                                {
                                    type: "Other"
                                }
                            }
                        ],
                    }]
                },
                include: {
                    service: { include: { mainTrade: true } },
                    user: true,
                    jobStatus: true, // Include jobStatus relation to fetch status name
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: skip,
                take: take,
            });
    
            const jobsWithServices = incompleteJobs.map(job => ({
                ...job,
                mainTrade: job.service.mainTrade,
                serviceType: job.service.type,
                postcode: job.job.postcode,
                userDetail: job.user.firstName,
                userImage: job.user.profileUrl,
                phone: job.user.phone,
                status: job.jobStatus?.status || "Unknown", // Add status field
            }));
            
    
            const totalJobsCount = await prisma.jobs.count({
                where: {
                    isCompleted: false,
                   // statusId: { not: parseInt(process.env.DELETED_STATUS_ID) },
                   statusId: { notIn: [parseInt(process.env.DELETED_STATUS_ID), parseInt(process.env.CLOSED_STATUS_ID)] },

                    OR: uniqueMatchConditionValues.map(condition => ({
                        postcode: {
                            startsWith: condition,
                            mode: "insensitive",
                        },
                    })),
                    AND: [{
                        OR: [
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: "Other"
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    mainTrade: {
                                        type: userDetails.trade
                                    }
                                }
                            },
                            {
                                service:
                                {
                                    type: { in: serviceIds },
                                }
                            },
                            {
                                service:
                                {
                                    type: "Other"
                                }
                            }
                        ],
                    }]
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
