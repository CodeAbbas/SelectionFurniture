import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb'; //
import Product from '../../../models/Product'; //

export async function GET(request: Request) {
  try {
    await dbConnect();

    // 1. Get Search Params (e.g. ?category=Sofa)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    // 2. Build Query
    const query: any = {};
    
    if (category) {
      query.categories = category; 
    }
    if (subcategory) {
      query.subcategories = subcategory;
    }

    // 3. Fetch from MongoDB
    const products = await Product.find(query);

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}