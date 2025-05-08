import connectDB from "@/lib/connectDB";
import Package from "@/models/Package";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params; // No need for "await" here

        if (!id) {
            return NextResponse.json({ error: "Invalid request, ID is required" }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid package ID format" }, { status: 400 });
        }

        const packageData = await Package.findById(id);

        if (!packageData) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        return NextResponse.json(packageData, { status: 200 });
    } catch (error) {
        console.error("Error fetching package:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
