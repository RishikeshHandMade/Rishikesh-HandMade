import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import MenuBar from "@/models/MenuBar";
import Package from "@/models/Package";

export async function GET(req, { params }) {
    await connectDB();
    const { id } = await params;

    try {
       
        const menu = await MenuBar.findOne({ "subMenu._id": id })
            .populate("subMenu.packages")
            .lean();

        if (!menu) {
            return NextResponse.json({ message: "SubMenu not found" }, { status: 404 });
        }

        
        const subMenu = menu.subMenu.find((sub) => sub._id.toString() === id);

        if (!subMenu) {
            return NextResponse.json({ message: "SubMenu not found inside menu" }, { status: 404 });
        }

        return NextResponse.json(subMenu);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
