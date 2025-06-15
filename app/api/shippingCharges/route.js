import { NextResponse } from 'next/server';
import ShippingCharge from '../../../models/ShippingCharges';
import connectDB from "@/lib/connectDB";

// Connect to MongoDB


export async function GET(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const pincode = searchParams.get('pincode');
        const state = searchParams.get('state');
        const district = searchParams.get('district');
        
        let query = {};
        if (pincode) {
            query.pincode = pincode;
        } else if (state && district) {
            query = { state, district };
        }

        const shippingCharges = await ShippingCharge.find(query)
            .sort({ createdAt: -1 });

        return NextResponse.json(shippingCharges);
    } catch (error) {
        console.error('Error fetching shipping charges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipping charges' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    await connectDB();
    try {
        const data = await request.json();
        const shippingCharge = new ShippingCharge(data);
        await shippingCharge.save();
        
        return NextResponse.json(shippingCharge, { status: 201 });
    } catch (error) {
        console.error('Error creating shipping charge:', error);
        return NextResponse.json(
            { error: 'Failed to create shipping charge' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    await connectDB();
    try {
        const data = await request.json();
        const { id } = data;
        
        const updatedShippingCharge = await ShippingCharge.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );

        if (!updatedShippingCharge) {
            return NextResponse.json(
                { error: 'Shipping charge not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedShippingCharge);
    } catch (error) {
        console.error('Error updating shipping charge:', error);
        return NextResponse.json(
            { error: 'Failed to update shipping charge' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        const deletedShippingCharge = await ShippingCharge.findByIdAndDelete(id);

        if (!deletedShippingCharge) {
            return NextResponse.json(
                { error: 'Shipping charge not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Shipping charge deleted successfully' });
    } catch (error) {
        console.error('Error deleting shipping charge:', error);
        return NextResponse.json(
            { error: 'Failed to delete shipping charge' },
            { status: 500 }
        );
    }
}