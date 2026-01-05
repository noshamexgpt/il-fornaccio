import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Traccar Client (OsmAnd Protocol) Webhook
// URL: /api/tracking/traccar
// Method: GET or POST
// Params: id (DeviceID), lat, lon, timestamp, etc.

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get('id');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');

    console.log(`[Traccar] INCOMING REQUEST: ID=${deviceId} LAT=${lat} LON=${lon} URL=${request.nextUrl.toString()}`);

    if (!deviceId || !lat || !lon) {
        return new NextResponse('Missing params', { status: 400 });
    }

    console.log(`[Traccar] Update from ${deviceId}: ${lat}, ${lon}`);

    try {
        // STRATEGY: Update ALL active deliveries with this location.
        // Since we don't have a Driver/Vehicle table yet, we assume the single driver
        // delivering orders is the one reporting.
        // In the future: Map deviceId to specific driver user.

        const activeStatuses = ['DELIVERING', 'LIVRAISON', 'ON_THE_WAY', 'READY', 'PREPARING'];

        // Find orders to update
        const result = await prisma.order.updateMany({
            where: {
                status: { in: activeStatuses },
                // Optional: Only update if it looks like a valid coordinate
                // driverLat: null // maybe? no, we want to update existing
            },
            data: {
                driverLat: lat,
                driverLng: lon,
                updatedAt: new Date() // force refresh
            }
        });

        console.log(`[Traccar] Updated ${result.count} active orders.`);

        return new NextResponse('OK', { status: 200 });

    } catch (error: any) {
        console.error('[Traccar] Error updating location:', error);
        return new NextResponse(`Internal Error: ${error.message} \nStack: ${error.stack}`, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Traccar sometimes sends POST, handle same way if params in URL
    return GET(request);
}
