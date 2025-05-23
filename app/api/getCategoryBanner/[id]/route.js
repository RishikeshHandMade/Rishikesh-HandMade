// import connectDB from "@/lib/connectDB";
// import MenuBar from "@/models/MenuBar";
// import { NextResponse } from "next/server";

// export const GET = async (req, { params }) => {
//     await connectDB();
//     const { id } = await params;

//     try {
//         const category = await MenuBar.findOne(
//             { "subMenu.url": id }, // Correct query to match submenu URL
//             { "subMenu.$": 1 } // Only return the matching submenu
//         );

//         if (!category) {
//             return NextResponse.json({ message: "Category not found" }, { status: 404 });
//         }
//         // Populate products field with full product documents
//         const submenu = category.subMenu[0];
//         if (submenu.products && submenu.products.length > 0) {
//             const mongoose = (await import('mongoose')).default;
//             const Product = require('@/models/Product'); // Use require for CommonJS
//             console.log('Before population:', submenu.products, Array.isArray(submenu.products));
//             // Convert all IDs to ObjectId if needed
//             const productIds = submenu.products.map(id =>
//                 typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
//             );
//             const productDocs = await Product.find({ _id: { $in: productIds } });
//             submenu.products = productDocs;
//             console.log('After population:', submenu.products);
//         }
//         return NextResponse.json(submenu);
//     } catch (error) {
//         return NextResponse.json({ message: error.message }, { status: 500 });
//     }
// };
import connectDB from "@/lib/connectDB";
import MenuBar from "@/models/MenuBar";
const mongoose = require('mongoose');
const Product = require('@/models/Product');
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    await connectDB();
    const { id } = await params;

    try {
        // Use lean() for a mutable plain JS object
        const category = await MenuBar.findOne(
            { "subMenu.url": id },
            { "subMenu.$": 1 }
        ).lean();

        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        const submenu = category.subMenu[0];
        console.log('Before population:', submenu.products);

        if (submenu.products && submenu.products.length > 0) {
            // Convert all IDs to ObjectId if needed
            const productIds = submenu.products.map(id =>
                typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
            );
            // Populate the 'gallery' field for each product
            const productDocs = await Product.find({ _id: { $in: productIds } })
                .populate({ path: 'gallery' })
                .lean();
            submenu.products = productDocs;
            console.log('After population:', submenu.products);
        }

        return NextResponse.json(submenu);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};