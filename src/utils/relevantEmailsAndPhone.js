import { EMAIL_THEME } from '../lib/theme/emailTheme';
import { PrismaClient } from "@prisma/client";
import { areaSegments } from "../actions/auth";
import nodemailer from "nodemailer";
import twilio from "twilio";
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

const accountSid = process.env.NEXT_PUBLIC_ACC_SID; // SID
const authToken = process.env.NEXT_PUBLIC_ACC_AUTH; // Twilio auth token

function getLabelsByValue(array, targetValue) {
  // Filter the array to find objects where the value matches the targetValue
  const filteredLabels = array
    .filter((item) => {
      if (Array.isArray(item.value)) {
        return item.value.includes(targetValue); // Check if the array contains the targetValue
      } else {
        return item.value === targetValue; // Check if the value matches directly
      }
    })
    .map((item) => item.label); // Extract the labels from the matching objects

  return filteredLabels; // Return the array of labels
}
async function validatePostcode(postcode) {
  postcode = postcode.toUpperCase().replace(/\s+/g, "");
  const firstLetter = postcode.charAt(0);
  const secondChar = postcode.charAt(1);
  const prefix = postcode.slice(0, 2);

  let matchCondition = !isNaN(secondChar) ? firstLetter : prefix;
  const areas = await areaSegments();
  const LabelsByValue = getLabelsByValue(areas, matchCondition);

  return LabelsByValue ? LabelsByValue : postcode;
}

export async function GetRelevantEmails(myjobId) {
  try {
    const myjob = await prisma.jobs.findUnique({
      where: { id: parseInt(myjobId) },
      include: {
        service: {
          include: {
            mainTrade: true,
          },
        },
      },
    });

    const postcode = myjob?.job?.postcode;
    const filterTrade = myjob?.service?.mainTrade?.type;
    const filterService = myjob?.service?.type;

    let postCodeArea = (await validatePostcode(postcode)) || [];
    console.log(postCodeArea);

    if (filterTrade == "Other") {
      const tradepersonDetails = await prisma.user.findMany({
        where: {
          subscription: true,
          profileUrl: { not: null },
          AND: [
            {
              OR: [
                // Flattened postcode conditions
                ...postCodeArea.map((segment) => ({
                  postcode: segment,
                })),
                {
                  tradeLocation: {
                    some: {
                      OR: postCodeArea.map((segment) => ({
                        postcode: segment,
                      })),
                    },
                  },
                },
              ],
            },
          ],
        },
        select: {
          email: true,
          phone: true,
        },
      });

      const emails = tradepersonDetails
        .map((details) => details.email)
        .filter((email) => email !== null);
      const phones = tradepersonDetails
        .map((details) => details.phone)
        .filter((phone) => phone !== null);

      if (!tradepersonDetails || tradepersonDetails.length === 0) {
        return {
          success: false,
          message: "No tradepersons found",
        };
      }

      return {
        success: true,
        relevantEmails: emails,
        relevantPhone: phones,
      };
    } else {
      const tradepersonDetails = await prisma.user.findMany({
        where: {
          subscription: true,
          profileUrl: { not: null },
          AND: [
            {
              OR: [
                // Flattened postcode conditions
                ...postCodeArea.map((segment) => ({
                  postcode: segment,
                })),
                {
                  tradeLocation: {
                    some: {
                      OR: postCodeArea.map((segment) => ({
                        postcode: segment,
                      })),
                    },
                  },
                },
              ],
            },
            {
              OR: [
                { trade: filterTrade }, // Match the trade field
                {
                  tradeService: {
                    some: {
                      Service: {
                        type: filterService,
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        select: {
          email: true,
          phone: true,
        },
      });

      const emails = tradepersonDetails
        .map((details) => details.email)
        .filter((email) => email !== null);
      const phones = tradepersonDetails
        .map((details) => details.phone)
        .filter((phone) => phone !== null);

      // If no tradepersons are found, return a message
      if (!tradepersonDetails || tradepersonDetails.length === 0) {
        return {
          success: false,
          message: "No tradepersons found",
        };
      }

      // Return the paginated tradepersons details and pagination info

      return {
        success: true,
        relevantEmails: emails,
        relevantPhone: phones,
      };
    }
  } catch (error) {
    //console.error("Error fetching tradepersons:", error);
    Sentry.captureException("Error fetching tradepersons:", error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
}

export async function sendEmailToRelevantUsers(
  emails,
  jobTitle,
  postcode,
  jobDescription,
  jobId
) {
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

    // Loop through all relevant emails and send the email
    for (const email of emails) {
      const mailOptions = {
        from: "Notifications",
        to: email,
        subject: jobTitle ? `New Job Available: ${jobTitle}` : "A new job has been posted in your area.",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
            <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
            </div>
            <div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
                <h2 style="font-size: 24px; color: ${EMAIL_THEME.accent}; margin: 0;">New Job Available!</h2>
                <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px;">
                    A new job has been posted in your area. Here are the details:
                </p>
                <ul style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; text-align: left;">
                    <li><strong>Title:</strong> ${jobTitle}</li>
                    <li><strong>Postcode:</strong> ${postcode}</li>
                    <li><strong>Description:</strong> ${jobDescription}</li>
                </ul>
                <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 20px;">
                    <a href="https://app.thetradecore.com/tradesperson/leads?jobid=${jobId}" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">Click here</a> to see all the details of this job.
                </p>
            </div>
            <div style="margin-top: 30px; padding: 10px; border-top: 1px solid ${EMAIL_THEME.accent};">
                <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">© 2024. All rights reserved.</p>
                <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">Visit us at <a href="https://thetradecore.com" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">thetradecore.com</a></p>
            </div>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${email}`);
    }

    return {
      success: true,
      message: "Emails sent successfully to all relevant users.",
    };
  } catch (error) {
    //console.error("Error:", error);
    Sentry.captureException("Error:", error);
    return { success: false, message: "Failed to send emails." };
  }
}

export async function sendSMSToRelevantUsers(
  phoneNumbers,
  jobTitle,
  postcode,
  jobDescription,
  jobId
) {
  const twilioClient = new twilio(accountSid, authToken);

  const messagingServiceSid = "MG568f29d5518dbee48ab094372c71d86b"; // Replace with your Twilio messaging service SID

  try {
    // Loop through all relevant phone numbers and send the SMS
    for (const phoneNumber of phoneNumbers) {
      if (!phoneNumber) continue; // Skip null or undefined numbers

      const messageBody = `
Hello,

A new job has been posted in your area!

Job Details:
- Title: ${jobTitle}
- Postcode: ${postcode}
- Description: ${jobDescription}

Click here to see all the details of this job : https://app.thetradecore.com/tradesperson/leads?jobid=${jobId}

$1`;

      await twilioClient.messages.create({
        body: messageBody.trim(),
        messagingServiceSid,
        to: phoneNumber.trim(),
      });

      console.log(`SMS sent successfully to ${phoneNumber}`);
    }

    return {
      success: true,
      message: "SMS sent successfully to all relevant users.",
    };
  } catch (error) {
    //console.error("Error:", error);
    Sentry.captureException("Error:", error);
    return { success: false, message: "Failed to send SMS." };
  }
}
