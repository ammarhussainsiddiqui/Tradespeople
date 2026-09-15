import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import authenticateToken from '../../authenticateToken';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY));
const JWT_SECRET = (process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET);

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
    const { priceId, token } = await request.json();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = decoded;
    const priceInfo = await stripe.prices.retrieve(priceId);
    
    const userData = await prisma.user.findUnique({
      where: { id: user?.userId },
    });
    const isRecurring = priceInfo.type === "recurring";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: userData?.email,
      line_items: [
        {
          price: priceId, // This will be your Stripe price ID
          quantity: 1,
        },
      ],
      mode: isRecurring ? "subscription" : "payment",
      // discounts:[{
      //    promotion_code: 'promo_1RomJIP8YpDFslGBwPld4V6U',
      // }],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_BASE_URL}/tradesperson/thankyou`,
      cancel_url: `${process.env.NEXT_BASE_URL}/tradesperson/subscription`,
      metadata: {
        userId: userData?.id, // Example metadata, replace with actual user data if necessary
        priceId,
        type: isRecurring ? "subscription" : "one_time",
      },
    });

    return NextResponse.json({ result: checkoutSession, ok: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request) {
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
    const { subscriptionId, priceId, token } = await request.json();

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = decoded;

    const userData = await prisma.user.findUnique({
      where: { id: user?.userId },
    });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id, // Keep the first subscription item
            price: priceId, // Replace it with the new price ID
          },
        ],
        metadata: {
          userId: userData?.id, // Example metadata, replace with actual user data if necessary
          priceId,
        },
      }
    );

    return NextResponse.json({ result: updatedSubscription, ok: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request) {
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
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = decoded;

    // const userData = await prisma.user.findUnique({
    //   where: { id: user?.userId },
    // });

    const userData = await prisma.user.update({
      where: { id: user?.userId },
      data: { type : "Free", leadUsed: 0 , remaningLeads: 5 , subscription : true},
    });

    //injected code


    return NextResponse.json({ result: userData, ok: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
