import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import dayjs from 'dayjs';
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
        // Fetch all jobs
        const allJobs = await prisma.jobs.findMany({
            include: {
                service: true, 
                user: true, 
            }
        });

        // Separate jobs by completion status
        const completedJobs = allJobs.filter(job => job.isCompleted === true);
        const incompleteJobs = allJobs.filter(job => job.isCompleted === false);

        // Job counts
        const totalJobsCount = allJobs.length;
        const completedJobsCount = completedJobs.length;
        const incompleteJobsCount = incompleteJobs.length;

        // Send response with job data and counts
        return NextResponse.json({
            success: true,
            totalJobsCount,
            completedJobsCount,
            incompleteJobsCount,
            completedJobs,
            incompleteJobs,
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
      // Fetch all jobs
      const allJobs = await prisma.jobs.findMany({
        include: {
          service: true,
          user: true,
        }
      });
  
      // Initialize the monthly chart data structure
      const months = [
        { month: "January", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "February", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "March", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "April", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "May", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "June", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "July", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "August", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "September", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "October", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "November", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
        { month: "December", totalJobsCount: 0, completedJobsCount: 0, incompleteJobsCount: 0 },
      ];
  
      // Iterate over all jobs and group by month
      allJobs.forEach(job => {
        const jobMonth = dayjs(job.createdAt).month(); // Get the month as 0-11 (0 for January)
  
        // Update the counts for the corresponding month
        months[jobMonth].totalJobsCount += 1;
        if (job.isCompleted) {
          months[jobMonth].completedJobsCount += 1;
        } else {
          months[jobMonth].incompleteJobsCount += 1;
        }
      });
  
      // Filter only the months that have job data
      const filteredMonths = months.filter(month => month.totalJobsCount > 0);
  
      // Return the response with the structured data
      return NextResponse.json({
        success: true,
        data: filteredMonths,
      }, { status: 200 });
  
    } catch (error) {
      Sentry.captureException('Error:', error);
      return NextResponse.json({
        success: false,
        message: 'Internal server error.',
      }, { status: 500 });
    }
  }