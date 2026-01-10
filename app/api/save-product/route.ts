import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Connect to MongoDB
    await dbConnect();

    // 2. Check if product exists (Upsert logic)
    const product = await Product.findOneAndUpdate(
      { id: body.id } as any, 
      body,            
      { upsert: true, new: true, runValidators: true } 
    );

    return NextResponse.json({ 
      success: true, 
      message: "Product saved to MongoDB successfully!", 
      data: product 
    });

  } catch (error: any) {
    console.error("MongoDB Save Error:", error);
    return NextResponse.json({ error: error.message || "Database Error" }, { status: 500 });
  }
}