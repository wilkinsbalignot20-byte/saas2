 // app/api/stores/[slug]/marketing/vouchers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const DISCOUNT_TYPES = ["FIXED", "PERCENTAGE"] as const;
const CODE_PATTERN = /^[A-Z0-9_-]{3,20}$/;

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// TODO(auth): ang mga route na ito ay walang pang-check kung ang naka-login ay may-ari ng store.
// Ilagay dito ang ownership check (hal. requireStoreOwner(slug)) bago ang bawat query.

async function getStore(slug: string) {
  return prisma.store.findUnique({ where: { slug }, select: { id: true } });
}

// 🎟️ GET: lahat ng voucher ng tenant
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const vouchers = await prisma.voucher.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Voucher GET Error:", error);
    return fail("Server error.", 500);
  }
}

// 🎟️ POST: gumawa ng bagong voucher
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    const code = String(body.code ?? "").toUpperCase().trim();
    const discountType = body.discountType;
    const discountValue = Number(body.discountValue);
    const minSpend = Number(body.minSpend ?? 0);
    const maxClaims = body.maxClaims == null || body.maxClaims === "" ? null : Number(body.maxClaims);
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    if (!CODE_PATTERN.test(code)) return fail("Code must be 3 to 20 letters, numbers, - or _.", 400);
    if (!DISCOUNT_TYPES.includes(discountType)) return fail("Invalid discount type.", 400);
    if (!Number.isFinite(discountValue) || discountValue <= 0) return fail("Discount value must be greater than 0.", 400);
    if (discountType === "PERCENTAGE" && discountValue > 100) return fail("Percentage can't be more than 100.", 400);
    if (!Number.isFinite(minSpend) || minSpend < 0) return fail("Minimum spend can't be negative.", 400);
    if (maxClaims !== null && (!Number.isInteger(maxClaims) || maxClaims < 1)) {
      return fail("Usage limit must be a whole number of 1 or more.", 400);
    }
    if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date())) {
      return fail("Expiry date must be in the future.", 400);
    }

    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const voucher = await prisma.voucher.create({
      data: { code, discountType, discountValue, minSpend, maxClaims, expiresAt, storeId: store.id },
    });
    return NextResponse.json(voucher, { status: 201 });
  } catch (error: any) {
    console.error("Voucher POST Error:", error);
    if (error.code === "P2002") return fail("This promo code already exists in your store.", 400);
    return fail("Could not save the voucher.", 500);
  }
}

// 🎟️ PATCH: i-activate / i-deactivate ang voucher
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    const voucherId = body?.voucherId;
    const isActive = body?.isActive;

    if (!voucherId || typeof isActive !== "boolean") return fail("voucherId and isActive are required.", 400);

    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    // updateMany + storeId = ligtas na tenant isolation (hindi nakadepende sa Prisma version)
    const { count } = await prisma.voucher.updateMany({
      where: { id: voucherId, storeId: store.id },
      data: { isActive },
    });
    if (count === 0) return fail("Voucher not found.", 404);

    const updated = await prisma.voucher.findFirst({ where: { id: voucherId, storeId: store.id } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Voucher PATCH Error:", error);
    return fail("Could not update the voucher.", 500);
  }
}

// 🎟️ DELETE: /vouchers?id=...
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return fail("Voucher id is required.", 400);

    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const { count } = await prisma.voucher.deleteMany({ where: { id, storeId: store.id } });
    if (count === 0) return fail("Voucher not found.", 404);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Voucher DELETE Error:", error);
    // P2003 = may orders na gumamit ng voucher na ito
    if (error.code === "P2003") return fail("This voucher is linked to existing orders. Deactivate it instead.", 409);
    return fail("Could not delete the voucher.", 500);
  }
}