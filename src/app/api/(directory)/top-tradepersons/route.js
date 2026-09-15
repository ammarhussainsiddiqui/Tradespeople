import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://tradepeople.co.uk',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
};
export async function GET() {
  try {
    const featuredTradespersons = await prisma.featuredTradesperson.findMany({
      include: {
        user: {
          select: {
            id: true,
            profileUrl: true,
            name: true,
            firstName: true,
            lastName: true,
            introduction: true,
            phone: true,
            email: true,
            isFeatured: true,
            trade: true,
            tradeLocation: {
              select: {
                id: true,
                postcode: true,
                distance: true,
              },
            },
            tradeService: {
              select: {
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
                info: true,
              },
            },
            _count: {
              select: {
                Viewed_leads: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
const result = featuredTradespersons
  .filter(fp =>
    fp.user &&
    fp.user.firstName !== null &&
    fp.user.lastName !== null &&
    fp.user.profileUrl !== null
  )
  .map(fp => {
    const user = fp.user;
    const info = user.tradepersonDetails?.[0]?.info || {};
    const googleReviews =
    info && typeof info.googleReviews === "object" && info.googleReviews !== null
      ? info.googleReviews
      : {};

  const googleMapName = googleReviews.name || "";
  const reviews = typeof googleReviews.rating === "number" ? googleReviews.rating : 0;
  const totalReviews =
    typeof googleReviews.totalReviews === "number" ? googleReviews.totalReviews : 0;
    const services = Array.from(new Set([
    ...(user.trade ? [user.trade] : []),
    ...user.tradeService.map(ts => ts.Service?.type).filter(Boolean),
  ]));
    return {
      id: user.id,
      profileUrl: user.profileUrl ?? null,
      name: user.name ?? 'unknown',
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      introduction: user.introduction ?? null,
      phone: user.phone ?? null,
      email: user.email ?? null,
      featured: user.isFeatured ?? false,
      Viewed_leads: user._count.Viewed_leads ?? 0,
      socialLinks: info.socialLinks || [],
      mapLink: info.maplink || '', 
        googleMapName,
        reviews,
        totalReviews,
      portfolioUrls: info?.portfolioUrls || [],
      services
    };
  });
    return NextResponse.json({ 
      data: result,
      }, {
        status: 200,
          headers: {
              'Access-Control-Allow-Origin': 'https://tradepeople.co.uk',
              'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
            },
      });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No content
    headers: corsHeaders,
  });
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
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const existing = await prisma.featuredTradesperson.findUnique({ where: { userId } });

    if (existing) {
      return NextResponse.json({ error: 'User already featured' }, { status: 400 });
    }

    const added = await prisma.featuredTradesperson.create({ data: { userId } });

    return NextResponse.json({ message: 'User added to featured', data: added }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
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
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await prisma.featuredTradesperson.delete({ where: { userId } });

    return NextResponse.json({ message: 'User removed from featured list' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
    const featured = await prisma.featuredTradesperson.findMany();

    if (featured.length < 2) {
      return NextResponse.json({ message: 'Not enough users to shuffle' }, { status: 200 });
    }

    const shuffled = featured
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    const now = new Date();
    const updates = await Promise.all(
      shuffled.map((item, index) =>
        prisma.featuredTradesperson.update({
          where: { id: item.id },
          data: {
            createdAt: new Date(now.getTime() - index * 1000),
          },
        })
      )
    );

    return NextResponse.json({ message: 'Featured list shuffled', data: updates }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}