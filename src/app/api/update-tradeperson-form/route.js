import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import authenticateToken from "../../authenticateToken";
import {
  uploadPortfolioFilesToS3,
  uploadCompanyFilesToS3,
} from "../../../utils/imageUploads";
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

function isUrl(value) {
  // Regular expression to match a URL
  const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
  return urlPattern.test(value);
}

export async function PUT(request) {
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
  try {
    const formData = await request.formData();
    //
    const userId = formData.get("id");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const maplink = formData.get("mapLink");
    const description = formData.get("description");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const companyLogoUrl = formData.getAll("companyLogoUrl");
    const companyName = formData.get("companyName");
    const companyEmail = formData.get("companyEmail");
    const companyPhone = formData.get("companyPhone");
    const companyLocation = formData.get("companyLocation");
    const companySize = formData.get("companySize");
    const businessYears = formData.get("businessYears");
    const companyDescription = formData.get("companyDescription");
    // return NextResponse.json(
    //   {
    //     success: false,
    //     message: authResult.error,
    //   },
    //   { status: authResult.status }
    // );
    //
    const profileUrl0 = formData.get("portfolioUrls[0]");
    const profileUrl1 = formData.get("portfolioUrls[1]");
    const profileUrl2 = formData.get("portfolioUrls[2]");
    const profileUrl3 = formData.get("portfolioUrls[3]");
    const profileUrl4 = formData.get("portfolioUrls[4]");
    const profileUrl5 = formData.get("portfolioUrls[5]");
    const profileUrl6 = formData.get("portfolioUrls[6]");
    const profileUrl7 = formData.get("portfolioUrls[7]");
    const profileUrl8 = formData.get("portfolioUrls[8]");
    const profileUrl9 = formData.get("portfolioUrls[9]");
    // Create the array and filter out undefined values
    const allProfileUrls = [
      profileUrl0,
      profileUrl1,
      profileUrl2,
      profileUrl3,
     profileUrl4,
     profileUrl5,
     profileUrl6,
     profileUrl7,
     profileUrl8,
     profileUrl9
    ].filter((url) => url !== null);

    // Separate valid URLs into another array
    const validUrls = [];
    const invalidUrls = [];

    allProfileUrls.forEach((url) => {
      try {
        new URL(url); // Checks if URL is valid
        validUrls.push(url); // Add to validUrls if valid
      } catch (error) {
        invalidUrls.push(url); // Add to invalidUrls if invalid
      }
    });

    let uploadedImage = [];
    if (invalidUrls.length > 0) {
      uploadedImage = await uploadPortfolioFilesToS3(invalidUrls);
    }
    const mergedUrls = [...uploadedImage, ...validUrls];

    let uploadedLogoImage = "";
    if (companyLogoUrl.length > 0) {
      if (!isUrl(companyLogoUrl)) {
        uploadedLogoImage = await uploadCompanyFilesToS3(companyLogoUrl);
      } else {
        uploadedLogoImage = companyLogoUrl[0];
      }
      // try {
      //   new URL(url); // Checks if URL is valid
      //   uploadedLogoImage = companyLogoUrl;
      // } catch (error) {
      //   uploadedLogoImage = await uploadCompanyFilesToS3(companyLogoUrl);
      // }
    }

    const info = {
      id: userId,
      email,
      phone,
      lastName,
      firstName,
      maplink,
      profileUrl: null,
      companyName,
      companySize,
      description,
      companyEmail,
      companyPhone,
      businessYears,
      portfolioUrls: mergedUrls,
      companyLogoUrl: uploadedLogoImage,
      companyLocation,
      companyDescription,
    };
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
      }
    }

    // Validate input
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Check if TradepersonDetail already exists
    const existingTradepersonDetail = await prisma.tradepersonDetail.findFirst({
      where: { userId: Number(userId) },
    });

    let tradepersonDetail;

    if (existingTradepersonDetail) {
      // Update existing TradepersonDetail
      const mergedInfo = {
        ...existingTradepersonDetail.info,
        ...Object.fromEntries(
          Object.entries(updatedInfo).filter(([_, value]) => value !== null && value !== undefined)
        ),
      };
      tradepersonDetail = await prisma.tradepersonDetail.update({
        where: { id: existingTradepersonDetail.id }, // Use the unique `id` to update
        data: { info: mergedInfo },
      });
    } else {
      // Create new TradepersonDetail
      tradepersonDetail = await prisma.tradepersonDetail.create({
        data: {
          userId: Number(userId),
          info: updatedInfo },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: tradepersonDetail,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
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
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    // Validate input
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Fetch TradepersonDetail based on userId
    const tradepersonDetail = await prisma.tradepersonDetail.findFirst({
      where: { userId: Number(userId) },
    });

    if (!tradepersonDetail) {
      return NextResponse.json(
        {
          success: false,
          message: "Tradeperson detail not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: tradepersonDetail,
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
