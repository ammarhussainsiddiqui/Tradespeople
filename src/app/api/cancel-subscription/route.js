import Stripe from "stripe";
import authenticateToken from '../../authenticateToken';
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from '@sentry/nextjs';
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY));

export async function DELETE(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  const authResult = await authenticateToken(token);
  
  if (authResult.error) {
      return NextResponse.json({
        success: false,
        message: authResult.error,
      }, { status: authResult.status });
  }
  try {
    const { subscriptionId } = await request.json(); // Extract the subscription ID from the request body

    // Step 1: Cancel the subscription
    const canceledSubscription = await stripe.subscriptions.cancel(tx.subscription);

    return NextResponse.json({ result: canceledSubscription, ok: true });

  } catch (error) {
    Sentry.captureException("Error canceling subscription:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
