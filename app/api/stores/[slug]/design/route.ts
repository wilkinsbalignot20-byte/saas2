 // app/api/stores/[slug]/design/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server'; 

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. MULTI-TENANT SECURITY GATE
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized handle access. Please log in.' },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { slug: slug },
      select: { id: true, ownerId: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Tenant storefront profile not found.' },
        { status: 404 }
      );
    }

    if (store.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Security Breach: You do not own this storefront workspace.' },
        { status: 403 }
      );
    }

    // 2. BASAHIN ANG MGA BAGONG PAYLOAD VALUES MULA SA DASHBOARD FORM
    const body = await request.json();
    const { 
      themeColor, 
      backgroundPreset, 
      logoUrl, 
      bannerUrl,       // ➔ Bagong salta galing Cloudinary
      promoVideoUrl,   // ➔ Bagong salta galing Cloudinary video
      promoText        // ➔ Bagong salta para sa voucher codes text
    } = body;

    // Hex Color Validation
    if (themeColor && !/^#[0-9A-Fa-f]{6}$/.test(themeColor)) {
      return NextResponse.json(
        { error: 'Invalid color hex format provided.' },
        { status: 400 }
      );
    }

    // 3. DATABASE UPDATE LAYER (Isinama na ang tatlong bagong market columns)
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        themeColor: themeColor || '#E8A33D',
        backgroundPreset: backgroundPreset || 'bg-slate-50',
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,             // ➔ I-save sa Prisma
        promoVideoUrl: promoVideoUrl || null,     // ➔ I-save sa Prisma
        promoText: promoText || null              // ➔ I-save sa Prisma
      }
    });

    return NextResponse.json(
      { success: true, store: updatedStore },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('BACK-END DESIGN UPDATE REJECTION ERROR:', error);
    return NextResponse.json(
      { error: 'Internal system database modification error occurred.' },
      { status: 500 }
    );
  }
}
