import Review from "@/models/Review";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const productId = searchParams.get('productId');
        const type = searchParams.get('type');
        const artisanId = searchParams.get('artisanId');
        const approved = searchParams.get('approved');
        
        let filter = { deleted: false };
        
        // Handle status filters
        if (searchParams.has('approved')) {
            filter.approved = searchParams.get('approved') === 'true';
        }
        if (searchParams.has('active')) {
            filter.active = searchParams.get('active') === 'true';
        } else if (status === 'active') {
            filter.$or = [{ active: true }, { active: { $exists: false } }];
        } else if (status === 'inactive') {
            filter.active = false;
        } else if (status === 'deleted') {
            filter.deleted = true;
        }
        
        // Filter by product ID if provided
        if (productId) {
            filter.product = productId;
        }
        
        // Filter by artisan ID if provided
        if (artisanId) {
            filter.artisan = artisanId;
        }
        
        // Filter by approved status if provided
        if (approved !== null) {
            filter.approved = approved === 'true';
        }
        
        // Filter by type if provided
        if (type) {
            if (type === 'all') {
                // For 'all' type, include both 'artisan' and 'custom' reviews
                filter.type = { $in: ['artisan', 'custom'] };
            } else {
                filter.type = type;
            }
        }
        
        const reviews = await Review.find(filter)
            .sort({ createdAt: -1 })
            .populate('artisan', 'name')
            .populate('product', 'title')
            .lean();
            
        // Convert MongoDB documents to plain objects
        const safeReviews = reviews.map(review => {
            const serialized = {
                ...review,
                _id: review._id?.toString(),
                product: review.product ? {
                    _id: review.product._id?.toString(),
                    title: review.product.title
                } : null,
                artisan: review.artisan ? {
                    _id: review.artisan._id?.toString(),
                    name: review.artisan.name
                } : null,
                thumb: review.thumb ? {
                    url: review.thumb.url,
                    key: review.thumb.key
                } : null,
                date: review.date ? Number(review.date) : null,
                createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
                updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
            };
            
            // Remove any undefined values
            Object.keys(serialized).forEach(key => {
                if (serialized[key] === undefined) {
                    delete serialized[key];
                }
            });
            
            return serialized;
        });
        
        return new NextResponse(JSON.stringify({ success: true, reviews: safeReviews }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in GET /api/saveReviews:', error);
        return new NextResponse(JSON.stringify({ 
            success: false, 
            message: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
export const POST = async (req) => {
    try {
        await connectDB();
        const data = await req.json();
        console.log('Received review data:', JSON.stringify(data, null, 2));
        
        // For all review types, ensure they require admin approval
        const reviewData = { ...data };
        // Remove artisan/product references for 'all' type reviews
        if (reviewData.type === 'all') {
            delete reviewData.artisan;
            delete reviewData.product;
        }
        // All new reviews require admin approval
        reviewData.approved = false;
        reviewData.active = true; // Will be set to true when approved by admin
        
        // Convert date to timestamp if it's a string
        if (reviewData.date && typeof reviewData.date === 'string') {
            reviewData.date = new Date(reviewData.date).getTime();
        } else if (!reviewData.date) {
            // If no date provided, use current timestamp
            reviewData.date = Date.now();
        }

        // Validate required fields
        const requiredFields = ['name', 'title', 'description', 'rating'];
        const missingFields = requiredFields.filter(field => !reviewData[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return new NextResponse(
                JSON.stringify({ 
                    success: false, 
                    message: `Missing required fields: ${missingFields.join(', ')}` 
                }), 
                { status: 400 }
            );
        }
        
        // Create the review
        const review = new Review({
            name: reviewData.name,
            date: reviewData.date || Date.now(),
            thumb: reviewData.thumb,
            rating: reviewData.rating,
            title: reviewData.title,
            description: reviewData.description,
            type: reviewData.type,
            product: reviewData.product,
            artisan: reviewData.artisan,
            approved: reviewData.approved,
            active: true,
            deleted: false
        });

        const savedReview = await review.save();
        
        // If this is a product review, update the product's reviews array
        if (reviewData.type === 'product' && reviewData.product) {
            const Product = (await import('@/models/Product')).default;
            await Product.findByIdAndUpdate(
                reviewData.product,
                { $push: { reviews: savedReview._id } },
                { new: true }
            );
        }
        
        // If this is an artisan review, update the artisan's reviews array
        if (reviewData.type === 'artisan' && reviewData.artisan) {
            const Artisan = (await import('@/models/Artisan')).default;
            await Artisan.findByIdAndUpdate(
                reviewData.artisan,
                { $push: { reviews: savedReview._id } },
                { new: true }
            );
        }
        
        return NextResponse.json({ 
            message: "Review submitted successfully",
            review: savedReview 
        }, { status: 201 });
    } catch (error) {
        console.error("REVIEW ERROR", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const PUT = async (req) => {
    try {
        await connectDB();
        const data = await req.json();
        const review = await Review.findOne({ _id: data._id });
        if (!review) {
            return NextResponse.json({ message: "Review not found" }, { status: 404 });
        }
        
        // Track the old status for comparison
        let oldStatus = {
            active: review.active,
            approved: review.approved,
            deleted: review.deleted
        };
        
        // Track if we need to update related entities
        let updateArtisan = false;
        let updateProduct = false;
        
        // We'll always check the review type and related entity when saving
        // Handle active status changes
        if (typeof data.active === 'boolean') {
            // If status is changing, mark the appropriate entity for update
            if (review.active !== data.active) {
                if (review.type === 'artisan' && review.artisan) {
                    updateArtisan = true;
                } else if (review.type === 'product' && review.product) {
                    updateProduct = true;
                }
            }
            
            // Update the review's active status
            review.active = data.active;
            if (data.active) {
                review.deleted = false; // If making active, ensure not deleted
            }
        }
            

        
        // Handle deleted status changes
        if (typeof data.deleted === 'boolean') {
            // If status is changing, mark the appropriate entity for update
            if (review.deleted !== data.deleted) {
                if (review.type === 'artisan' && review.artisan) {
                    updateArtisan = true;
                } else if (review.type === 'product' && review.product) {
                    updateProduct = true;
                }
            }
            
            review.deleted = data.deleted;
            if (data.deleted) {
                review.active = false; // If deleting, ensure not active
            }
        }
        let promotionCreated = false;
        
        if (typeof data.approved === 'boolean') {
            const wasApproved = review.approved;
            review.approved = data.approved;
            
            // Handle promotion when approving/disapproving an artisan review
            if (review.type === 'artisan' && review.artisan) {
                // If review was approved and is now being disapproved, handle promotion
                if (!data.approved && wasApproved && review.promotion) {
                    try {
                        // Remove promotion from artisan's promotions array
                        const Artisan = (await import('@/models/Artisan')).default;
                        await Artisan.updateOne(
                            { _id: review.artisan },
                            { $pull: { promotions: review.promotion } }
                        );
                        
                        // Optionally, you can also delete the promotion
                        // const Promotion = (await import('@/models/Promotion')).default;
                        // await Promotion.findByIdAndDelete(review.promotion);
                        
                        // Remove promotion reference from review
                        review.promotion = undefined;
                    } catch (error) {
                        console.error('Error removing promotion on review disapproval:', error);
                        throw new Error(`Failed to remove promotion: ${error.message}`);
                    }
                }
                // Create promotion when approving an artisan review
                else if (data.approved && !wasApproved) {
                    try {
                        // First, ensure the artisan exists
                        const Artisan = (await import('@/models/Artisan')).default;
                        const artisan = await Artisan.findById(review.artisan);
                        
                        if (!artisan) {
                            throw new Error('Artisan not found');
                        }
                        
                        // Create the promotion
                        const Promotion = (await import('@/models/Promotion')).default;
                        const promotion = new Promotion({
                            title: review.title || 'Customer Review',
                            shortDescription: review.description ? 
                                (review.description.length > 100 ? 
                                    review.description.substring(0, 100) + '...' : 
                                    review.description) : 
                                'Customer feedback',
                            rating: review.rating || 5,
                            createdBy: review.name || 'Customer',
                            date: review.date || Date.now(),
                            image: review.thumb ? { 
                                url: review.thumb.url || review.thumb,
                                key: review.thumb.key || `review-${review._id}`
                            } : null,
                            artisan: review.artisan,
                            review: review._id
                        });
                        
                        // Save the promotion
                        const savedPromotion = await promotion.save();
                        
                        // Update the review to link to the promotion
                        review.promotion = savedPromotion._id;
                        
                        // Add the promotion to the artisan's promotions array if not already present
                        if (!artisan.promotions.includes(savedPromotion._id)) {
                            artisan.promotions.push(savedPromotion._id);
                            await artisan.save();
                        }
                        
                        promotionCreated = true;
                    } catch (error) {
                        console.error('Error in review approval process:', error);
                        throw new Error(`Failed to process review approval: ${error.message}`);
                    }
                }
            }
        }
        
        // Save the review first
        await review.save();
        
        // Then update related entities if needed
        try {
            const Artisan = (await import('@/models/Artisan')).default;
            const Product = (await import('@/models/Product')).default;
            
            // Always update the appropriate entity based on review type
            if (review.type === 'artisan' && review.artisan) {
                // First, remove from all possible arrays
                await Artisan.updateOne(
                    { _id: review.artisan },
                    { 
                        $pull: { 
                            reviews: review._id,
                            ...(review.promotion ? { promotions: review.promotion } : {})
                        }
                    }
                );
                
                // If review is active and approved, add it back
                if (review.active && review.approved && !review.deleted) {
                    await Artisan.updateOne(
                        { _id: review.artisan },
                        { 
                            $addToSet: { 
                                reviews: review._id,
                                ...(review.promotion ? { promotions: review.promotion } : {})
                            }
                        }
                    );
                }
            } 
            else if (review.type === 'product' && review.product) {
                // First, remove from product's reviews
                await Product.updateOne(
                    { _id: review.product },
                    { $pull: { reviews: review._id } }
                );
                
                // If review is active and approved, add it back
                if (review.active && review.approved && !review.deleted) {
                    await Product.updateOne(
                        { _id: review.product },
                        { $addToSet: { reviews: review._id } }
                    );
                }
            }
            
            // Handle promotion status if it exists
            if (review.promotion && (oldStatus.active !== review.active || oldStatus.approved !== review.approved)) {
                const Promotion = (await import('@/models/Promotion')).default;
                await Promotion.updateOne(
                    { _id: review.promotion },
                    { $set: { active: review.active && review.approved && !review.deleted } }
                );
            }
            
        } catch (error) {
            console.error('Error updating related entities:', error);
            // Continue with the response even if related entity updates fail
        }
        
        return NextResponse.json({ 
            message: 'Review updated successfully',
            review: review 
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const DELETE = async (req) => {
    try {
        await connectDB();
        const { _id } = await req.json();
        const review = await Review.findById(_id);
        if (!review) {
            return NextResponse.json({ message: "Review not found" }, { status: 404 });
        }
        review.deleted = true;
        review.active = false;
        await review.save();
        return NextResponse.json({ message: "Review deleted (soft)!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};