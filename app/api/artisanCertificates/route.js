import { NextResponse } from 'next/server';
import connectDB from '../../../lib/connectDB';
let ArtisanCertificate 
try {
  ArtisanCertificate = mongoose.model('ArtisanCertificate');
} catch {
  ArtisanCertificate = require('@/models/ArtisanCertificate');
}
import mongoose from 'mongoose';
const Artisan = require('@/models/Artisan');
// GET all certificates or by artisan
export async function GET(req) {
  await connectDB();
  const url = new URL(req.url);
  const artisanId = url.searchParams.get('artisan');
  try {
    let certificates;
    if (artisanId) {
      certificates = await ArtisanCertificate.find({ artisan: artisanId }).populate('artisan');
      return NextResponse.json({ success: true, certificates });
    } else {
      certificates = await ArtisanCertificate.find().populate('artisan');
      return NextResponse.json({ success: true, certificates });
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch certificates', error: err.message }, { status: 500 });
  }
}

// CREATE a new certificate
export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const certificate = await ArtisanCertificate.create(body);
    // Push certificate _id to artisan's certificates array
    if (certificate.artisan) {
      await Artisan.findByIdAndUpdate(
        certificate.artisan,
        { $push: { certificates: certificate._id } },
        { new: true }
      );
    }
    return NextResponse.json({ success: true, certificate });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to create certificate', error: err.message }, { status: 500 });
  }
}

// UPDATE a certificate
export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;
    const updated = await ArtisanCertificate.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: 'Certificate not found' }, { status: 404 });
    return NextResponse.json({ success: true, certificate: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update certificate', error: err.message }, { status: 500 });
  }
}

// DELETE a certificate
export async function DELETE(req) {
  await connectDB();
  try {
    const { id } = await req.json();
    const deleted = await ArtisanCertificate.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Certificate not found' }, { status: 404 });
    // Remove certificate _id from artisan's certificates array
    if (deleted.artisan) {
      await Artisan.findByIdAndUpdate(
        deleted.artisan,
        { $pull: { certificates: deleted._id } },
        { new: true }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete certificate', error: err.message }, { status: 500 });
  }
}
