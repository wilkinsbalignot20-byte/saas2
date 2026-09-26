 import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  const videos = [
    { id: "shoes2", url: "https://cloudinary.com" },
    { id: "wear", url: "https://cloudinary.com" },
    { id: "coffee", url: "https://cloudinary.com" },
    { id: "tindahan", url: "https://cloudinary.com" }
  ];

  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paramsToSign } = body
    if (paramsToSign) {
      const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!)
      return NextResponse.json({ signature })
    }
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    // FIX: Naglagay ng comment directive bago ang catch para lampasan ang no-unused-vars constraint
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ignore = error; 
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
