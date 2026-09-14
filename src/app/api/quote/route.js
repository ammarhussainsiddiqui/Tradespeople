import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import authenticateToken from "../../authenticateToken";
import nodemailer from "nodemailer";
import twilio from "twilio";
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

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
    // Parse the request's query parameters
    const { searchParams } = new URL(request.url);
    const tradepersonId = searchParams.get("tradepersonId");
    const jobId = searchParams.get("jobId");
    const userId = searchParams.get("userId");

    // Validate query parameters
    if (!tradepersonId && !jobId) {
      return NextResponse.json(
        {
          success: false,
          message: "Either tradepersonId or jobId is required",
        },
        { status: 400 }
      );
    }

    // Query Prisma to find a matching quote based on tradepersonId or jobId
    const quote = await prisma.quotes.findFirst({
      where: {
        userId: parseInt(userId),
        tradepersonId: parseInt(tradepersonId),
        jobId: parseInt(jobId),
      },
    });

    if (quote) {
      return NextResponse.json(
        {
          success: true,
          hasApplied: true,
          quote,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        hasApplied: false,
        quote: {
          jobId: parseInt(jobId),
          userId: parseInt(userId),
          tradepersonId: parseInt(tradepersonId),
          requested: false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error checking quote status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

const accountSid = process.env.NEXT_PUBLIC_ACC_SID; // SID
const authToken = process.env.NEXT_PUBLIC_ACC_AUTH; // Twilio auth token

const sendEmailForUser = async (
  tradePersonName,
  email,
  type,
  job,
  firstName,
  lastName,
  jobId
) => {
  const url = `https://app.thetradecore.com/tradesperson/leads?jobid=${jobId}`
  const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const PASS = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  try {
    // Configure nodemailer service
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Specify email service
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    // Define email content
    // const mailOptions = {
    //   from: `${USER}`,
    //   to: email,
    //   subject: `New Lead Alert: ${type} Service Request`,
    //   html: `
    //         <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.surface}; padding: 20px; border-radius: 10px; color: ${EMAIL_THEME.surfaceText};">
    //             <h1 style="color: ${EMAIL_THEME.surfaceText};">Hello, ${tradePersonName}</h1>
    //             <p style="font-size: 18px; color: ${EMAIL_THEME.mutedText};">
    //                 You have a new service request from <strong>${firstName} ${lastName}</strong> for a <strong>${type}</strong> service.
    //             </p>
    //             <h2 style="font-size: 20px; color: ${EMAIL_THEME.surfaceText};">Lead Details:</h2>
    //             <ul style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; line-height: 1.5;">
    //             ${Object.entries(job)
    //                 .filter(([key]) => key !== "services" && key !== "postcode") // Exclude specific keys
    //                 .map(([key, value]) => `<li><strong>${key.toUpperCase()}:</strong> \n${value}</li>`)
    //                 .join('\n')}
    //             </ul>
    //             <p style="font-size: 16px; color: ${EMAIL_THEME.mutedText};">
    //                 To view and manage this lead, please visit your <a href="${url}" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">dashboard</a>.
    //             </p>
    //             <p style="font-size: 16px; color: ${EMAIL_THEME.mutedText};">
    //                 Please reach out to ${firstName} ${lastName} at your earliest convenience to discuss their requirements.
    //             </p>
    //             <div style="margin-top: 20px; padding: 10px; border-top: 1px solid ${EMAIL_THEME.border};">
    //                 <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">© 2024. All rights reserved.</p>
    //                 <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">Visit us at <a href="https://thetradecore.com" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">thetradecore.com</a></p>
    //             </div>
    //         </div>
    //     `,
    // };

    const mailOptions = {
        from: `${USER}`,
        to: email,
        subject: `New Lead Alert: ${type} Service Request`,
        html: `
              <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.surface}; padding: 20px; border-radius: 10px; color: ${EMAIL_THEME.accent}; box-shadow: 0 0 15px ${EMAIL_THEME.glow};">
                  <h1 style="color: ${EMAIL_THEME.surfaceText}; text-align: center; border-bottom: 2px solid ${EMAIL_THEME.surfaceText}; padding-bottom: 10px;">
                      Hello, ${tradePersonName}
                  </h1>
                  <p style="font-size: 18px; color: ${EMAIL_THEME.surfaceText}; margin-top: 20px;">
                      You have a new service request from <strong>${firstName != null ? firstName :"there"} ${lastName != null ? lastName :""}</strong> for a <strong>${type}</strong> service.
                  </p>
                  <h2 style="font-size: 22px; color: ${EMAIL_THEME.surfaceText}; border-bottom: 1px solid ${EMAIL_THEME.surfaceText}; padding-bottom: 5px; margin-top: 20px;">
                      Lead Details:
                  </h2>
                  <ul style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; line-height: 1.8; list-style-type: none; padding: 0;">
                  ${Object.entries(job)
                    .filter(([key]) => key !== "services" && key !== "postcode") // Exclude specific keys
                    .map(
                      ([key, value]) =>
                        `<li style="margin-bottom: 10px; color: ${EMAIL_THEME.surfaceText};"><strong style="color: ${EMAIL_THEME.surfaceText};">${key.toUpperCase()}:</strong> ${value}</li>`
                    )
                    .join("")}
                  </ul>
                  <p style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; margin-top: 20px;">
                      To view and manage this lead, please visit your <a href="${url}" style="color: ${EMAIL_THEME.surfaceText}; text-decoration: none; border-bottom: 1px dotted ${EMAIL_THEME.accent};">dashboard</a>.
                  </p>
                  <p style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; margin-top: 10px;">
                      Please reach out to ${firstName != null ? firstName :"there"} ${lastName != null ? lastName :""} at your earliest convenience to discuss their requirements.
                  </p>
                  <div style="margin-top: 20px; padding: 15px; border-top: 1px solid ${EMAIL_THEME.accent};">
                      <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText}; text-align: center;">© 2024. All rights reserved.</p>
                      <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText}; text-align: center;">
                          Visit us at <a href="https://thetradecore.com" style="color: ${EMAIL_THEME.surfaceText}; text-decoration: none; border-bottom: 1px dotted ${EMAIL_THEME.accent};">thetradecore.com</a>
                      </p>
                  </div>
              </div>
          `,
      };
      

    // Send email
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    Sentry.captureException("Error:", error);
    return { success: false, message: "Failed to send email." };
  }
};

const isWithin24Hours = (createdAt) => {
  // Convert createdAt to epoch milliseconds
  const createdAtEpoch = new Date(createdAt).getTime();
  const currentTimeEpoch = Date.now(); // Current time in epoch milliseconds

  // Calculate the difference in milliseconds
  const timeDifference = currentTimeEpoch - createdAtEpoch;

  // Convert 24 hours to milliseconds (24 * 60 * 60 * 1000)
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

  // Return true if the time difference is less than 24 hours
  return timeDifference < twentyFourHoursInMs;
};

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
    // Parse JSON body from the request
    const { userId, tradepersonId, jobId } = await request.json();
    const twilioClient = new twilio(accountSid, authToken);
    // Validate request body
    if (!userId || !tradepersonId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: userId and tradepersonId are required",
        },
        { status: 400 }
      );
    }

    // Check for an existing quote
    const existingQuote = await prisma.quotes.findFirst({
      where: {
        userId: parseInt(userId),
        tradepersonId: parseInt(tradepersonId),
        jobId: jobId ? parseInt(jobId) : null,
      },
    });

    if (!isWithin24Hours(existingQuote?.createdAt)) {
      if (existingQuote) {
        const date = new Date(Date.now());
        const isoString = date.toISOString();
        // If quote exists, toggle the requested status
        const updatedQuote = await prisma.quotes.update({
          where: { id: existingQuote.id },
          data: {
            requested: !existingQuote.requested, // Toggle the requested status
            createdAt: isoString,
          },
          include: {
            job: {
              include: {
                service: true,
              },
            }, // Toggle the requested status
            user: true,
            tradeperson: true,
          },
        });
        await sendEmailForUser(
          updatedQuote?.tradeperson?.firstName,
          updatedQuote?.tradeperson?.email,
          updatedQuote?.job?.service?.type,
          updatedQuote?.job?.job,
          updatedQuote?.user?.firstName,
          updatedQuote?.user?.lastName,
          jobId
        );
        if (updatedQuote?.tradeperson?.phone !== null) {
          const messageBody = `
Hello, ${updatedQuote?.tradeperson?.firstName},

You have a new service request from ${updatedQuote?.user?.firstName || "there"} ${updatedQuote?.user?.lastName || ""} for a ${updatedQuote?.job?.service?.type} service.

Lead Details:
${Object.entries(updatedQuote?.job?.job)
  .filter(([key]) => key !== "services" && key !== "postcode") // Exclude specific keys
  .map(([key, value]) => `${key.toUpperCase()}: ${value}
  `)
  .join("\n")}

To view and manage this lead, visit your dashboard: https://app.thetradecore.com/tradesperson/leads?jobid=${jobId}

Please reach out to ${updatedQuote?.user?.firstName || "there"} ${updatedQuote?.user?.lastName || ""} at your earliest convenience to discuss their requirements.
`;
          await twilioClient.messages.create({
            body: messageBody,
            messagingServiceSid: "MG568f29d5518dbee48ab094372c71d86b", // twilioNumber
            to: updatedQuote?.tradeperson?.phone,
          });
        }
        return NextResponse.json(
          {
            success: true,
            message: "Quote request status successfully toggled",
            quote: updatedQuote,
          },
          { status: 200 }
        );
      } else {
        // If no existing quote, create a new quote
        const newQuote = await prisma.quotes.create({
          data: {
            userId: parseInt(userId),
            tradepersonId: parseInt(tradepersonId),
            jobId: jobId ? parseInt(jobId) : null,
            requested: true, // Set initial requested status to true
          },
          include: {
            job: {
              include: {
                service: true,
              },
            }, // Toggle the requested status
            user: true,
            tradeperson: true,
          },
        });

        await sendEmailForUser(
          newQuote?.tradeperson?.firstName,
          newQuote?.tradeperson?.email,
          newQuote?.job?.service?.type,
          newQuote?.job?.job,
          newQuote?.user?.firstName,
          newQuote?.user?.lastName,
          jobId
        );
        if (newQuote?.tradeperson?.phone !== null) {
          const messageBody = `
Hello, ${newQuote?.tradeperson?.firstName},

You have a new service request from ${newQuote?.user?.firstName || "there"} ${newQuote?.user?.lastName || ""
  } for a ${
            newQuote?.job?.service?.type
          } service.

Lead Details:

${Object.entries(newQuote?.job?.job)
                              .filter(
                                ([key]) =>
                                  key !== "services" && key !== "postcode"
                              ) // Exclude specific keys
                              .map(([key, value]) => `${key.toUpperCase()}: ${value}
                              `)
                              .join("\n")}

To view and manage this lead, visit your dashboard: https://app.thetradecore.com/tradesperson/leads?jobid=${jobId}

Please reach out to ${newQuote?.user?.firstName || "there"} ${newQuote?.user?.lastName || ""
} at your earliest convenience to discuss their requirements.
                    `;
          await twilioClient.messages.create({
            body: messageBody,
            messagingServiceSid: "MG568f29d5518dbee48ab094372c71d86b", // twilioNumber
            to: newQuote?.tradeperson?.phone,
          });
        }
        return NextResponse.json(
          {
            success: true,
            message: "Quote request successfully created",
            quote: newQuote,
          },
          { status: 201 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: "four",
          message: "24 hours is not passed!",
          quote: existingQuote,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    Sentry.captureException("Error handling quote request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

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
    // Parse the query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("id"); // Assuming 'id' is passed in the query string

    if (!quoteId) {
      return NextResponse.json(
        {
          success: false,
          message: "Quote ID is required",
        },
        { status: 400 }
      );
    }

    // Delete the quote from the database
    await prisma.quotes.delete({
      where: { id: parseInt(quoteId) },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Quote successfully deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error deleting quote:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

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
    // Parse the JSON body from the request
    const { id } = await request.json(); // Assuming 'id' is sent in the request body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Quote ID is required",
        },
        { status: 400 }
      );
    }

    // Update the isAccepted field to true
    const updatedQuote = await prisma.quotes.update({
      where: { id: parseInt(id) },
      data: {
        isAccepted: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Quote successfully accepted",
        quote: updatedQuote,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error updating quote:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

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
    // Parse the JSON body from the request
    const { id, quotePrice } = await request.json(); // Assuming 'id' and 'quotePrice' are sent in the request body

    // Validate request body
    if (!id || quotePrice === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Quote ID and quotePrice are required",
        },
        { status: 400 }
      );
    }

    // Update the quotePrice field for the given quote ID
    const updatedQuote = await prisma.quotes.update({
      where: { id: parseInt(id) },
      data: {
        quotePrice: parseInt(quotePrice),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Quote price successfully updated",
        quote: updatedQuote,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error updating quote price:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
