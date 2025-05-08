import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Package from "@/models/Package";
import MenuBar from "@/models/MenuBar";
import { deleteFileFromUploadthing } from "@/utils/Utapi";

export async function POST(req) {
    await connectDB();
    const body = await req.json();

    try {
        // Step 1: Create a new Package document
        const newPackage = await Package.create({
            link: body.packages.link,
            order: body.packages.order,
            active: body.packages.active,
            packageCode: body.packages.packageCode,
            packageName: body.packages.packageName,
            price: body.packages.price,
            priceUnit: body.packages.priceUnit
        });

        // Step 2: Find and update the corresponding subMenu item
        if (body.subMenuId) {
            await MenuBar.updateOne(
                { "subMenu._id": body.subMenuId },  // Find the correct subMenu
                { $push: { "subMenu.$.packages": newPackage._id } }  // Push new package _id
            );
        }

        return NextResponse.json({ message: "Package added successfully!" }, { status: 201 });
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

    try {
        const updatedPackage = await Package.findByIdAndUpdate(body.pkgId, { active: body.active }, { new: true });

        if (!updatedPackage) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Package updated successfully!", package: updatedPackage });
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
            await deleteFileFromUploadthing(packageToDelete.basicDetails.thumbnail.key);
        }
        if (packageToDelete.basicDetails.imageBanner?.key) {
            await deleteFileFromUploadthing(packageToDelete.basicDetails.imageBanner.key);
        }

        // Delete all images from the gallery
        if (packageToDelete.gallery?.length > 0) {
            for (const image of packageToDelete.gallery) {
                if (image.key) {
                    await deleteFileFromUploadthing(image.key);
                }
            }
        }

        // Delete the package from the database
        await Package.findByIdAndDelete(id);

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
