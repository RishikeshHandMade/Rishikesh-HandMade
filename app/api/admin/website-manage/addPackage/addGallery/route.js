import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Package from "@/models/Package";
import { deleteFileFromCloudinary } from "@/utils/cloudinary";

export async function POST(req) {
    await connectDB();
    const { pkgId, images } = await req.json();

    try {
        const pkg = await Package.findById(pkgId);
        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }
        pkg.gallery = images;
        await pkg.save();
        return NextResponse.json({ message: "Gallery saved successfully" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    const { pkgId, key } = await req.json();

    try {
        const pkg = await
            Package.findById(pkgId);
        if (!pkg) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }
        await deleteFileFromCloudinary(key);
        pkg.gallery = pkg.gallery.filter((image) => image.key !== key);
        await pkg.save();
        return NextResponse.json({ message: "Image deleted successfully" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}