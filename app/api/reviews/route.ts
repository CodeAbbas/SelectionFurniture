import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Review from '../../../models/Review';

// GET reviews for a product
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 });
  }
  try {
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST a new review (you can add authentication later)
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { productId, author, rating, comment } = body;
    if (!productId || !author || !rating || !comment) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const review = new Review({ productId, author, rating, comment });
    await review.save();
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}