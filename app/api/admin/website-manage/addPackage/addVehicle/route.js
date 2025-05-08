import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Package from "@/models/Package";

export async function PATCH(req) {
    await connectDB();

    try {
        const body = await req.json();

        if (!body.pkgId) {
            return NextResponse.json({ message: "Package ID  are required" }, { status: 400 });
        }

        const existingPackage = await Package.findById(body.pkgId);
        if (!existingPackage) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        const updatedPackage = await Package.findOneAndUpdate(
            { _id: body.pkgId },
            { $set: { vehiclePlan: body.vehiclePlan } },
            { new: true }
        );

        if (!updatedPackage) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Vehicle Plan updated successfully!", package: updatedPackage });
    } catch (error) {
        console.error("Error updating package:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}