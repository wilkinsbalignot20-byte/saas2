 // app/api/stores/[slug]/products/[productId]/route.ts

import { NextResponse } from "next/server";
import { updateProductDetailService, deleteProductDetailService } from "./product-detail-controller";

// ==========================================
// 1. PATCH METHOD (EDIT / UPDATE PRODUCT)
// ==========================================
export async function PATCH(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const productId = params.productId;

    if (!productId) {
      return NextResponse.json({ error: "Missing required product identification parameter." }, { status: 400 });
    }

    const body = await request.json();
    
    // Tinatawag ang controller layer service upang iproseso ang buong updates at storage cleaning
    const updatedProduct = await updateProductDetailService(productId, body);

    return NextResponse.json({
      success: true,
      message: "Product configurations and dynamic wholesale bundles successfully integrated.",
      product: updatedProduct
    });

  } catch (error: any) {
    console.error("[PRODUCT_PATCH_API_ERROR]", error);
    
    // Saluhin ang kontroller custom settings responses
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. DELETE METHOD (FULL PRODUCT DELETION)
// ==========================================
export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const productId = params.productId;
    const slug = params.slug; 

    if (!productId || !slug) {
      return NextResponse.json({ error: "Missing required product or tenant identification parameters." }, { status: 400 });
    }

    // Tinatawag ang isolated deletion engine sa ating controller file
    await deleteProductDetailService(productId, slug);

    return NextResponse.json({
      success: true,
      message: "Product record and cloud media assets successfully destroyed."
    });

  } catch (error: any) {
    console.error("[PRODUCT_DELETE_API_ERROR]", error);
    
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
