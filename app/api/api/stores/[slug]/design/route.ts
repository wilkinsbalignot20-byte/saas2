// app/api/stores/[slug]/design/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server'; // Ginagamit ang iyong SSR server client para sa proteksyon

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Kunin ang active store slug mula sa URL parameters
    const { slug } = await params;

    // 2. MULTI-TENANT SECURITY GATE: I-verify kung ang kasalukuyang user ang totoong owner ng shop
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized handle access. Please log in.' },
        { status: 401 }
      );
    }

    // Hanapin ang store profile gamit ang slug
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

    // Siguraduhing ang ownerId sa database ay katugma ng naka-log in na user sa session
    if (store.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Security Breach: You do not own this storefront workspace.' },
        { status: 403 }
      );
    }

    // 3. READ THE PAYLOAD VALUES FROM FRONT-END
    const body = await request.json();
    const { themeColor, backgroundPreset, logoUrl } = body;

    // Masusing pagsusuri sa Hex Color Code Format bago i-save (Dapat may # sa unahan)
    if (themeColor && !/^#[0-9A-Fa-f]{6}$/.test(themeColor)) {
      return NextResponse.json(
        { error: 'Invalid color hex format provided.' },
        { status: 400 }
      );
    }

    // 4. DATABASE TRANSACTION LAYER: UPDATE STORE DESIGN SETTINGS
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        themeColor: themeColor || '#E8A33D',
        backgroundPreset: backgroundPreset || 'bg-slate-50',
        logoUrl: logoUrl || null
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
