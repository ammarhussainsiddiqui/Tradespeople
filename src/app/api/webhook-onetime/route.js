import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
import Stripe from "stripe";
import nodemailer from 'nodemailer';
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

const endpointSecret = process.env.NEXT_STRIPE_ONETIME_WEBHOOK_SECRET;

/**
 * Stripe requires raw body
 */
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

const sendStripeEmail =async (email, packageType) =>{
  const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const PASS = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  try {
    // Configure nodemailer service
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Specify email service
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    // Define email content
    const mailOptions = {
      from: `${USER}`,
      to: email,
      subject: `Welcome!`,
      html: `
   <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
          <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
              <h1 style="margin: 0; font-size: 28px; color: ${EMAIL_THEME.accentText};">Welcome!</h1>
          </div>
<div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
  <h2 style="font-size: 24px; color: ${EMAIL_THEME.accent}; margin: 0; line-height: 1.6;">
    Welcome!
  </h2>
  <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
Thank you for subscribing to the UK’s fastest-growing trade directory. Your profile can now be found by thousands of homeowners in your chosen area. You also have access to unlimited leads via jobs posted by users.
  </p>
  <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
If you need to view or edit your profile you can <a style="color: ${EMAIL_THEME.accent}; text-decoration: none;" href="https://app.thetradecore.com/login"> log in </a>here.
  </p>
  <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
If you need support you can contact us via WhatsApp on 07741 872816 or email at hello@thetradecore.com.
  </p>
  <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
The Team  </p>
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
    return { success: true, message: 'Email sent successfully.' };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, message: 'Failed to send email.' };
  }
}


const sendUpdateStripeEmail =async (email, packageType) =>{
  const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const PASS = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  try {
    // Configure nodemailer service
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Specify email service
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    // Define email content
    const mailOptions = {
      from: `${USER}`,
      to: email,
      subject: `Your Package Has Been Updated to ${packageType}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
          <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
          </div>
          <div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
              <h2 style="font-size: 24px; color: ${EMAIL_THEME.accent}; margin: 0;">Your Package Has Been Upgraded!</h2>
              <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px;">
                  Congratulations! You've successfully updated your membership to the <strong>${packageType}</strong> package.
              </p>
              <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px;">
                  As a valued ${packageType} member, you now have access to additional features and tools to support your trading journey.
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
    return { success: true, message: 'Email sent successfully.' };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, message: 'Failed to send email.' };
  }
}


const sendCancelStripeEmail =async (email, packageType) =>{
  const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const PASS = process.env.NEXT_PUBLIC_NODEMAILER_PASS;

  try {
    // Configure nodemailer service
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Specify email service
      auth: {
        user: USER,
        pass: PASS,
      },
    });

    // Define email content
    const mailOptions = {
      from: `${USER}`,
      to: email,
      subject: `Your Subscription to the ${packageType} Package Has Been Canceled`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: ${EMAIL_THEME.shellBg}; padding: 20px; text-align: center; border-radius: 10px;">
          <div style="background-color: ${EMAIL_THEME.accent}; padding: 15px; border-radius: 10px;">
          </div>
          <div style="margin-top: 20px; padding: 20px; background-color: ${EMAIL_THEME.panelBg}; border-radius: 10px; border: 2px solid ${EMAIL_THEME.accent};">
              <h2 style="font-size: 24px; color: ${EMAIL_THEME.accent}; margin: 0;">Subscription Canceled</h2>
              <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px;">
                  Your subscription to the <strong>${packageType}</strong> package has been immediately canceled. You no longer have access to the features associated with this package.
              </p>
              <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px;">
                  If you decide to re-subscribe in the future, we’ll be here to welcome you back with open arms.
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
    return { success: true, message: 'Email sent successfully.' };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, message: 'Failed to send email.' };
  }
}

export async function POST(request) {
  let event;

  /* ---------------------------------------------
     1️⃣ Verify Stripe Signature
  ----------------------------------------------*/
  try {
    const body = Buffer.from(await request.arrayBuffer());
    const signature = request.headers.get("stripe-signature");

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  /* ---------------------------------------------
     2️⃣ Only handle checkout.session.completed
  ----------------------------------------------*/
  if (event.type !== "checkout.session.completed") {
    return new Response("Event ignored", { status: 200 });
  }

  const session = event.data.object;

  if (
    session.mode !== "payment" ||
    session.payment_status !== "paid"
  ) {
    return new Response("Payment not completed", { status: 200 });
  }

  try {
    /* ---------------------------------------------
       3️⃣ Read metadata
    ----------------------------------------------*/
    const userId = Number(session.metadata?.userId);
    const priceId = session.metadata?.priceId;
    const paymentType = session.metadata?.type;

    if (!userId || !priceId || paymentType !== "one_time") {
      throw new Error("Invalid metadata");
    }

    /* ---------------------------------------------
       4️⃣ Price → Plan mapping
    ----------------------------------------------*/
    const priceMap = {
      [process.env.NEXT_PUBLIC_STRIPE_ONETIME_PRICE]: {
        leads: 25,
        type: "One Time",
      },
      [process.env.NEXT_STRIPE_STANDARD_PRICE]: {
        leads: 15,
        type: "Bronze",
      },
      [process.env.NEXT_STRIPE_GOLD_PRICE]: {
        leads: 25,
        type: "Silver",
      },
      [process.env.NEXT_STRIPE_PREMIUM_PRICE]: {
        leads: 50,
        type: "Gold",
      },
      [process.env.NEXT_PUBLIC_STRIPE_GOLD_PLUS_PRICE]: {
        leads: 50,
        type: "Silver Plus",
      },
      [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLUS_PRICE]: {
        leads: 50,
        type: "Gold Plus",
      },
    };

    const plan = priceMap[priceId];
    if (!plan) {
      throw new Error(`Price not mapped: ${priceId}`);
    }

    /* ---------------------------------------------
       5️⃣ Prevent duplicate webhook execution
    ----------------------------------------------*/
    const paymentKey = session.payment_intent || session.id;

    const alreadyProcessed = await prisma.subscription.findFirst({
      where: { subsid: paymentKey },
    });

    if (alreadyProcessed) {
      return new Response("Already processed", { status: 200 });
    }

    /* ---------------------------------------------
       6️⃣ Get previous active subscription
    ----------------------------------------------*/
    const previousSubscription = await prisma.subscription.findFirst({
      where: {
        userid: userId,
        status: "active",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    /* ---------------------------------------------
       7️⃣ Cancel previous Stripe subscription (SAFE)
    ----------------------------------------------*/
    if (previousSubscription?.subsid) {
      try {
        await stripe.subscriptions.cancel(previousSubscription.subsid);
      } catch (err) {
      }
    }

    /* ---------------------------------------------
       8️⃣ Atomic DB Transaction
    ----------------------------------------------*/
    await prisma.$transaction(async (tx) => {
      // Cancel old subscriptions in DB
      await tx.subscription.updateMany({
        where: {
          userid: userId,
          status: "active",
        },
        data: {
          status: "cancelled",
          expiredAt: Math.floor(Date.now() / 1000),
        },
      });

      // Create new subscription entry
      await tx.subscription.create({
        data: {
          userid: userId,
          subsid: paymentKey,
          customerid: session.customer
            ? session.customer.toString()
            : null,
          status: "paid",
          price: priceId,
          createdAt: Math.floor(Date.now() / 1000),
          expiredAt: null,
        },
      });

      // Update user record
      await tx.user.update({
        where: { id: userId },
        data: {
          leadUsed: 0,
          remaningLeads: plan.leads,
          subscription: true,
          type: plan.type,
          customerid: session.customer
            ? session.customer.toString()
            : null,
        },
      });
      await sendStripeEmail(session?.customer_details?.email , plan.type)
    });

    return new Response("✅ Payment processed successfully", {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
