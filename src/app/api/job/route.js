import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import authenticateToken from "../../authenticateToken";
import {
  GetRelevantEmails,
  sendEmailToRelevantUsers,
  sendSMSToRelevantUsers,
} from "../../../utils/relevantEmailsAndPhone";
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();
const DELETED_STATUS_ID = process.env.DELETED_STATUS_ID;
// Job creation route
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
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
    const { userId, job } = await request.json();
    // Validate userId and job
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        { status: 400 }
      );
    }
    // Create new job
    const newJob = await prisma.jobs.create({
      data: {
        userId: parseInt(userId),
        serviceId: parseInt(job.services),
        job: job,
        postcode: job?.postcode.toUpperCase(),
      },
      include:{
        service: true
      }
    });
    const getRelevantEmails = await GetRelevantEmails(newJob?.id);
    if (
      getRelevantEmails?.success === true &&
      getRelevantEmails?.relevantEmails.length > 0
    ) {
      sendEmailToRelevantUsers(
        getRelevantEmails?.relevantEmails,
        newJob?.service?.type,
        newJob?.postcode,
        job?.description,
        newJob?.id
      )
        .then((result) => console.log(result.message))
        .catch((error) => console.error(error));
    }
    // if (
    //   getRelevantEmails?.success === true &&
    //   getRelevantEmails?.relevantPhone.length > 0
    // ) {
    //   sendSMSToRelevantUsers(
    //     getRelevantEmails?.relevantPhone,
    //     newJob?.service?.type,
    //     newJob?.postcode,
    //     job?.description,
    //     newJob?.id
    //   )
    //     .then((result) => console.log(result))
    //     .catch((error) => console.error(error));
    // }
    return NextResponse.json(
      {
        success: true,
        job: newJob,
      },
      { status: 201 }
    );
  } catch (error) {
    Sentry.captureException("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
// Fetch jobs based on user ID
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
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
    // Parse the URL to get query parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const userId = params.userId;
    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        { status: 400 }
      );
    }
    // Fetch jobs for the given user ID
    const jobs = await prisma.jobs.findMany({
      where: {
        userId: parseInt(userId),
        statusId: { not: parseInt(DELETED_STATUS_ID) },
      },
      orderBy: {
        createdAt: 'asc', 
      },
    });
    return NextResponse.json(
      {
        success: true,
        jobs, // Include jobs in the response
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
// Delete job route
export async function DELETE(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
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
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid job ID.",
        },
        { status: 400 }
      );
    }
    const updatedJob = await prisma.jobs.update({
      where: { id: parseInt(id) },
      data: { statusId: parseInt(DELETED_STATUS_ID) },
    });
    if (!updatedJob) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found.",
        },
        { status: 404 }
      );
    }
    // Send response
    return NextResponse.json(
      {
        success: true,
        message: "Job marked as deleted successfully.",
        data: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
// Update job completion status
export async function PUT(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
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
    const { id, isCompleted } = await request.json();
    // Validate the job ID and isCompleted status
    if (!id || typeof isCompleted !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid job ID or completion status.",
        },
        { status: 400 }
      );
    }
    // Update the job's completion status
    const updatedJob = await prisma.jobs.update({
      where: { id: parseInt(id) },
      data: { isCompleted },
    });
    return NextResponse.json(
      {
        success: true,
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error updating job status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
// Fetch job based on ID
export async function PATCH(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
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
    const { id } = await request.json();
    // Validate job ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid job ID.",
        },
        { status: 400 }
      );
    }
    // Fetch job for the given ID
    const job = await prisma.jobs.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        jobStatus:true,
        service: {
          include: {
            mainTrade: true,
          },
        },
      },
    });
    return NextResponse.json(
      {
        success: true,
        job,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}