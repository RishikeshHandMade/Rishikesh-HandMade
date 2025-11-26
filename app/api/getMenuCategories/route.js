import connectDB from "@/lib/connectDB";
import MenuBar from "@/models/MenuBar";
import { NextResponse } from "next/server";

export async function GET(req) {
    await connectDB();

    // Fetch only the category structure without populating products
    const menu = await MenuBar.find({})
        .select('title active order subMenu.title subMenu.url subMenu.active subMenu.order subMenu.profileImage') // Only select necessary fields
        .lean() // Convert to plain JavaScript objects for better performance
        .sort({ order: 1 });

    // Return lightweight menu structure with only category info
    return NextResponse.json(menu);
}