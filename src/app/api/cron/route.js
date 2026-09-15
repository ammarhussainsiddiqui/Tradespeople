import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
import { NextResponse } from 'next/server';
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
const prisma = new PrismaClient();
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY));

async function checkFailedInvoices() {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
  try {
    // 1️⃣ Fetch all open invoices
    const invoices = await stripe.invoices.list({
      limit: 100,
    });
    // 2️⃣ Group invoices by email
    const invoicesByEmail = new Map();
    for (const invoice of invoices.data) {
      const email = invoice.customer_email || invoice.customer_details?.email;
      if (!email) continue;
      if (!invoicesByEmail.has(email)) {
        invoicesByEmail.set(email, []);
      }
      invoicesByEmail.get(email).push(invoice);
    }
    // 3️⃣ Process each email's invoices
    const newFailedInvoices = [];
    for (const [email, userInvoices] of invoicesByEmail.entries()) {
      // Sort invoices by created date (latest first)
      userInvoices.sort((a, b) => b.created - a.created);
      const latestInvoice = userInvoices[0];
      // Check if invoice is failed and has a subscription
      const isFailed = (latestInvoice.status === 'open' || latestInvoice.status === 'unpaid') &&
                      latestInvoice.subscription;
      if (isFailed) {
        // 4️⃣ Check if this invoice already exists in our database
        const exists = await prisma.failedInvoice.findUnique({
          where: { email: latestInvoice.customer_email }
        });
        if (!exists) {
          newFailedInvoices.push({
            invoiceId: latestInvoice.id,
            customerId: latestInvoice.customer,
            subscriptionId: latestInvoice.subscription,
            email,
            amountDue: latestInvoice.amount_due,
            currency: latestInvoice.currency,
            status: latestInvoice.status,
            hostedInvoiceUrl: latestInvoice.hosted_invoice_url,
            stripeCreatedAt: latestInvoice.created,
            emailSendCount: 0
          });
        }
      }
    }
    // 5️⃣ Save new failed invoices to database
    if (newFailedInvoices.length > 0) {
      await prisma.failedInvoice.createMany({
        data: newFailedInvoices,
        skipDuplicates: true
      });
    }
    return { 
      totalChecked: invoices.data.length,
      newFailedInvoices: newFailedInvoices.length,
      message: 'Successfully processed invoices'
    };
  } catch (error) {
    throw error;
  }
}

async function sendEmailToFailedInvoices() {
  try {
    const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
    const PASS = (process.env.NODEMAILER_PASS || process.env.NEXT_PUBLIC_NODEMAILER_PASS);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    // Get failed invoices that haven't been sent too many times (e.g., less than 3 times)
    const failedInvoices = await prisma.failedInvoice.findMany({
      where: {
        emailSendCount: {
          lt: 3 // Only get invoices that have been sent less than 3 times
        },
        // Only send one email per day per invoice
        OR: [
          { lastEmailSent: null },
          { lastEmailSent: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // 24 hours ago
        ]
      },
      orderBy: {
        lastEmailSent: 'asc' // Process oldest first
      },
      take: 50 // Limit to 50 at a time to avoid rate limiting
    });
    let successCount = 0;
    const now = new Date();

    for (const invoice of failedInvoices) {
      try {
        const mailOptions = {
          from: `${USER}`,
          to: invoice.email,
          subject: `Payment Required: Your Invoice #${invoice.invoiceId}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.surface}; padding: 20px; border-radius: 10px;">
              <h1 style="color: ${EMAIL_THEME.surfaceText}; text-align: center; border-bottom: 2px solid ${EMAIL_THEME.success}; padding-bottom: 10px;">
                Payment Required
              </h1>
              <p style="font-size: 18px; color: ${EMAIL_THEME.surfaceText}; margin-top: 20px;">
                We were unable to process your payment of ${invoice.amountDue / 100} ${invoice.currency.toUpperCase()} for your subscription.
              </p>
              <p style="font-size: 16px; color: ${EMAIL_THEME.surfaceText}; margin-top: 10px;">
                Invoice #: ${invoice.invoiceId}<br>
                Amount Due: ${invoice.amountDue / 100} ${invoice.currency.toUpperCase()}<br>
                Status: ${invoice.status.toUpperCase()}
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${invoice.hostedInvoiceUrl}" 
                   style="display: inline-block; background-color: ${EMAIL_THEME.success}; color: ${EMAIL_THEME.accentText}; padding: 12px 25px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Payment
                </a>
              </div>
              <p style="font-size: 16px; color: ${EMAIL_THEME.surfaceText};">
                If you've already paid, please ignore this email. For any questions, please contact our support team.
              </p>
              <div style="margin-top: 20px; padding: 15px; border-top: 1px solid ${EMAIL_THEME.border};">
                <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText}; text-align: center;">
                  ${now.getFullYear()}. All rights reserved.
                </p>
                <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText}; text-align: center;">
                  Visit us at <a href="https://tradepeople.co.uk" style="color: ${EMAIL_THEME.surfaceText}; text-decoration: none; border-bottom: 1px dotted ${EMAIL_THEME.surfaceText};">tradepeople.co.uk</a>
                </p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        
        // Update the invoice with the new email count and timestamp
        await prisma.failedInvoice.update({
          where: { id: invoice.id },
          data: {
            emailSendCount: { increment: 1 },
            lastEmailSent: now
          }
        });
        
        successCount++;
        
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (emailError) {
        // Continue with the next invoice even if one fails
      }
    }

    return {
      success: true,
      processed: successCount,
      total: failedInvoices.length,
      message: `Successfully sent ${successCount} reminder emails`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to process failed invoices'
    };
  }
}

async function checkUserSubcription() {
  const BATCH_SIZE = 100;
  let processedCount = 0;
  let deletedCount = 0;

  try {
    // Process in batches to handle large datasets
    while (true) {
      // Get a batch of failed invoices
      const failedInvoices = await prisma.failedInvoice.findMany({
        take: BATCH_SIZE,
        select: {
          id: true,
          email: true
        }
      });
      if (failedInvoices.length === 0) break;

      // Get all unique emails from the current batch
      const emails = [...new Set(failedInvoices.map(invoice => invoice.email))];
      
      // Find all users with these emails and type not "Deactivate"
      const activeUsers = await prisma.user.findMany({
        where: {
          email: { in: emails },
          type: { not: "Deactivate" }
        },
        select: { email: true }
      });
      const activeEmails = new Set(activeUsers.map(user => user.email));

      // Find invoice IDs to delete
      const invoiceIdsToDelete = failedInvoices
        .filter(invoice => activeEmails.has(invoice.email))
        .map(invoice => invoice.id);
      // Delete in bulk
      if (invoiceIdsToDelete.length > 0) {
        const { count } = await prisma.failedInvoice.deleteMany({
          where: { id: { in: invoiceIdsToDelete } }
        });
        deletedCount += count;
      }

      processedCount += failedInvoices.length;
      // If we got fewer records than batch size, we've reached the end
      if (failedInvoices.length < BATCH_SIZE) break;
    }

    return { 
      success: true, 
      message: `Successfully processed ${processedCount} invoices, ${deletedCount} records deleted` 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      processed: processedCount,
      deleted: deletedCount
    };
  }
}

export async function GET() {

  try {
    checkUserSubcription()
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run check', details: error.message },
      { status: 500 }
    );
  }
}