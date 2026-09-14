import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://thetradecore.com",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, ngrok-skip-browser-warning",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { data: [], message: "Missing search query" },
        { status: 400, headers: corsHeaders }
      );
    }

    const tradespersons = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              {
                AND: [
                  { firstName: { not: null } },
                  { lastName: { not: null } },
                  {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            ],
          },
          // { type: { not: "Deactivate" } },
        ],
      },
      take: 10,
      select: {
        profileUrl: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        email: true,
        isFeatured: true,
        introduction: true,
        tradeService: {
          select: {
            Service: {
              select: {
                type: true,
              },
            },
          },
        },
        tradepersonDetails: {
          select: {
            info: true,
          },
        },
        _count: {
          select: {
            Viewed_leads: true,
            jobs: {
              where: {
                isCompleted: true,
              },
            },
            requestMade: {
              where: {
                reviews: {
                  some: {},
                },
              },
            },
          },
        },
      },
    });

    const result = tradespersons.map((tp) => ({
      profileUrl: tp.profileUrl,
      firstName: tp.firstName,
      lastName: tp.lastName,
      name: tp.name,
      phone: tp.phone,
      email: tp.email,
      featured: tp.isFeatured,
      introduction: tp.introduction,
      services: tp.tradeService.map((ts) => ts.Service?.type),
      totalReviews: tp._count.requestMade,
      jobsCompleted: tp._count.jobs,
      viewedLeads: tp._count.Viewed_leads,
      portfolioUrls: tp.tradepersonDetails?.[0]?.info?.portfolioUrls || [],
    }));

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
