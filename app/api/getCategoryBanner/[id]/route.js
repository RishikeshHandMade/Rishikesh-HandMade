import connectDB from "@/lib/connectDB";
import MenuBar from "@/models/MenuBar";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    await connectDB();
    const { id } = await params;

    try {
        const category = await MenuBar.findOne(
            { "subMenu.url": id }, // Correct query to match submenu URL
            { "subMenu.$": 1 } // Only return the matching submenu
        );

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }
        return NextResponse.json(category.subMenu[0]); // Return the matched submenu
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
