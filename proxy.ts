 // proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Dapat "proxy" ang pangalan ng function sa Next.js 16!
export function proxy(request: NextRequest) {
  return NextResponse.next();
}
