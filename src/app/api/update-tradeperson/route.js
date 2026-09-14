import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../../authenticateToken';
import * as Sentry from '@sentry/nextjs';
const prisma = new PrismaClient();


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
        const body = await request.json();
        const { userId, info } = body;

        // Validate input
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required',
            }, { status: 400 });
        }
        let updatedInfo = { ...info };

        if (maplink) {
            try {

                // Extract coordinates (lng, lat)
                const coordMatch = maplink.match(/!2d([\d.-]+)!3d([\d.-]+)/);
                // Extract business name (the text after !2s and before !5e or next !)
                const nameMatch = maplink.match(/!2s([^!]+)!/);

                if (!coordMatch) {
                }

                const lng = coordMatch?.[1];
                const lat = coordMatch?.[2];
                const rawName = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
                const businessName = rawName?.replace(/\+/g, " ").trim();


                if (lat && lng && businessName) {
                    // ✅ Step 1: Try Find Place by Name near coordinates
                    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
                        businessName
                    )}&inputtype=textquery&locationbias=point:${lat},${lng}&fields=place_id,name,rating,user_ratings_total&key=${process.env.GOOGLE_MAPS_API_KEY
                        }`;

                    const findPlaceRes = await fetch(findPlaceUrl);
                    const findPlaceData = await findPlaceRes.json();

                    if (findPlaceData?.candidates?.[0]) {
                        const biz = findPlaceData.candidates[0];

                        updatedInfo.googleReviews = {
                            name: biz.name,
                            rating: biz.rating || null,
                            totalReviews: biz.user_ratings_total || 0,
                        };
                    } else {

                        // ⚙️ Step 2 (fallback): Reverse geocode → get place_id
                        const geoRes = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
                        );
                        const geoData = await geoRes.json();

                        if (geoData.results?.length > 0) {
                            const placeId = geoData.results[0].place_id;
                            const placeRes = await fetch(
                                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total&key=${process.env.GOOGLE_MAPS_API_KEY}`
                            );
                            const placeData = await placeRes.json();

                            if (placeData?.result?.rating) {
                                updatedInfo.googleReviews = {
                                    name: placeData.result.name,
                                    rating: placeData.result.rating,
                                    totalReviews: placeData.result.user_ratings_total,
                                };
                            } else {
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Google API fetch failed:", err);
            }
        }

        // Check if TradepersonDetail already exists
        const existingTradepersonDetail = await prisma.tradepersonDetail.findFirst({
            where: { userId: Number(userId) },
        });

        let tradepersonDetail;

        if (existingTradepersonDetail) {
            // Update existing TradepersonDetail
            tradepersonDetail = await prisma.tradepersonDetail.update({
                where: { id: existingTradepersonDetail.id }, // Use the unique `id` to update
                data: { info: updatedInfo },
            });
        } else {
            // Create new TradepersonDetail
            tradepersonDetail = await prisma.tradepersonDetail.create({
                data: {
                    userId: Number(userId),
                    info: updatedInfo,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: tradepersonDetail,
        }, { status: 200 });

    } catch (error) {
        //console.error('Error:', error);
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}


export async function GET(request) {
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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        // Validate input
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required',
            }, { status: 400 });
        }

        // Fetch TradepersonDetail based on userId
        const tradepersonDetail = await prisma.tradepersonDetail.findFirst({
            where: { userId: Number(userId) },
        });

        if (!tradepersonDetail) {
            return NextResponse.json({
                success: false,
                message: 'Tradeperson detail not found',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: tradepersonDetail,
        }, { status: 200 });

    } catch (error) {
        //console.error('Error:', error);
        Sentry.captureException('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error.',
        }, { status: 500 });
    }
}



