import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken'; // Import your token authentication logic
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

// Environment variables for status IDs
const STATUS_IDS = {

    INPROGRESS: Number(process.env.INPROGRESS_STATUS_ID),
    ONHOLD: Number(process.env.ONHOLD_STATUS_ID),
    STOPPED: Number(process.env.STOPPED_STATUS_ID),
    OPENED: Number(process.env.OPENED_STATUS_ID),
    CLOSED: Number(process.env.CLOSED_STATUS_ID),
    DELETED: Number(process.env.DELETED_STATUS_ID),
};

//UPDATE JOB STATUS
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
        // Parse the request body
        const { jobId, statusId } = await request.json();
        // Validate the request body
        if (!jobId || !statusId || !Object.values(STATUS_IDS).includes(statusId)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid job ID or status ID.',
            }, { status: 400 });
        }

        // Prepare data object for update
        const updateData = { statusId: parseInt(statusId) };

        // If status is OPENED, also update createdAt to current time
        if (parseInt(statusId) === STATUS_IDS.OPENED) {
            updateData['createdAt'] = new Date();
        }

        // Update the job status
        const updatedJob = await prisma.jobs.update({
            where: { id: parseInt(jobId) },
            // data: { statusId: parseInt(statusId) },
            data: updateData,
        });
        if (!updatedJob) {
            return NextResponse.json({
                success: false,
                message: 'Job not found or could not be updated.',
            }, { status: 404 });
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Job status updated successfully.',
            data: updatedJob,
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException('Error updating job status:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}

//GET JOBSTATUS (RETURNING STATUSID)
export async function POST(request) {
    const { jobId } = await request.json();
  
    if (!jobId) {
      return NextResponse.json({
        success: false,
        message: "Job ID is required.",
      }, { status: 400 });
    }
  
    try {
      const job = await prisma.jobs.findUnique({
        where: { id: parseInt(jobId) },
        select: { statusId: true }, // Fetch only the status ID
      });
  
      if (!job) {
        return NextResponse.json({
          success: false,
          message: "Job not found.",
        }, { status: 404 });
      }
  
      return NextResponse.json({
        success: true,
        data: { statusId: job.statusId },
      }, { status: 200 });
    } catch (error) {
      Sentry.captureException("Error fetching job status:", error);
      return NextResponse.json({
        success: false,
        message: "Internal server error.",
      }, { status: 500 });
    }
  }
  

