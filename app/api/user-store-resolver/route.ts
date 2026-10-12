 // app/api/user-store-resolver/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "Missing identity token verification link parameters" }, { status: 400 });
    }

    // Hinahanap ang store kung saan ang owner_id ay kapareho ng nag-login na user
    const tenantStore = await prisma.store.findFirst({
      where: {
        ownerId: userId 
      },
      select: {
        slug: true
      }
    });

    return NextResponse.json({ slug: tenantStore?.slug || null });

  } catch (error) {
    console.error("[USER_STORE_RESOLVER_API_ERROR]", error);
    return NextResponse.json({ slug: null }, { status: 500 });
  }
}
