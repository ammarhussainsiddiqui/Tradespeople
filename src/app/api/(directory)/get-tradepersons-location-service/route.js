import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://tradepeople.co.uk',
   'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const locationParams = searchParams.get('location')?.split(',') || [];
    const serviceParams = searchParams.get('service')?.split(',') || [];
    const genderParam = searchParams.get('gender')?.toLowerCase();
    const userIdParam = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 5;
    const skip = (page - 1) * limit;

    if (locationParams.length === 0 || serviceParams.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters: location and service are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const locationFilter = {
      OR: [
        ...locationParams.map((loc) => ({
          postcode: { contains: loc, mode: 'insensitive' },
        })),
        {
          tradeLocation: {
            some: {
              OR: locationParams.map((loc) => ({
                postcode: { contains: loc, mode: 'insensitive' },
              })),
            },
          },
        },
      ],
    };

    const serviceFilter = {
      OR: [
        ...serviceParams.map((s) => ({
          trade: { contains: s, mode: 'insensitive' },
        })),
        {
          tradeService: {
            some: {
              OR: serviceParams.map((s) => ({
                Service: {
                  type: { equals: s, mode: 'insensitive' },
                },
              })),
            },
          },
        },
      ],
    };
const genderParams = searchParams.get('gender')?.split(',').map(g => g.trim().toLowerCase()) || [];

const genderFilter = genderParams.length > 0
  ? {
      gender: {
        in: genderParams,
        mode: 'insensitive',
      },
    }
  : {};

const userIdFilter = userIdParam
  ? {
      id: parseInt(userIdParam),
    }
  : {};

    // const activeFilter = {
    //   type: {
    //     not: 'Deactivate',
    //   },
    // };

    const [tradespersons, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: {
          // profileUrl: { not: null },
          // firstName: { not: null },
          // lastName: { not: null },
          AND: [locationFilter, serviceFilter, 
            // activeFilter, 
            genderFilter, userIdFilter],
        },
        skip,
        take: limit,
        select: {
          id: true,
          profileUrl: true,
          firstName: true,
          lastName: true,
          name: true,
          username: true,
          phone: true,
          email: true,
          introduction: true,
          postcode: true,
          trade: true,
          subscription: true,
          SubscriptionType: true,
          createdAt: true,
          isFeatured: true,
          gender: true,
          tradeLocation: {
            select: {
              id: true,
              postcode: true,
              distance: true,
            },
          },
          tradeService: {
            select: {
              id: true,
              Service: {
                select: {
                  id: true,
                  type: true,
                  mainTrade: {
                    select: {
                      id: true,
                      type: true,
                    },
                  },
                },
              },
            },
          },
          tradepersonDetails: {
            select: {
              id: true,
              info: true,
            },
          },
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
        orderBy: [
          { isFeatured: 'desc' },
          { SubscriptionType: { 
            id: 'desc'
          } 
        },]
      }),

      prisma.user.count({
        where: {
          AND: [locationFilter, serviceFilter, 
            //activeFilter  
            genderFilter, userIdFilter],
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
      const services = Array.from(new Set([
    ...(tp.trade ? [tp.trade] : []),
    ...tp.tradeService.map(ts => ts.Service?.type).filter(Boolean),
  ]));
      return {      
      profileUrl: tp.profileUrl,
      firstName: tp.firstName,
      lastName: tp.lastName,
      name: tp.name,
      phone: tp.phone,
      email: tp.email,
      introduction: tp.introduction,
      services,
      totalReviews: tp._count.requestMade,
      jobsCompleted: tp._count.jobs,
      viewedLeads: tp._count.Viewed_leads,
      portfolioUrls: tp.tradepersonDetails?.[0]?.info?.portfolioUrls || [],
      socialLinks: info.socialLinks || [], 
      mapLink: info.maplink || '', 
        googleMapName,
        reviews,
        totalReviews,
      featured: tp.isFeatured ?? false,
      gender: tp.gender ?? null, 
    }});

    return NextResponse.json(
      {
        data: result,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        filters: {
          location: locationParams,
          service: serviceParams,
          gender: genderParam || null,
          user_id: userIdParam || null,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
