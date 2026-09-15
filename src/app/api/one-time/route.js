import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { forbidden, getRequestUser, unauthorized } from '../../../lib/auth/session';

const prisma = new PrismaClient();

/**
 * POST /api/one-time
 * Body: { sessionId: string } — a Stripe Checkout session ID.
 * The user comes from the session token and the amount from Stripe, so a plan
 * can only be activated for a real, paid checkout by the person who paid.
 */
export async function POST(req) {
  const caller = await getRequestUser(req);
  if (!caller) return unauthorized();

  try {
    const body = await req.json();
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Idempotency check
    const alreadyProcessed = await prisma.subscription.findUnique({
      where: { subsid: sessionId },
    });

    if (alreadyProcessed) {
      return NextResponse.json(
        { message: 'One-time payment already processed' },
        { status: 200 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json({ error: 'Checkout session not found' }, { status: 400 });
    }

    if (session.mode !== 'payment' || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment has not been completed' }, { status: 402 });
    }

    const sessionUserId = session.metadata?.userId ?? session.client_reference_id;
    if (sessionUserId && Number(sessionUserId) !== caller.id) return forbidden();

    const amount = session.amount_total != null ? session.amount_total / 100 : null;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: caller.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (prisma) => {
      // Cancel existing subscriptions
      const cancelled = await prisma.subscription.updateMany({
        where: { userid: user.id },
        data: { status: 'cancelled', expiredAt: Math.floor(Date.now() / 1000) },
      });
      // Deactivate user
      await prisma.user.update({
        where: { id: user.id },
        data: { type: 'Deactivate', subscription: false },
      });

      // Fetch ONE_TIME subscription type
      const oneTimeType = await prisma.subscription_Type.findUnique({
        where: { type: 'One Time' },
      });
      if (!oneTimeType) {
        throw new Error('ONE_TIME subscription type not configured');
      }

      // Create ONE_TIME subscription
      const newSub = await prisma.subscription.create({
        data: {
          userid: user.id,
          subsid: sessionId,
          customerid: user.customerid,
          status: 'paid',
          price: amount?.toString() ?? null,
          createdAt: Math.floor(Date.now() / 1000),
          expiredAt: null,
        },
      });
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          type: oneTimeType.type,
          remaningLeads: { increment: oneTimeType.leadCount ?? 0 },
          subscription: true,
        },
      });
    });

    return NextResponse.json(
      { message: 'One-time subscription activated successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
