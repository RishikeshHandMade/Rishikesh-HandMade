import { NextResponse } from 'next/server';
import ZipCode from '@/models/ZipCode';
import connectDB from '@/lib/connectDB';

// GET: List all states/districts and their status
export async function GET() {
  await connectDB();
  try {
    const all = await ZipCode.find();
    return NextResponse.json({ success: true, data: all });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upsert a state's district status
export async function POST(req) {
  await connectDB();
  try {
    const { state, districts } = await req.json();
    if (!state || !Array.isArray(districts)) {
      return NextResponse.json({ success: false, error: 'State and districts required' }, { status: 400 });
    }
    const doc = await ZipCode.findOneAndUpdate(
      { state },
      { $set: { districts } },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
