import connectDB from "@/lib/connectDB";
import MenuBar from "@/models/MenuBar";
import { NextResponse } from "next/server";

export async function GET(req) {
    await connectDB();
    const menu = await MenuBar.find({}).sort({ order: 1 });
    return NextResponse.json(menu);
}