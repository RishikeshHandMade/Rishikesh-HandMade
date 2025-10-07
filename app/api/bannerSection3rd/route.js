import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import BannerSection3rd from "@/models/BannerSection3rd";
import { deleteFileFromCloudinary } from "@/utils/cloudinary";


export async function GET() {
    await connectDB();
    try {
        const banners = await BannerSection3rd.find().sort({ order: 1 });
        return NextResponse.json(banners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const { buttonLink, image, mobileImage, order } = await req.json();

        // Find the highest order number
        const lastBanner = await BannerSection3rd.findOne().sort({ order: -1 });
        const nextOrder = lastBanner ? lastBanner.order + 1 : 1; // Auto-increment order

        const newBanner = new BannerSection3rd({ buttonLink, order: nextOrder, image, mobileImage });
        await newBanner.save();
        return NextResponse.json(newBanner, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to create banner: ${error.message}` }, { status: 500 });
    }
}

export async function PATCH(req) {
    await connectDB();
    try {
        const { id,buttonLink, image, mobileImage, order } = await req.json();
        const updatedBanner = await BannerSection3rd.findByIdAndUpdate(id, { buttonLink, order, image, mobileImage }, { new: true });
        return NextResponse.json(updatedBanner, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { id } = await req.json();

        // Find the banner first
        const banner = await BannerSection3rd.findById(id);
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }

        // Delete the image from Uploadthing (if key exists)
        if (banner.image?.key) {
            await deleteFileFromCloudinary(banner.image.key);
        }
        if (banner.mobileImage?.key) {
            await deleteFileFromCloudinary(banner.mobileImage.key);
        }
        // Delete banner from database
        await BannerSection3rd.findByIdAndDelete(id);

        return NextResponse.json({ message: "Banner deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to delete banner: ${error.message}` }, { status: 500 });
    }
}
