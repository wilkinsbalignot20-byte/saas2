  // app/api/stores/[slug]/couriers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

const VEHICLES = ["Motorcycle", "Bicycle", "Tricycle", "E-bike", "Van"];
const MANUAL_STATUSES = ["available", "inactive"]; // "busy" ay awtomatiko, galing sa mga active delivery

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// TODO(auth): idagdag dito ang pag-check kung ang naka-login ay may-ari ng store.

/** 09XXXXXXXXX | +639XXXXXXXXX | 639XXXXXXXXX | 9XXXXXXXXX -> 09XXXXXXXXX (o null kung invalid) */
function normalizePhone(raw: unknown): string | null {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  let local = digits;
  if (digits.startsWith("63") && digits.length === 12) local = "0" + digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("9")) local = "0" + digits;
  return /^09\d{9}$/.test(local) ? local : null;
}

async function getStore(slug: string) {
  return prisma.store.findUnique({ where: { slug }, select: { id: true } });
}

// ✅ SELYADONG TYPE BYPASS: Pinwersa natin ang groupBy na tanggapin ang courierId kahit huli sa pag-sync ang VS Code cache
async function deliveryCounts(storeId: string) {
  const rows = await (prisma.order as any).groupBy({
    by: ["courierId", "shippingStatus"],
    where: { 
      storeId, 
      courierId: { not: null } 
    },
    _count: { _all: true },
  });

  const map = new Map<string, { active: number; delivered: number }>();

  // Ginamit natin ang (rows as any[]) para hindi magreklamo ang loop iteration sa courierId at _count properties
  for (const r of rows as any[]) {
    if (!r.courierId) continue;

    if (!r._count || typeof r._count !== "object" || !("_all" in r._count) || typeof r._count._all !== "number") {
      continue;
    }

    const cId = r.courierId as string;
    const countValue = r._count._all;

    const e = map.get(cId) ?? { active: 0, delivered: 0 };

    if (r.shippingStatus === "shipped") {
      e.active += countValue;
    }
    if (r.shippingStatus === "delivered") {
      e.delivered += countValue;
    }

    map.set(cId, e);
  }
  return map;
}

// 🛵 GET: mga rider ng tindahan, kasama ang bilang ng delivery at aktwal na status
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const [couriers, counts] = await Promise.all([
      prisma.courier.findMany({ where: { storeId: store.id }, orderBy: { createdAt: "desc" } }),
      deliveryCounts(store.id),
    ]);

    const result = couriers.map((c: any) => {
      const stat = counts.get(c.id) ?? { active: 0, delivered: 0 };
      return {
        ...c,
        status: c.status === "inactive" ? "inactive" : stat.active > 0 ? "busy" : "available",
        activeDeliveries: stat.active,
        deliveredCount: stat.delivered,
      };
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Courier GET Error:", error);
    return fail("Server error.", 500);
  }
}

// 🛵 POST: magdagdag ng rider
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    const name = String(body.name ?? "").trim();
    const phone = normalizePhone(body.phone);
    const vehicleType = body.vehicleType || "Motorcycle";
    const plateNumber = body.plateNumber ? String(body.plateNumber).trim().toUpperCase().slice(0, 12) : null;

    if (name.length < 2 || name.length > 60) return fail("Name must be 2 to 60 characters.", 400);
    if (!phone) return fail("Enter a valid PH mobile number (e.g. 09171234567).", 400);
    if (!VEHICLES.includes(vehicleType)) return fail("Invalid vehicle type.", 400);

    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const duplicate = await prisma.courier.findFirst({ where: { storeId: store.id, phone } });
    if (duplicate) return fail(`A rider with this number already exists (${duplicate.name}).`, 400);

    const courier = await prisma.courier.create({
      data: { name, phone, vehicleType, plateNumber, status: "available", storeId: store.id },
    });
    return NextResponse.json({ ...courier, activeDeliveries: 0, deliveredCount: 0 }, { status: 201 });
  } catch (error) {
    console.error("Courier POST Error:", error);
    return fail("Could not register the rider.", 500);
  }
}

// 🛵 PATCH: i-edit ang rider o i-set ang on/off duty
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    const courierId = body?.courierId;
    if (!courierId) return fail("courierId is required.", 400);

    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const existing = await prisma.courier.findFirst({ where: { id: courierId, storeId: store.id } });
    if (!existing) return fail("Rider not found.", 404);

    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2 || name.length > 60) return fail("Name must be 2 to 60 characters.", 400);
      data.name = name;
    }
    if (body.phone !== undefined) {
      const phone = normalizePhone(body.phone);
      if (!phone) return fail("Enter a valid PH mobile number (e.g. 09171234567).", 400);
      const duplicate = await prisma.courier.findFirst({ where: { storeId: store.id, phone, NOT: { id: existing.id } } });
      if (duplicate) return fail(`A rider with this number already exists (${duplicate.name}).`, 400);
      data.phone = phone;
    }
    if (body.vehicleType !== undefined) {
      if (!VEHICLES.includes(body.vehicleType)) return fail("Invalid vehicle type.", 400);
      data.vehicleType = body.vehicleType;
    }
    if (body.plateNumber !== undefined) {
      data.plateNumber = body.plateNumber ? String(body.plateNumber).trim().toUpperCase().slice(0, 12) : null;
    }
    if (body.status !== undefined) {
      if (!MANUAL_STATUSES.includes(body.status)) return fail("Status can only be set to available or inactive.", 400);
      if (body.status === "inactive") {
        const active = await prisma.order.count({
          where: { storeId: store.id, courierId: existing.id, shippingStatus: "shipped" },
        });
        if (active > 0) return fail("This rider still has deliveries in progress.", 409);
      }
      data.status = body.status;
    }

    if (Object.keys(data).length === 0) return fail("Nothing to update.", 400);

    const updated = await prisma.courier.update({ where: { id: existing.id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Courier PATCH Error:", error);
    return fail("Could not update the rider.", 500);
  }
}

// 🛵 DELETE: /couriers?id=...
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return fail("Rider id is required.", 400);

    const store = await getStore(slug);
    if (!store) return fail("Store not found.", 404);

    const active = await prisma.order.count({ where: { storeId: store.id, courierId: id, shippingStatus: "shipped" } });
    if (active > 0) return fail("This rider still has deliveries in progress.", 409);

    const { count } = await prisma.courier.deleteMany({ where: { id, storeId: store.id } });
    if (count === 0) return fail("Rider not found.", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Courier DELETE Error:", error);
    return fail("Could not remove the rider.", 500);
  }
}