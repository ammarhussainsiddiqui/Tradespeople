import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import authenticateToken from "../../authenticateToken";
import { areaSegments } from "../../../actions/auth";
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

function getLabelsByValue(array, targetValue) {
  // Filter the array to find objects where the value matches the targetValue
  const filteredLabels = array
    .filter(item => {
      if (Array.isArray(item.value)) {
        return item.value.includes(targetValue); // Check if the array contains the targetValue
      } else {
        return item.value === targetValue; // Check if the value matches directly
      }
    })
    .map(item => item.label); // Extract the labels from the matching objects

  return filteredLabels; // Return the array of labels
}
async function validatePostcode(postcode) {
  postcode = postcode.toUpperCase().replace(/\s+/g, '');
  const firstLetter = postcode.charAt(0);
  const secondChar = postcode.charAt(1);
  const prefix = postcode.slice(0, 2);

  let matchCondition = !isNaN(secondChar) ? firstLetter : prefix;
  const areas = await areaSegments();
  const LabelsByValue = getLabelsByValue(areas, matchCondition);
  // const area = areas.find((area) => {
  //   if (Array.isArray(area.value)) {
  //     return area.value.includes(matchCondition);
  //   } else {
  //     return area.value === matchCondition;
  //   }
  // });

  return LabelsByValue ? LabelsByValue : postcode;
}

export async function POST(request) {
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
    const { page = 1, pageSize = 5, myjobId } = await request.json();

  

    const skip = (page - 1) * pageSize;


    const myjob = await prisma.jobs.findUnique({
      where: { id: parseInt(myjobId) },
      include: {
          service: {
              include: {
                  mainTrade: true
              }
          }
      }
    });
   
    const postcode = myjob?.job?.postcode
    const filterTrade = myjob?.service?.mainTrade?.type;
    const filterService = myjob?.service?.type;

    let postCodeArea = await validatePostcode(postcode) || []

    if (filterTrade == "Other") {
      const tradepersonDetails = await prisma.user.findMany({
        where: {
          subscription: true,
          profileUrl: { not: null },
          AND: [
            {
              OR: [
                // Flattened postcode conditions
                ...postCodeArea.map((segment) => ({
                  postcode: segment,
                })),
                {
                  tradeLocation: {
                    some: {
                      OR: postCodeArea.map((segment) => ({
                        postcode: segment,
                      })),
                    },
                  },
                },
              ],
            }
          ],
        },
        include: {
          // tradepersonDetails: true,
          // tradeService: {
          //   include: {
          //     Service: true,
          //   },
          // },
          // tradeLocation: true,
        },
        skip: skip,
        take: pageSize,
      });
      
      const totalTradepersonsCount = await prisma.user.count({
        where: {
          subscription: true,
          profileUrl: { not: null },
          AND: [
            {
              OR: [
                // Flattened postcode conditions
                ...postCodeArea.map((segment) => ({
                  postcode: segment,
                })),
                {
                  tradeLocation: {
                    some: {
                      OR: postCodeArea.map((segment) => ({
                        postcode: segment,
                      })),
                    },
                  },
                },
              ],
            }
          ],
          
          
        },
      });

      if (!tradepersonDetails || tradepersonDetails.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No tradepersons found",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: tradepersonDetails,
          myjob,
          pagination: {
            totalItems: totalTradepersonsCount,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(totalTradepersonsCount / pageSize),
          },
        },
        { status: 200 }
      );

    } else {

      const tradepersonDetails = await prisma.user.findMany({
        where: {
          subscription: true,
          profileUrl: { not: null },
          AND: [
            {
              OR: [
                // Flattened postcode conditions
                ...postCodeArea.map((segment) => ({
                  postcode: segment,
                })),
                {
                  tradeLocation: {
                    some: {
                      OR: postCodeArea.map((segment) => ({
                        postcode: segment,
                      })),
                    },
                  },
                },
              ],
            },
            {
              OR: [
                { trade: filterTrade }, // Match the trade field
                {
                  tradeService: {
                    some: {
                      Service: {
                        type: filterService,
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        include: {
          // tradepersonDetails: true,
          // tradeService: {
          //   include: {
          //     Service: true,
          //   },
          // },
          // tradeLocation: true,
        },
        skip: skip, // Handle pagination
        take: pageSize,
      });
      
      

      // Count total tradepersons that match the filter
      const totalTradepersonsCount = await prisma.user.count({
        where: {
          subscription: true,
          profileUrl: { not: null },
          AND: [
            {
              OR: [
                // Flattened postcode conditions
                ...postCodeArea.map((segment) => ({
                  postcode: segment,
                })),
                {
                  tradeLocation: {
                    some: {
                      OR: postCodeArea.map((segment) => ({
                        postcode: segment,
                      })),
                    },
                  },
                },
              ],
            },
            {
              OR: [
                { trade: filterTrade }, // Match the trade field
                {
                  tradeService: {
                    some: {
                      Service: {
                        type: filterService,
                      },
                    },
                  },
                },
              ],
            },
          ],
          
          
        },
      });

      // If no tradepersons are found, return a message
      if (!tradepersonDetails || tradepersonDetails.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No tradepersons found",
          },
          { status: 200 }
        );
      }

      // Return the paginated tradepersons details and pagination info

      return NextResponse.json(
        {
          success: true,
          data: tradepersonDetails,
          myjob,
          pagination: {
            totalItems: totalTradepersonsCount,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(totalTradepersonsCount / pageSize),
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    Sentry.captureException("Error fetching tradepersons:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
  
}
