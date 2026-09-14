import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://thetradecore.com",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, ngrok-skip-browser-warning",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const skip = (page - 1) * limit;

    const [tradespersons, totalCount] = await Promise.all([
      prisma.user.findMany({
        // where: {
        //   subscription: true,
        //   profileUrl: { not: null },
        //   firstName: { not: null },
        //   lastName: { not: null },
        // },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          SubscriptionType: true,
          tradeService: {
            include: {
              Service: {
                include: {
                  mainTrade: true,
                },
              },
            },
          },
          tradeLocation: true,
          tradepersonDetails: true,
          _count: {
            select: {
              Viewed_leads: true,
              quotesProvided: true,
              jobs: true,
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
      }),

      prisma.user.count({
        where: {
          // subscription: true,
          // profileUrl: { not: null },
          // firstName: { not: null },
          // lastName: { not: null },
        },
      }),
    ]);

    const result = tradespersons.map((tp) => {
      const info = tp.tradepersonDetails?.[0]?.info || {};
  const googleReviews =
    info && typeof info.googleReviews === "object" && info.googleReviews !== null
      ? info.googleReviews
      : {};

  const googleMapName = googleReviews.name || "";
  const reviews = typeof googleReviews.rating === "number" ? googleReviews.rating : 0;
  const totalReviews =
    typeof googleReviews.totalReviews === "number" ? googleReviews.totalReviews : 0;
      return {
        profileUrl: tp.profileUrl,
        firstName: tp.firstName,
        lastName: tp.lastName,
        name: tp.name ?? "unknown",
        phone: tp.phone ?? "",
        email: tp.email ?? "",
        introduction: tp.introduction ?? "",
        services: tp.tradeService.map((ts) => ts.Service?.type).filter(Boolean),
        totalReviews: tp._count.requestMade ?? 0,
        jobsCompleted: tp._count.jobs ?? 0,
        viewedLeads: tp._count.Viewed_leads ?? 0,
        portfolioUrls: info.portfolioUrls || [],
        socialLinks: info.socialLinks || [],
        mapLink: info.maplink || '', 
        googleMapName,
        reviews,
        totalReviews,
        featured: tp.isFeatured ?? false,
        gender: tp.gender || null,
      };
    });

    return NextResponse.json(
      {
        data: result,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
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
