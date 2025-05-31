import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import ArtisanBanner from '@/models/ArtisanBanner';
import Artisan from '@/models/Artisan';

// GET banner by artisanId
export async function GET(req) {
    await dbConnect();
    const url = new URL(req.url);
    const artisanId = url.searchParams.get('artisanId');
    if (!artisanId) {
        return NextResponse.json({ success: false, message: 'artisanId required' }, { status: 400 });
    }
    try {
        const banner = await ArtisanBanner.findOne({ artisan: artisanId }).populate('artisan');
        return NextResponse.json({ success: true, banner });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

// POST/PUT: Upsert (one banner per artisan)
export async function POST(req) {
    await dbConnect();
    const { artisanId, images } = await req.json();
    if (!artisanId || !images || !Array.isArray(images) || images.length === 0) {
        return NextResponse.json({ success: false, message: 'artisanId and images are required' }, { status: 400 });
    }
    try {
        let banner = await ArtisanBanner.findOne({ artisan: artisanId });
        if (banner) {
            banner.images = images;
            banner.updatedAt = new Date();
            await banner.save();
        } else {
            banner = await ArtisanBanner.create({ artisan: artisanId, images });
        }
        await Artisan.findByIdAndUpdate(artisanId, { artisanBanner: banner._id });
        return NextResponse.json({ success: true, banner });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
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

// DELETE banner by id
export async function DELETE(req) {
    await dbConnect();
    const { id } = await req.json();
    if (!id) {
        return NextResponse.json({ success: false, message: 'Banner id required' }, { status: 400 });
    }
    try {
        const banner = await ArtisanBanner.findByIdAndDelete(id);
        if (banner && banner.artisan) {
            await Artisan.findByIdAndUpdate(banner.artisan, { $unset: { artisanBanner: 1 } });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
