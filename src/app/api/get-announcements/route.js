// import { NextResponse } from 'next/server'; 
// import { PrismaClient } from '@prisma/client'; 
// import authenticateToken from '../../authenticateToken'; 
// import * as Sentry from '@sentry/nextjs';

// const prisma = new PrismaClient(); 

// export async function POST(req) {
//   const authHeader = req.headers.get('authorization');
//   const token = authHeader && authHeader.split(' ')[1];
//   const authResult = await authenticateToken(token);

//   // If token authentication fails, return error
//   if (authResult.error) {
//     return NextResponse.json({
//       success: false,
//       message: authResult.error,
//     }, { status: authResult.status });
//   }

//   try {
//     // Fetch all announcements from the database
//     const announcements = await prisma.announcement.findMany({
//       orderBy: {
//         createdAt: 'desc', // Sorting announcements by the creation date (most recent first)
//       },
//     });

//     // If no announcements found, return an error message
//     if (!announcements || announcements.length === 0) {
//       return NextResponse.json(
//         { error: 'No announcements found.' },
//         { status: 404 }
//       );
//     }

//     // Return the announcements data
//     return NextResponse.json({
//       success: true,
//       announcements,
//     }, { status: 200 });
    
//   } catch (error) {
//     // Log the error to Sentry for further tracking
//     Sentry.captureException(error);

//     return NextResponse.json(
//       { error: 'An error occurred while fetching the announcements.' },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from 'next/server'; 
import { PrismaClient } from '@prisma/client'; 
import authenticateToken from '../../authenticateToken'; 
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient(); 

export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  const authResult = await authenticateToken(token);

  // If token authentication fails, return error
  if (authResult.error) {
    return NextResponse.json({
      success: false,
      message: authResult.error,
    }, { status: authResult.status });
  }

  try {
    const { id, roleId } = await req.json();

    let announcements;
    if (id) {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        return NextResponse.json(
          { error: 'Invalid announcement ID. Must be a valid integer.' },
          { status: 400 }
        );
      }

      // If ID is provided, fetch the specific announcement
      announcements = await prisma.announcement.findUnique({
        where: { id: parsedId },
      });

      // If no specific announcement is found, return a 404 error
      if (!announcements) {
        return NextResponse.json(
          { error: 'Announcement not found.' },
          { status: 404 }
        );
      }
    } else {
      // If no ID is provided, fetch all announcements
      announcements = await prisma.announcement.findMany({
        where: {
          OR: [
            { roleId: roleId ?? undefined },
            { roleId: null },
          ],
        },
        orderBy: {
          createdAt: 'desc', // Sorting announcements by the creation date (most recent first)
        },
      });

      // If no announcements found, return a 404 error
      if (!announcements || announcements.length === 0) {
        return NextResponse.json(
          { error: 'No announcements found.' },
          { status: 404 }
        );
      }
    }

    // Return the announcements data
    return NextResponse.json({
      success: true,
      announcements: announcements,
    }, { status: 200 });
    
  } catch (error) {
    // Log the error to Sentry for further tracking
    Sentry.captureException(error);

    return NextResponse.json(
      { error: 'An error occurred while fetching the announcements.' },
      { status: 500 }
    );
  }
}
