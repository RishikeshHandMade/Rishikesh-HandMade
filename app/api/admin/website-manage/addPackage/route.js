import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Artisan from "@/models/Artisan";
import MenuBar from "@/models/MenuBar";
import mongoose from "mongoose";

export async function POST(req) {
    await connectDB();
    const body = await req.json();

    try {
        // Step 1: Check for existing product
        let productQuery = {
            title: body.title,
            code: body.code,
            artisan: body.artisan
        };
        // Optionally, also check for subMenu/category if you want to scope uniqueness
        let existingProduct = await Product.findOne(productQuery);
        if (existingProduct) {
            // If already linked to submenu, skip push
            if (!body.isDirect && body.subMenuId) {
                const menuBarDoc = await MenuBar.findOne({ "subMenu._id": new mongoose.Types.ObjectId(body.subMenuId) });
                console.log("[EXISTING PRODUCT] MenuBar doc for submenu:", JSON.stringify(menuBarDoc, null, 2));
                const updateResult = await MenuBar.updateOne(
                    { "subMenu._id": new mongoose.Types.ObjectId(body.subMenuId), "subMenu.products": { $ne: existingProduct._id } },
                    { $push: { "subMenu.$.products": existingProduct._id } }
                );
                if (updateResult.matchedCount === 0) {
                    console.error("No submenu matched for existing product linkage!", body.subMenuId);
                }
            }
            // Also ensure the artisan's products array contains this product
            if (existingProduct && existingProduct.artisan) {
                await Artisan.findByIdAndUpdate(
                    existingProduct.artisan,
                    { $addToSet: { products: existingProduct._id } }
                );
            }
            return NextResponse.json({ message: "Product already exists!", product: existingProduct }, { status: 200 });
        }
        // Step 2: Create a new Product document
        const newProduct = await Product.create({
            title: body.title,
            code: body.code,
            artisan: body.artisan,
            isDirect: false,
            // Optionally store subMenuId/category info if your schema supports it
            ...(body.subMenuId ? { categoryTag: body.subMenuId } : {})
        });

        // Step 2.5: Push product _id to artisan's products array
        if (body.artisan) {
            await Artisan.findByIdAndUpdate(
                body.artisan,
                { $addToSet: { products: newProduct._id } }
            );
        }

        // Step 3: Link new product to submenu
        if (!body.isDirect && body.subMenuId) {
            const menuBarDoc = await MenuBar.findOne({ "subMenu._id": new mongoose.Types.ObjectId(body.subMenuId) });
            console.log("[NEW PRODUCT] MenuBar doc for submenu:", JSON.stringify(menuBarDoc, null, 2));
            const updateResult = await MenuBar.updateOne(
                { "subMenu._id": new mongoose.Types.ObjectId(body.subMenuId), "subMenu.products": { $ne: newProduct._id } },
                { $push: { "subMenu.$.products": newProduct._id } }
            );
            if (updateResult.matchedCount === 0) {
                console.error("No submenu matched for new product linkage!", body.subMenuId);
            }
        }
        return NextResponse.json({ message: "Product added successfully!", product: newProduct }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function PUT(req) {
    await connectDB();

    try {
        const body = await req.json();

        if (!body.pkgId) {
            return NextResponse.json({ message: "Package ID is required" }, { status: 400 });
        }

        // Fetch existing package to avoid overwriting missing fields
        const existingPackage = await Package.findById(body.pkgId);

        if (!existingPackage) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Merge new data with existing data (to prevent missing fields)
        const updatedData = {
            packageName: body.packageName ?? existingPackage.packageName,
            price: body.price ?? existingPackage.price,
            priceUnit: body.priceUnit ?? existingPackage.priceUnit,
            link: body.link ?? existingPackage.link,
            active: body.active ?? existingPackage.active,
            order: body.order ?? existingPackage.order,
            packageCode: body.packageCode ?? existingPackage.packageCode,

            basicDetails: {
                ...existingPackage.basicDetails,
                ...body.basicDetails
            }
        };

        const updatedPackage = await Package.findByIdAndUpdate(
            body.pkgId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ message: "Package updated successfully!", package: updatedPackage });
    } catch (error) {
        console.error("Error updating package:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}


export async function PATCH(req) {
    await connectDB();
    const body = await req.json();
    const { pkgId, artisan: newArtisanId, ...updateFields } = body;
    const Artisan = require('@/models/Artisan');

    try {
        // Find the current product and its artisan
        const oldProduct = await Product.findById(pkgId);
        const oldArtisanId = oldProduct?.artisan?.toString();

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(pkgId, updateFields, { new: true });

        // If artisan changed, update both artisans' product arrays
        if (newArtisanId && oldArtisanId !== newArtisanId) {
            // Remove from old artisan
            if (oldArtisanId) {
                await Artisan.findByIdAndUpdate(
                    oldArtisanId,
                    { $pull: { products: pkgId } }
                );
            }
            // Add to new artisan
            await Artisan.findByIdAndUpdate(
                newArtisanId,
                { $addToSet: { products: pkgId } }
            );
        }

        if (!updatedProduct) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Product updated successfully!", product: updatedProduct });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    const { id } = await req.json();

    try {
        // Find the package to delete
        const packageToDelete = await Package.findById(id);
        if (!packageToDelete) {
            return NextResponse.json({ message: "Package not found!" }, { status: 404 });
        }

        // Delete thumbnail and banner images
        if (packageToDelete.basicDetails.thumbnail?.key) {
            await deleteFileFromCloudinary(packageToDelete.basicDetails.thumbnail.key);
        }
        if (packageToDelete.basicDetails.imageBanner?.key) {
            await deleteFileFromCloudinary(packageToDelete.basicDetails.imageBanner.key);
        }

        // Delete all images from the gallery
        if (packageToDelete.gallery?.length > 0) {
            for (const image of packageToDelete.gallery) {
                if (image.key) {
                    await deleteFileFromCloudinary(image.key);
                }
            }
        }

        // Delete the package from the database
        const deletedProduct = await Product.findByIdAndDelete(id);
        // Remove product reference from artisan's products array if applicable
        if (deletedProduct && deletedProduct.artisan) {
            await Artisan.findByIdAndUpdate(
                deletedProduct.artisan,
                { $pull: { products: deletedProduct._id } }
            );
        }

        // Remove package references from MenuBar
        await MenuBar.updateMany(
            { "subMenu.packages": id },
            { $pull: { "subMenu.$[].packages": id } }
        );

        return NextResponse.json({ message: "Package deleted successfully!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
