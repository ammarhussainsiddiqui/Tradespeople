

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import authenticateToken from "../../authenticateToken";
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();

export async function POST(request) {
  const { id, reviewType } = await request.json();
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  const authResult = await authenticateToken(token);

  if (authResult.error) {
    return NextResponse.json(
      {
        success: false,
        message: authResult.error,
      },
      { status: authResult.status }
    );
  }
  
  if(reviewType === "user"){
    try {
      const requests = await prisma.request.findMany({
        where: { tradepersonId: id, isReviewed: true 
      },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          job: {
            select: {
              service: true,
            },
          },
          reviews: {
            where:{
              reviewType:"user"
            },
            select: {
              message: true,
              rating: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
    
      const reviews = requests.flatMap((request) => ({
        job:request.job,
        user:request.user,
        reviews:request.reviews
      }))
  
      // Return reviews
      return NextResponse.json(reviews);
    } catch (error) {
      Sentry.captureException("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews." },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }else{
    try {
      const requests = await prisma.request.findMany({
        where: { userId: id, isReviewed: true },
        include: {
          tradeperson: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          job: {
            select: {
              service: true,
            },
          },
          reviews: {
            where:{
              reviewType:"tradeperson"
            },
            select: {
              message: true,
              rating: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
    
      const reviews = requests.flatMap((request) => ({
        job:request.job,
        tradeperson:request.tradeperson,
        reviews:request.reviews
      }))
  
      // Return reviews
      return NextResponse.json(reviews);
    } catch (error) {
      Sentry.captureException("Error fetching reviews:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews." },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }
}
