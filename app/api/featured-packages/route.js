import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import FeaturedPackageCard from "@/models/FeaturedPackageCard";

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const GET = async () => {
    try {
        await connectDB();
        const packages = await FeaturedPackageCard.find({isActive:true});
        const shuffledPackages = shuffleArray(packages);
        return NextResponse.json({
            success: true,
            data: shuffledPackages
        });
    } catch (error) {
        console.error('Error fetching packages:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch packages' },
            { status: 500 }
        );
    }
};

export const POST = async (req) => {
    try {
        await connectDB();
        const body = await req.json();

        const { title, image, link } = body;

        if (!title || !image?.url || !image?.key || !link) {
            return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
        }

        const newPackage = new FeaturedPackageCard({
            title,
            image,
            link,
        });
        await newPackage.save();

        return new Response(JSON.stringify(newPackage), { status: 201, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("POST Error:", error);
        return new Response(JSON.stringify({ message: "Failed to create featured package", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
