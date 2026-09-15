import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import twilio from "twilio";
import * as Sentry from '@sentry/nextjs';
import { forbidden, getRequestUser, unauthorized } from '../../../lib/auth/session';

const prisma = new PrismaClient();

const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
const PASS = (process.env.NODEMAILER_PASS || process.env.NEXT_PUBLIC_NODEMAILER_PASS);

const accountSid = process.env.NEXT_PUBLIC_ACC_SID; // SID
const authToken = (process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_ACC_AUTH); // Twilio auth token

// Function to send an SMS
const sendSMS = async (user, tradesperson, job, newRequestId) => {
  const twilioClient = new twilio(accountSid, authToken);

  const message = `
Hello ${user?.firstName || "there"}, 

You have a new review request from ${tradesperson?.firstName} ${tradesperson?.lastName} for the job: ${job?.job?.headline}.

We’d love to hear your thoughts! Please take a moment to provide your feedback about your recent experience by visiting us at ${process.env.NEXT_PUBLIC_URL}/user/reviews/${newRequestId}.
    
Your input is invaluable to us and helps us improve our services. If you have any specific questions or need assistance, feel free to reach out to ${tradesperson?.firstName} ${tradesperson?.lastName}.


  `;
  await twilioClient.messages.create({
    body: message,
    messagingServiceSid: "MG568f29d5518dbee48ab094372c71d86b", // twilioNumber
    to: user?.phone, // User's phone number
  });
};

// Function to send an email
const sendEmail = async (user, tradesperson, job , newRequestId) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: USER,
      pass: PASS,
    },
  });

  const mailOptions = {
    from: `"Review Request" <${USER}>`,
    to: user.email,
    subject: `Review Request: ${job?.job?.headline} review requested`,
    html: `
       <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.surface}; padding: 20px; border-radius: 10px; color: ${EMAIL_THEME.accent}; box-shadow: 0 0 15px ${EMAIL_THEME.glow};">
                  <h1 style="color: ${EMAIL_THEME.surfaceText}; text-align: center; border-bottom: 2px solid ${EMAIL_THEME.surfaceText}; padding-bottom: 10px;">
                   Hello, ${user?.firstName || "there"}</h1>
                  <p style="font-size: 18px; color: ${EMAIL_THEME.surfaceText}; margin-top: 20px;">
                            You have a new review request from <strong>${
                              tradesperson?.firstName
                            } ${
      tradesperson?.lastName
    }</strong> for the job: <strong>${job?.job?.headline}</strong>.
                  </p>
<p style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; margin-top: 20px;">
    We’d love to hear your thoughts! Please take a moment to provide your feedback about your recent experience by visiting us at <a href="${process.env.NEXT_PUBLIC_URL}/user/reviews/${newRequestId}" style="color: ${EMAIL_THEME.surfaceText}; text-decoration: none; border-bottom: 1px dotted ${EMAIL_THEME.accent};">${process.env.NEXT_PUBLIC_URL}/user/reviews/${newRequestId}</a>.
</p>
<p style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; margin-top: 10px;">
    Your input is invaluable to us and helps us improve our services. If you have any specific questions or need assistance, feel free to reach out to ${
      tradesperson?.firstName
    } ${tradesperson?.lastName}.
</p>
<div style="margin-top: 20px; padding: 15px; border-top: 1px solid ${EMAIL_THEME.accent};">
    <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText}; text-align: center;">© 2024. All rights reserved.</p>
    <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText}; text-align: center;">
        Visit us at <a href="https://tradepeople.co.uk" style="color: ${EMAIL_THEME.surfaceText}; text-decoration: none; border-bottom: 1px dotted ${EMAIL_THEME.accent};">tradepeople.co.uk</a>
    </p>
</div>




    `,
  };

  await transporter.sendMail(mailOptions);
};

export async function POST(request) {
  try {
    const { userId, tradepersonId, jobId } = await request.json();

    if (!userId || !tradepersonId || !jobId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only the tradesperson on the job can ask its homeowner for a review
    const caller = await getRequestUser(request);
    if (!caller) return unauthorized();
    if (parseInt(tradepersonId) !== caller.id) return forbidden();

    const existingRequest = await prisma.request.findUnique({
      where: {
        userId_tradepersonId_jobId: {
          userId: parseInt(userId),
          tradepersonId: parseInt(tradepersonId),
          jobId: parseInt(jobId),
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: "Review requested already sent." },
        { status: 400 }
      );
    }

    const newRequest = await prisma.request.create({
      data: {
        userId: parseInt(userId),
        tradepersonId: parseInt(tradepersonId),
        jobId: parseInt(jobId),
      },
      include: {
        user: true,
        tradeperson: true,
        job: true,
      },
    });


// Access the id of the newly created request
const newRequestId = newRequest.id;

    // Send email and SMS
    await sendEmail(newRequest.user, newRequest.tradeperson, newRequest.job , newRequestId);
    if(newRequest?.user?.phone != null){
      await sendSMS(newRequest.user, newRequest.tradeperson, newRequest.job, newRequestId);
    }

    return NextResponse.json(
      { success: true, message: "Review request sent successfully.",   id: newRequestId, // Include the ID in the response
 },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error handling review request:", error);
    return NextResponse.json(
      { success: false, message: "Error handling review request" },
      { status: 500 }
    );
  }
}
