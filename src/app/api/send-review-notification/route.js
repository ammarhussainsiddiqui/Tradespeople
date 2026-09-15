import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import * as Sentry from '@sentry/nextjs';
import { forbidden, getRequestUser, unauthorized } from '../../../lib/auth/session';

const prisma = new PrismaClient();

const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
const PASS = (process.env.NODEMAILER_PASS || process.env.NEXT_PUBLIC_NODEMAILER_PASS);

const sendEmail = async (user, tradesperson, job) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: USER,
      pass: PASS,
    },
  });

  const mailOptions = {
    from: `"New Review" <${USER}>`,
    to: tradesperson?.email,
    subject: `New Review: For the job ${job?.job?.headline}`,
    html: `
       <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.surface}; padding: 20px; border-radius: 10px; color: ${EMAIL_THEME.accent}; box-shadow: 0 0 15px ${EMAIL_THEME.glow};">
                  <h1 style="color: ${EMAIL_THEME.surfaceText}; text-align: center; border-bottom: 2px solid ${EMAIL_THEME.surfaceText}; padding-bottom: 10px;">
                           Hello, ${tradesperson?.firstName} ${
      tradesperson?.lastName
    }
</h1>
                  <p style="font-size: 18px; color: ${EMAIL_THEME.surfaceText}; margin-top: 20px;">
                            You’ve received a new review from <strong>${
                              user?.firstName || "there"
                            } ${user?.lastName || ""}</strong> for the job: <strong>${job?.job?.headline}</strong>.

                  </p>
<p style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; margin-top: 20px;">
    Visit at <strong><a href="${
      process.env.NEXT_PUBLIC_URL
    }/tradesperson/myjobs" style="color: ${EMAIL_THEME.surfaceText}; text-decoration: none; border-bottom: 1px dotted ${EMAIL_THEME.accent};">${
      process.env.NEXT_PUBLIC_URL
    }/tradesperson/myjobs</a></strong> to see detailed review and rating.
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

    // Validate required fields
    if (!userId || !tradepersonId || !jobId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only the homeowner who left the review can notify the tradesperson
    const caller = await getRequestUser(request);
    if (!caller) return unauthorized();
    if (Number(userId) !== caller.id) return forbidden();

    // Fetch the request data with relations
    const requestData = await prisma.request.findUnique({
      where: {
        userId_tradepersonId_jobId: {
          userId,
          tradepersonId,
          jobId,
        },
      },
      include: {
        user: true, // Fetch user details
        tradeperson: true, // Fetch tradeperson details
        job: true, // Fetch job details
      },
    });

    if (!requestData) {
      return NextResponse.json(
        { success: false, message: "Request not found." },
        { status: 404 }
      );
    }

    await sendEmail(
      requestData.user,
      requestData.tradeperson,
      requestData.job,
    );

    return NextResponse.json(
      { success: true, message: "Email sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Error sending email." },
      { status: 500 }
    );
  }
}

