import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import FeaturedPackageCard from "@/models/FeaturedPackageCard";

export const GET = async () => {
    try {
        await connectDB();
        const packages = await FeaturedPackageCard.find();
        return NextResponse.json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error('Error fetching packages:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch packages' },
            { status: 500 }
        );
    }
};