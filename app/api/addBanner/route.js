import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import HeroBanner from "@/models/HeroBanner";
import { deleteFileFromCloudinary } from "@/utils/cloudinary";
export async function GET() {
    await connectDB();
    try {
        const banners = await HeroBanner.find().sort({ order: 1 });
        return NextResponse.json(banners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const { buttonLink, frontImg, mobileImg, order } = await req.json();

        // Find the highest order number
        const lastBanner = await HeroBanner.findOne().sort({ order: -1 });
        const nextOrder = lastBanner ? lastBanner.order + 1 : 1; // Auto-increment order

        const newBanner = new HeroBanner({
            buttonLink,
            order: nextOrder,
            frontImg,
            mobileImg

        });
        await newBanner.save();
        return NextResponse.json(newBanner, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to create banner: ${error.message}` }, { status: 500 });
    }
}

export async function PATCH(req) {
    await connectDB();
    try {
        const { id, buttonLink, frontImg, mobileImg, order } = await req.json();
        const updatedBanner = await HeroBanner.findByIdAndUpdate(
            id,
            {
                buttonLink,
                order,
                frontImg,
                mobileImg
            },
            { new: true }
        );
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
        const banner = await HeroBanner.findById(id);
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }
        // console.log(banner.mobileImg.key)
        try {
            // Delete front image from Cloudinary if it exists
            if (banner.frontImg?.key) {
                try {
                    await deleteFileFromCloudinary(banner.frontImg.key);
                } catch (cloudinaryError) {
                    console.error('Error deleting front image from Cloudinary:', cloudinaryError);
                    // Continue with deletion even if Cloudinary deletion fails
                }
            }

            if (banner.mobileImg?.key) {
                try {
                    await deleteFileFromCloudinary(banner.mobileImg.key);
                } catch (cloudinaryError) {
                    console.error('Error deleting mobile image from Cloudinary:', cloudinaryError);
                    // Continue with deletion even if Cloudinary deletion fails
                }
            }

            // Delete banner from database
            await HeroBanner.findByIdAndDelete(id);

            return NextResponse.json({ message: "Banner deleted successfully" }, { status: 200 });
        } catch (dbError) {
            console.error('Database error:', dbError);
            throw dbError; // This will be caught by the outer catch
        }
    } catch (error) {
        console.error('Error in DELETE /api/addBanner:', error);
        return NextResponse.json(
            { error: error.message || "Failed to delete banner" },
            { status: 500 }
        );
    }
}
