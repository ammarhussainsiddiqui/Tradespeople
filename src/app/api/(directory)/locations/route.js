import { NextResponse } from 'next/server';
import { updatedAreaSegments } from '../../../../actions/auth';

export async function GET() {
  try {
    const locations = await updatedAreaSegments();
    const labels = locations
  .map((loc) => loc.label)
  .sort((a, b) => a.localeCompare(b));

return NextResponse.json(
  { success: true, labels },
  {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://tradepeople.co.uk',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
    },
  }
);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch location labels' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://tradepeople.co.uk',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
    },
  });
}