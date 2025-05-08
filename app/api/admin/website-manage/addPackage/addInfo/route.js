import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Package from "@/models/Package";

export async function POST(req) {
    await connectDB();
    const body = await req.json();

    try {
        const updatedPackage = await Package.findByIdAndUpdate(body.pkgId, { $push: { info: body.info } }, { new: true });

        if (!updatedPackage) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Package updated successfully!", package: updatedPackage });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    await connectDB();

    try {
        const body = await req.json();

        if (!body.pkgId || !body.info || !body.info._id) {
            return NextResponse.json({ message: "Package ID and Info ID are required" }, { status: 400 });
        }

        const existingPackage = await Package.findById(body.pkgId);
        if (!existingPackage) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Find the specific info item and update only that
        const updatedPackage = await Package.findOneAndUpdate(
            { _id: body.pkgId, "info._id": body.info._id }, // Find package with matching info._id
            { $set: { "info.$": body.info } }, // Update only the matched info entry
            { new: true }
        );

        if (!updatedPackage) {
            return NextResponse.json({ message: "Info entry not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Info updated successfully!", package: updatedPackage });
    } catch (error) {
        console.error("Error updating package:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    const { id, InfoId } = await req.json();

    try {
        const deletedPackage = await Package.findByIdAndUpdate(id, { $pull: { info: { _id: InfoId } } }, { new: true });
        if (!deletedPackage) {
            return NextResponse.json({ message: "Info not found!" }, { status: 404 });
        }

        return NextResponse.json({ message: "Info deleted successfully!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}