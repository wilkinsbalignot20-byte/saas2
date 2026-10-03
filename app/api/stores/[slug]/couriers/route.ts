 // app/api/stores/[slug]/couriers/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 1. GET METHOD: TENANT ISOLATION FLEET COURIER FETCHER
 */
export async function GET(
  request: Request,
  context: { params: any }
) {
  try {
    // 🛡️ SMART SLUG RESOLUTION
    // Kinukuha natin ang slug mula sa context params ng Next.js dynamic folders,
    // o kaya naman ay mula sa query parameters ng active request url.
    const resolvedParams = await context.params;
    const url = new URL(request.url);
    const slug = resolvedParams?.slug || url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing tenant identifier slug on endpoint isolation check.' },
        { status: 400 }
      );
    }

    // Hanapin ang Store profile sa database
    const store = await prisma.store.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Tenant storefront profile not found.' },
        { status: 404 }
      );
    }

    // Kunin ang lahat ng couriers na naka-isolate sa store na ito
    const couriers = await prisma.courier.findMany({
      where: {
        storeId: store.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(couriers, { status: 200 });

  } catch (error: any) {
    console.error('BACK-END COURIER FETCH FAILURE:', error);
    return NextResponse.json(
      { error: 'Internal system database retrieval error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * 2. POST METHOD: COURIER INSCRIPTION AND REGISTRATION ENGINE
 */
export async function POST(
  request: Request,
  context: { params: any }
) {
  try {
    const resolvedParams = await context.params;
    const url = new URL(request.url);
    const slug = resolvedParams?.slug || url.searchParams.get('slug');

    const body = await request.json();
    const { name, phone, vehicleType, plateNumber } = body;

    // A. BACK-END SAFETY VALIDATION CHECK
    if (!slug || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing core required courier parameters (Name, Phone, and Tenant Slug are mandatory).' },
        { status: 400 }
      );
    }

    // B. HANAPIN ANG STORE ID GAMIT ANG TENANT SLUG
    const store = await prisma.store.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Tenant storefront profile not found for courier alignment.' },
        { status: 404 }
      );
    }

    // C. DATABASE INSERTION LAYER
    const newCourier = await prisma.courier.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        vehicleType: vehicleType || 'Motorcycle',
        plateNumber: plateNumber ? plateNumber.trim().toUpperCase() : null,
        status: 'available',
        storeId: store.id
      }
    });

    return NextResponse.json(newCourier, { status: 201 });

  } catch (error: any) {
    console.error('BACK-END COURIER REGISTRATION REJECTION:', error);
    return NextResponse.json(
      { error: 'Internal system database insertion error occurred during courier onboarding.' },
      { status: 500 }
    );
  }
}
