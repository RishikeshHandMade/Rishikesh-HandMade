import connectDB from "@/lib/connectDB";
import FeaturedPackageCard from "@/models/FeaturedPackageCard";
import { deleteFileFromUploadthing } from "@/utils/Utapi";

export const PUT = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = await params;
        const { title, image, link } = await req.json();

        const updatedPackage = await FeaturedPackageCard.findByIdAndUpdate(
            id,
            { title, image, link },
            { new: true }
        );

        if (!updatedPackage) {
            return new Response("Featured package not found", { status: 404 });
        }

        return new Response(JSON.stringify(updatedPackage), { status: 200 });
    } catch (error) {
        return new Response("Failed to update featured package", { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = await params;

        // First get the package to access the image key
        const packageToDelete = await FeaturedPackageCard.findById(id);
        if (!packageToDelete) {
            return new Response("Featured package not found", { status: 404 });
        }

        // Delete the image from Uploadthing if it exists
        if (packageToDelete.image?.key) {
            await deleteFileFromUploadthing(packageToDelete.image.key);
        }

        // Delete the package from database
        await FeaturedPackageCard.findByIdAndDelete(id);

        return new Response("Featured package deleted successfully", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete featured package", { status: 500 });
    }
};