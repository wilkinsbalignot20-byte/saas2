 // app/api/stores/[slug]/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createProductService, getStoreProductsService, triggerFacebookAutomation } from './products-controller';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// ==========================================
// 📦 1. POST METHOD: GUMAWA NG PRODUKTO
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Tawagin ang hiwalay nating controller service para mag-execute sa DB
    const newProduct = await createProductService(body);

    // Patakbuhin ang Facebook automation sa background kung published ang status
    if (body.status === 'published') {
      triggerFacebookAutomation(newProduct, body.slug, request.url);
    }

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('BACK-END SAVE REJECTION ERROR:', error);
    
    // Saluhin ang mga controlled errors mula sa service layer
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'The SKU barcode already exists or is being used by another shop on the platform.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal system database insertion error occurred.' }, { status: 500 });
  }
}

// ==========================================
// 🎟️ 2. GET METHOD: KUNIN ANG MGA PRODUKTO
// ==========================================
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Kulang ang tenant slug parameter.' }, { status: 400 });
    }

    // Tawagin ang hiwalay nating query service
    const productsWithPromoFlags = await getStoreProductsService(slug);
    
    return NextResponse.json(productsWithPromoFlags);
  } catch (error: any) {
    console.error('BACK-END PRODUCTS GET ERROR:', error);
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal server query error occurred.' }, { status: 500 });
  }
}
