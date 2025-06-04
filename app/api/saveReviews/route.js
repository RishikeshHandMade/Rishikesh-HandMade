import Review from "@/models/Review";
import User from "@/models/User";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Package from "@/models/Package";

export const GET = async () => {
    try {
        await connectDB();
        const reviews = await Review.find({});
        return NextResponse.json({ success: true, reviews }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await connectDB();
        const data = await req.json();

        // Only accept form fields
        const review = new Review({
            name: data.name,
            email: data.email,
            thumb: data.thumb, // Should be an object { url, key } if uploaded
            rating: data.rating,
            title: data.title,
            description: data.description,
            approved: false
        });

        await review.save();
        return NextResponse.json({ message: "Review submitted successfully" }, { status: 201 });
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
