import { EMAIL_THEME } from '../../../lib/theme/emailTheme';
const Stripe = require("stripe");

const { headers } = require("next/headers");

import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import * as Sentry from '@sentry/nextjs';
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY));
const endpointSecret = process.env.NEXT_STRIPE_WEBHOOK_SECRET;
const prisma = new PrismaClient();


const sendStripeEmail = async (email, packageType) => {
  const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const PASS = (process.env.NODEMAILER_PASS || process.env.NEXT_PUBLIC_NODEMAILER_PASS);

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
If you need to view or edit your profile you can <a style="color: ${EMAIL_THEME.accent}; text-decoration: none;" href="https://app.tradepeople.co.uk/login"> log in </a>here.
  </p>
  <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
If you need support you can contact us via WhatsApp on 07741 872816 or email at hello@thetradecore.com.
  </p>
  <p style="font-size: 18px; color: ${EMAIL_THEME.text}; margin-top: 10px; line-height: 1.6;">
The Team  </p>
</div>
          <div style="margin-top: 30px; padding: 10px; border-top: 1px solid ${EMAIL_THEME.accent};">
              <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">© 2024. All rights reserved.</p>
              <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">Visit us at <a href="https://tradepeople.co.uk" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">tradepeople.co.uk</a></p>
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


const sendUpdateStripeEmail = async (email, packageType) => {
  const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const PASS = (process.env.NODEMAILER_PASS || process.env.NEXT_PUBLIC_NODEMAILER_PASS);

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
              <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">Visit us at <a href="https://tradepeople.co.uk" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">tradepeople.co.uk</a></p>
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


const sendCancelStripeEmail = async (email, packageType) => {
  const USER = process.env.NEXT_PUBLIC_NODEMAILER_USER;
  const PASS = (process.env.NODEMAILER_PASS || process.env.NEXT_PUBLIC_NODEMAILER_PASS);

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
              <p style="font-size: 12px; color: ${EMAIL_THEME.mutedText};">Visit us at <a href="https://tradepeople.co.uk" style="color: ${EMAIL_THEME.accent}; text-decoration: none;">tradepeople.co.uk</a></p>
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
  const body = await request.text();

  const sig = headers().get("stripe-signature");
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    Sentry.captureException(err, {
      level: 'error',
      contexts: { stripe: { message: 'Webhook signature verification failed' } },
    });
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
    });
  }

  const eventType = event.type;
  Sentry.addBreadcrumb({
    category: 'stripe.webhook',
    message: `Received Stripe event: ${eventType}`,
    level: 'info',
  });

  try {
    // Handle successful subscription creation payment
    if (eventType === "checkout.session.completed") {
      const session = event.data.object;
      // Only handle one-time payments
      if (session.mode === "payment") {
        const userId = parseInt(session.metadata.userId);
        const priceId = session.metadata.priceId;

        // Prevent duplicates
        const existing = await prisma.subscription.findFirst({
          where: {
            userid: Number(session?.metadata?.userId),
            status: "active",
          },
          orderBy: {
            createdAt: "desc", // latest record
          },
        });

          await prisma.subscription.create({
            data: {
              userid: userId,
              status: "paid",
              customerid: session.customer?.toString() || null,
              subsid: session.id,
              price: priceId,
              createdAt: Math.floor(Date.now() / 1000),
              expiredAt: null,
            },
          });

          // Map leads/type
          let leads = 0;
          let typeOfSubs = "Deactivate";
          const priceMap = {
            [process.env.NEXT_STRIPE_STANDARD_PRICE]: { leads: 15, type: "Bronze" },
            [process.env.NEXT_STRIPE_GOLD_PRICE]: { leads: 25, type: "Silver" },
            [process.env.NEXT_STRIPE_PREMIUM_PRICE]: { leads: 50, type: "Gold" },
            [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLUS_PRICE]: { leads: 50, type: "Gold Plus" },
            [process.env.NEXT_PUBLIC_STRIPE_GOLD_PLUS_PRICE]: { leads: 50, type: "Silver Plus" },
            [process.env.NEXT_PUBLIC_STRIPE_ONETIME_PRICE]: { leads: 25, type: "One Time" },
          };
          const plan = priceMap[priceId];
          if (plan) {
            leads = plan.leads;
            typeOfSubs = plan.type;
          }
          await prisma.user.update({
            where: { id: userId },
            data: {
              leadUsed: 0,
              remaningLeads: leads,
              subscription: true,
              customerid: session.customer?.toString() || null,
              type: typeOfSubs,
            },
          });
          await sendCancelStripeEmail(session.customer_details?.email, typeOfSubs);
          await sendStripeEmail(session.customer_details?.email, typeOfSubs);
          await stripe.subscriptions.cancel(existing.subsid);

        Sentry.captureMessage("One-time payment processed successfully", "info");
        return new Response("One-time payment handled!", { status: 200 });
      }

      else {
        // Check if the payment was for a subscription creation
        const dataSubs = event.data.object;

        Sentry.setContext("checkout.session.completed", {
          customer_email: dataSubs?.customer_details?.email,
          subscription_id: dataSubs?.subscription,
          userId: dataSubs?.metadata?.userId,
        });

        Sentry.captureMessage("Stripe checkout.session.completed received", 'info');

        const existingSubscription = await prisma.subscription.findFirst({
          where: { subsid: dataSubs?.subscription }, // Assumes subsid is unique
        });
        if (!existingSubscription) {
          const subscription = await stripe.subscriptions.retrieve(
            dataSubs.subscription
          );
          const createSubscription = await prisma.subscription.create({
            data: {
              customerid: dataSubs?.customer,
              subsid: dataSubs?.subscription,
              price: dataSubs?.metadata?.priceId,
              status: "active",
              userid: parseInt(dataSubs?.metadata?.userId),
              createdAt: parseInt(subscription?.start_date),
              expiredAt: parseInt(subscription?.current_period_end),
            },
          });
        }
        let leads = 0;
        let typeOfSubs = "Deactivate";
        const priceMap = {
          [process.env.NEXT_STRIPE_STANDARD_PRICE]: { leads: 15, type: "Bronze" },
          [process.env.NEXT_STRIPE_GOLD_PRICE]: { leads: 25, type: "Silver" },
          [process.env.NEXT_STRIPE_PREMIUM_PRICE]: { leads: 50, type: "Gold" },
          [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLUS_PRICE]: { leads: 50, type: "Gold Plus" },
          [process.env.NEXT_PUBLIC_STRIPE_GOLD_PLUS_PRICE]: { leads: 50, type: "Silver Plus" },
          [process.env.NEXT_PUBLIC_STRIPE_ONETIME_PRICE]: { leads: 25, type: "One Time" },
        };
        const plan = priceMap[dataSubs?.metadata?.priceId];
        if (plan) {
          leads = plan.leads;
          typeOfSubs = plan.type;
        }

        const userUpdate = await prisma.user.update({
          where: { id: parseInt(dataSubs?.metadata?.userId) },
          data: {
            leadUsed: 0,
            remaningLeads: parseInt(leads),
            subscription: true,
            customerid: dataSubs?.customer,
            type: typeOfSubs,
          },
        });
        await sendStripeEmail(dataSubs?.customer_details?.email, typeOfSubs)
        Sentry.captureMessage("Subscription created successfully", 'info');
        return new Response("Subscription Created!", {
          status: 200,
        });
      }
    }

    if (eventType === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      if (invoice.billing_reason === "subscription_create") {
        Sentry.addBreadcrumb({ message: "Initial subscription payment handled previously", level: 'info' });
        return new Response("First payment handled", { status: 200 });
      }

      const existingSubscription = await prisma.subscription.findFirst({ where: { subsid: subscriptionId } });
      if (!existingSubscription) {
        Sentry.captureMessage(`No subscription found for ${subscriptionId}`, 'warning');
        return new Response("No subscription found", { status: 200 });
      }

      let leads = 0, typeOfSubs = "Deactivate";
      const priceId = invoice.lines.data[0].plan.id;
      const plan = {
        [process.env.NEXT_STRIPE_STANDARD_PRICE]: { leads: 15, type: "Bronze" },
        [process.env.NEXT_STRIPE_GOLD_PRICE]: { leads: 25, type: "Silver" },
        [process.env.NEXT_STRIPE_PREMIUM_PRICE]: { leads: 50, type: "Gold" },
        [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLUS_PRICE]: { leads: 50, type: "Gold Plus" },
        [process.env.NEXT_PUBLIC_STRIPE_GOLD_PLUS_PRICE]: { leads: 50, type: "Silver Plus" },
        [process.env.NEXT_PUBLIC_STRIPE_ONETIME_PRICE]: { leads: 25, type: "One Time" },
      }[priceId] || {};
      if (plan.type) { leads = plan.leads; typeOfSubs = plan.type; }

      await prisma.user.update({
        where: { id: existingSubscription.userid },
        data: { leadUsed: 0, remaningLeads: leads, subscription: true, type: typeOfSubs },
      });

      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "active",
          createdAt: parseInt(invoice?.period_start),
          expiredAt: invoice.lines.data[0].period.end,
        },
      });
      Sentry.captureMessage(`Subscription renewed successfully: ${subscriptionId}`, 'info');
      return new Response("Subscription Renewed!", { status: 200 });
    }

    if (eventType === "customer.subscription.deleted") {
      const dataDelete = event.data.object;

      const getSubscription = await prisma.subscription.findFirst({
        where: { subsid: dataDelete?.id },
      });

      if (!getSubscription) {
        Sentry.captureMessage(`Deleted subscription not found: ${dataDelete?.id}`, 'warning');
        return new Response("Subscription not found", { status: 200 });
      }

      const findUser = await prisma.user.findFirst({
        where: { id: getSubscription?.userid },
      });
      if (!findUser.type == "One Time") {
      await sendCancelStripeEmail(findUser?.email, findUser?.type);

      const subscriptionUpdate = await prisma.subscription.update({
        where: { id: parseInt(getSubscription?.id) },
        data: { status: dataDelete?.status },
      });

      const userUpdate = await prisma.user.update({
        where: { id: parseInt(getSubscription?.userid) },
        data: {
          subscription: false,
          customerid: "",
          remaningLeads: 0,
          type: "Deactivate"
        },
      });
    }
      Sentry.captureMessage(`Subscription deleted: ${dataDelete?.id}`, 'info');
      return new Response("Subscription Deleted!", {
        status: 200,
      });
    }

    if (eventType === "customer.subscription.updated") {
      const invoice = event.data.object;
      const subscriptionId = invoice?.id;
      const prev = event.data.previous_attributes || {};
      const planChanged = prev.items && prev.items.data?.[0]?.price?.id !== invoice.items.data?.[0]?.price?.id;
      const couponChanged = Object.hasOwn(prev, "discount") || Object.hasOwn(prev, "coupon");

      if (!planChanged && couponChanged) {
        Sentry.addBreadcrumb({ message: "Coupon applied, no plan change", level: 'info' });
        return new Response("Coupon applied — no plan change", { status: 200 });
      }

      if (!planChanged) {
        return new Response("No plan change", { status: 200 });
      }
      const existingSubscription = await prisma.subscription.findFirst({
        where: { subsid: subscriptionId },
      });

      if (existingSubscription) {
        Sentry.captureMessage(`Subscription update event for unknown ID: ${subscriptionId}`, 'warning');
        return new Response("No subscription found", { status: 200 });
      }

      let leads = 0, typeOfSubs = "Deactivate";
      const planMap = {
        [process.env.NEXT_STRIPE_STANDARD_PRICE]: { leads: 15, type: "Bronze" },
        [process.env.NEXT_STRIPE_GOLD_PRICE]: { leads: 25, type: "Silver" },
        [process.env.NEXT_STRIPE_PREMIUM_PRICE]: { leads: 50, type: "Gold" },
        [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLUS_PRICE]: { leads: 50, type: "Gold Plus" },
        [process.env.NEXT_PUBLIC_STRIPE_GOLD_PLUS_PRICE]: { leads: 50, type: "Silver Plus" },
        [process.env.NEXT_PUBLIC_STRIPE_ONETIME_PRICE]: { leads: 25, type: "One Time" },
      };
      const plan = planMap[invoice.plan.id];
      if (plan) { leads = plan.leads; typeOfSubs = plan.type; }

      const existingUser = await prisma.user.findFirst({
        where: { id: existingSubscription?.userid }, // Assumes subsid is unique
      });
      if (!existingUser?.subscription) {
        Sentry.captureMessage(`User inactive during update: ${existingUser?.id}`, 'warning');
      } else {
        const userUpdate = await prisma.user.update({
          where: { id: parseInt(existingSubscription.userid) },
          data: {
            leadUsed: 0,
            remaningLeads: parseInt(leads),
            type: typeOfSubs,
          },
        });

        const subscriptionUpdate = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "active",
            price: invoice.plan.id,
            createdAt: parseInt(invoice?.current_period_start),
            expiredAt: parseInt(invoice?.current_period_end),
          },
        });

        await sendUpdateStripeEmail(existingUser?.email, typeOfSubs);
        Sentry.captureMessage(`Subscription updated: ${subscriptionId}`, 'info');
      }
      // Respond to Stripe to acknowledge receipt of the event
      return new Response("Subscription Updated!", {
        status: 200,
      });
    }

    if (eventType === "invoice.payment_failed") {
      Sentry.captureMessage("Payment failed event received", 'warning');
      return new Response("Subscription Not Complete!", {
        status: 400,
      });
    }

    // Default unhandled
    Sentry.captureMessage(`Unhandled Stripe event: ${eventType}`, 'warning');
    return new Response("Unhandled event type", { status: 400 });
  } catch (error) {
    Sentry.captureException(error, {
      level: 'error',
      contexts: { stripe: { eventType } },
    });
    return new Response("Internal Error", { status: 500 });
  }
}
