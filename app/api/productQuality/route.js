import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quality from '@/models/Quality';

// GET: List all product quality records
export async function GET(req) {
  await dbConnect();
  const qualities = await Quality.find({});
  return NextResponse.json(qualities);
}

// POST: Create a new product quality record
export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const quality = new Quality(body);
  await quality.save();
  return NextResponse.json(quality, { status: 201 });
}

// PUT: Update a product quality record by id
export async function PUT(req) {
  await dbConnect();
  const { _id, ...rest } = await req.json();
  const updated = await Quality.findByIdAndUpdate(_id, rest, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE: Remove a product quality record by id (expects ?id=...)
export async function DELETE(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await Quality.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
