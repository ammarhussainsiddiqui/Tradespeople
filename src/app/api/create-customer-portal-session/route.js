import { NextResponse } from 'next/server';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';
const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export async function POST(request) {
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
    const { customerId } = await request.json();

    // Create a session for the Stripe Customer Portal
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,  
      return_url: `${process.env.NEXT_BASE_URL}/tradesperson/subscription`,
    });

    // Return the session URL
    return NextResponse.json({ url: session.url });
  } catch (error) {
    Sentry.captureException('Error creating customer portal session:', error);
    return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
  }
}
