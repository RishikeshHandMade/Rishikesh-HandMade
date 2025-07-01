import Review from "@/models/Review";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connectDB();
        const reviews = await Review.find({}).lean();
        const safeReviews = reviews.map(r => ({
            ...r,
            _id: r._id?.toString(),
            product: (r.product && r.product.toString) ? r.product.toString() : (typeof r.product === 'string' ? r.product : null),
            artisan: (r.artisan && r.artisan.toString) ? r.artisan.toString() : (typeof r.artisan === 'string' ? r.artisan : null),
            date: typeof r.date === 'number' ? r.date : Number(r.date),
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
            updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
        }));
        return NextResponse.json({ success: true, reviews: safeReviews }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
};
export const POST = async (req) => {
    try {
        await connectDB();
        const data = await req.json();
        // console.log("REVIEW PAYLOAD", data);
        const review = new Review({
            name: data.name,
            date: data.date,
            thumb: data.thumb,
            rating: data.rating,
            title: data.title,
            description: data.description,
            type: data.type,
            product: data.product,
            artisan: data.artisan,
            approved: false
        });

        await review.save();
        return NextResponse.json({ message: "Review submitted successfully" }, { status: 201 });
    } catch (error) {
        // console.error("REVIEW ERROR", error);
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

        review.approved = data.approved;
        await review.save();

        return NextResponse.json({ message: "Review approved!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

export const DELETE = async (req) => {
    try {
        await connectDB();
        const { id } = await req.json();

        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return NextResponse.json({ message: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Review Deleted!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};
