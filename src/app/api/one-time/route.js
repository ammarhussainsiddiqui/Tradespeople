import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/one-time
 * Body: { userId: number, sessionId: string, amount?: number }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, sessionId, amount } = body;
    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId and sessionId are required' },
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

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
