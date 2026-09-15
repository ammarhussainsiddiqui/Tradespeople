import { EMAIL_THEME } from '../lib/theme/emailTheme';
import cron from 'node-cron';
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
const prisma = new PrismaClient();
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY));
console.log("Cron File is Running")

async function checkFailedInvoices() {
  console.log('Running failed invoices check...');
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
    console.error('Error checking failed invoices:', error);
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
    console.log("My failed invoices are here =========> ", failedInvoices)
    let successCount = 0;
    const now = new Date();

    for (const invoice of failedInvoices) {
      try {
        const mailOptions = {
          from: `${USER}`,
          to: invoice.email,
          subject: `Payment Required: Your Invoice #${invoice.invoiceId}`,
          html: `
<div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
  <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
    <h1 style="margin: 0; font-size: 28px; color: ${EMAIL_THEME.accentText};">
      Payment Required
    </h1>
  </div>

  <div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
    
    <h2 style="font-size: 24px; color: ${EMAIL_THEME.accent}; margin: 0; line-height: 1.6;">
      Action Needed to Continue Your Subscription
    </h2>

    <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
      We were unable to process your payment of 
      <strong>${invoice.amountDue / 100} ${invoice.currency.toUpperCase()}</strong>
      for your subscription.
    </p>

    <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
      <strong>Invoice #:</strong> ${invoice.invoiceId}<br />
      <strong>Amount Due:</strong> ${invoice.amountDue / 100} ${invoice.currency.toUpperCase()}<br />
      <strong>Status:</strong> ${invoice.status.toUpperCase()}
    </p>

    <!-- CTA -->
    <div style="text-align: center; margin: 25px 0;">
      <a href="${invoice.hostedInvoiceUrl}"
         style="display: inline-block; background-color: ${EMAIL_THEME.accent}; color: ${EMAIL_THEME.accentText}; 
                padding: 14px 30px; text-decoration: none; border-radius: 8px; 
                font-weight: bold; font-size: 16px;">
        Pay Invoice
      </a>
    </div>

    <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
      If you’ve already made this payment, please ignore this email.
    </p>

    <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
      Need help? Contact us via WhatsApp on <strong>07741 872816</strong> or email 
      <a href="mailto:hello@thetradecore.com" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">
        hello@thetradecore.com
      </a>.
    </p>

    <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px;">
      The Team
    </p>
  </div>

  <!-- Footer -->
  <div style="margin-top: 30px; padding: 10px; border-top: 1px solid ${EMAIL_THEME.accent};">
    <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">
      © ${now.getFullYear()}. All rights reserved.
    </p>
    <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">
      Visit us at 
      <a href="https://tradepeople.co.uk" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">
        tradepeople.co.uk
      </a>
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
        console.error(`Failed to send email for invoice ${invoice.id}:`, emailError);
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
    console.error('Error in sendEmailToFailedInvoices:', error);
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
      console.log("My Failed Invoices =====> ", failedInvoices)
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
      console.log("Renew subscription users =====> ", activeUsers)
      const activeEmails = new Set(activeUsers.map(user => user.email));

      // Find invoice IDs to delete
      const invoiceIdsToDelete = failedInvoices
        .filter(invoice => activeEmails.has(invoice.email))
        .map(invoice => invoice.id);
      console.log("Invoice IDs to delete =====> ", invoiceIdsToDelete)
      // Delete in bulk
      if (invoiceIdsToDelete.length > 0) {
        const { count } = await prisma.failedInvoice.deleteMany({
          where: { id: { in: invoiceIdsToDelete } }
        });
        deletedCount += count;
      }

      processedCount += failedInvoices.length;
      console.log(`Processed ${processedCount} invoices, ${deletedCount} deleted`);

      // If we got fewer records than batch size, we've reached the end
      if (failedInvoices.length < BATCH_SIZE) break;
    }

    return {
      success: true,
      message: `Successfully processed ${processedCount} invoices, ${deletedCount} records deleted`
    };
  } catch (error) {
    console.error("Error in checkUserSubcription:", error);
    return {
      success: false,
      error: error.message,
      processed: processedCount,
      deleted: deletedCount
    };
  }
}

// Schedule the job to run daily at 9 AM
// Format: minute hour day-of-month month day-of-week
export const failedInvoicesJob = cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled job: Checking for failed invoices...');
  await checkUserSubcription();
  await checkFailedInvoices();
  await sendEmailToFailedInvoices()
  try {
  } catch (error) {
    console.error('Scheduled job failed:', error);
  }
});

