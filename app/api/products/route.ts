import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const isBestSeller = searchParams.get('is_best_seller');
    const sort = searchParams.get('sort'); 
    const limit = searchParams.get('limit');

    // 1. Build Query
    const query: any = {};
    
    if (category) query.categories = category;
    if (subcategory) query.subcategories = subcategory;
    if (isBestSeller === 'true') query.is_best_seller = true;

    // 2. Prepare Sort Options
    let sortOptions: any = {};
    if (sort === 'newest') {
      sortOptions = { createdAt: -1 }; // Newest first
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 }; // Highest rating first
    }

    // 3. Fetch from MongoDB
    let dbQuery = Product.find(query).sort(sortOptions);

    if (limit) {
      dbQuery = dbQuery.limit(parseInt(limit));
    }

    const products = await dbQuery.exec();

    return NextResponse.json(products);

  } catch (error: any) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}