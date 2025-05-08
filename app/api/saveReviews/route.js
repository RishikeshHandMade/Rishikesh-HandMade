import Review from "@/models/Review";
import User from "@/models/User";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Package from "@/models/Package";

export const POST = async (req) => {
    try {
        await connectDB();
        const data = await req.json();

        const user = await User.findOne({ email: data.email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // ✅ Check if user already reviewed this specific package
        const existingReview = await Review.findOne({
            user: user._id,
            packageId: data.packageId, // ✅ Match specific package
        });

        if (existingReview) {
            return NextResponse.json({ message: "You have already reviewed this package" }, { status: 400 });
        }

        const review = new Review({
            approved: false,
            message: data.message,
            rating: data.rating,
            packageId: data.packageId,
            packageName: data.packageName,
            user: user._id,
        });

        await review.save();

        // ✅ Add review to package's reviews list
        const packageData = await Package.findOne({ _id: data.packageId });
        if (packageData) {
            packageData.reviews.push(review._id);
            await packageData.save();
        }

        // ✅ Add review to user's reviews list
        user.reviews.push(review._id);
        await user.save();

        return NextResponse.json({ message: "Review saved successfully" }, { status: 200 });
    } catch (error) {
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
