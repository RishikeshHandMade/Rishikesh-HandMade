import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import TopAdvertismentBanner from "@/models/TopAdvertisment";
export async function GET() {
    await connectDB();
    try {
        const banners = await TopAdvertismentBanner.find().sort({ order: 1 });
        return NextResponse.json(banners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const { title,buttonLink, order } = await req.json();

        // Find the highest order number
        const lastBanner = await TopAdvertismentBanner.findOne().sort({ order: -1 });
        const nextOrder = lastBanner ? lastBanner.order + 1 : 1; // Auto-increment order

        const newBanner = new TopAdvertismentBanner({ buttonLink, order: nextOrder, title });
        await newBanner.save();
        return NextResponse.json(newBanner, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to create banner: ${error.message}` }, { status: 500 });
    }
}

export async function PATCH(req) {
    await connectDB();
    try {
        const { id, buttonLink, title, order, isActive } = await req.json();
        const updateData = {};
        
        // Only include fields that are provided in the request
        if (buttonLink !== undefined) updateData.buttonLink = buttonLink;
        if (title !== undefined) updateData.title = title;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedBanner = await TopAdvertismentBanner.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        );

        if (!updatedBanner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }

        return NextResponse.json(updatedBanner, { status: 200 });
    } catch (error) {
        console.error("Error updating banner:", error);
        return NextResponse.json(
            { error: `Failed to update banner: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { id } = await req.json();

        // Find the banner first
        const banner = await TopAdvertismentBanner.findById(id);
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }
        // Delete banner from database
        await TopAdvertismentBanner.findByIdAndDelete(id);

        return NextResponse.json({ message: "Banner deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to delete banner: ${error.message}` }, { status: 500 });
    }
}
