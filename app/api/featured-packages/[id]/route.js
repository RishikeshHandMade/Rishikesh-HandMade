import connectDB from "@/lib/connectDB";
import FeaturedPackageCard from "@/models/FeaturedPackageCard";
import cloudinary from 'cloudinary';

// Cloudinary configuration (ensure these env vars are set)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const PUT = async (req, { params }) => {
    try {
        await connectDB();
        const { id } =await params;
        const { title, image, link } = await req.json();

        if (!title || !link) {
            return new Response(JSON.stringify({ error: 'Title and link are required' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let imageUrl = null;
        let imagePublicId = null;

        try {
            // Handle different image input formats
            if (image) {
                // If image is a string (base64 or URL)
                if (typeof image === 'string') {
                    if (image.startsWith('data:') || image.startsWith('blob:')) {
                        // Upload base64 image to Cloudinary
                        const uploadResponse = await cloudinary.v2.uploader.upload(image, {
                            folder: 'featured-packages',
                        });
                        imageUrl = uploadResponse.secure_url;
                        imagePublicId = uploadResponse.public_id;
                    } else {
                        // If it's already a URL, use it directly
                        imageUrl = image;
                    }
                } 
                // If image is an object with url property
                else if (typeof image === 'object' && image !== null) {
                    // Handle case where image is { url: string, key?: string }
                    if (image.url) {
                        imageUrl = image.url;
                        imagePublicId = image.public_id || image.key || null;
                    }
                }
            }
        } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            return new Response(JSON.stringify({ 
                error: 'Failed to process image',
                details: uploadError.message 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Prepare update data
        const updateData = { 
            title, 
            link,
            ...(imageUrl && { image: { url: imageUrl, public_id: imagePublicId } })
        };

        // Update the package in the database
        const updatedPackage = await FeaturedPackageCard.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return new Response(JSON.stringify({ error: 'Package not found' }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(updatedPackage), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response("Failed to update featured package", { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = params;

        // First get the package to access the image public_id
        const packageToDelete = await FeaturedPackageCard.findById(id);
        if (!packageToDelete) {
            return new Response("Featured package not found", { status: 404 });
        }

        // Delete the image from Cloudinary if it exists
        if (packageToDelete.image?.public_id) {
            await cloudinary.v2.uploader.destroy(packageToDelete.image.public_id);
        }

        // Delete the package from database
        await FeaturedPackageCard.findByIdAndDelete(id);

        return new Response("Featured package deleted successfully", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete featured package", { status: 500 });
    }
};