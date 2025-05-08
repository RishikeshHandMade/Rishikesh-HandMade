import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Plan from "@/models/Plan";

const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export async function POST(req) {
    await connectDB();
    const body = await req.json();

    // Normalize the plan name
    const formattedPlanName = capitalizeFirstLetter(body.planName);

    try {
        // Case-insensitive check for existing plan
        const existingPlan = await Plan.findOne({ planName: { $regex: new RegExp(`^${formattedPlanName}$`, "i") } });

        if (existingPlan) {
            return NextResponse.json({ message: "Plan name already exists" }, { status: 400 });
        }

        // Save with formatted plan name
        body.planName = formattedPlanName;
        await Plan.create(body);
        return NextResponse.json({ message: "Plan added successfully!" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    await connectDB();
    try {
        const plans = await Plan.find({});
        return NextResponse.json(plans);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    await connectDB();
    const body = await req.json();

    // Normalize the plan name before updating
    if (body.planName) {
        const formattedPlanName = capitalizeFirstLetter(body.planName);

        // Case-insensitive check for existing plan (excluding the current one)
        const existingPlan = await Plan.findOne({
            planName: { $regex: new RegExp(`^${formattedPlanName}$`, "i") },
            _id: { $ne: body._id }, // Ensure it's not the same plan being updated
        });

        if (existingPlan) {
            return NextResponse.json({ message: "Plan name already exists" }, { status: 400 });
        }

        body.planName = formattedPlanName;
    }

    try {
        const updatedPlan = await Plan.findByIdAndUpdate(body._id, body, { new: true });
        return NextResponse.json({ message: "Plan updated successfully!", plan: updatedPlan }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    const { id } = await req.json();

    try {
        await Plan.findByIdAndDelete(id);
        return NextResponse.json({ message: "Plan deleted successfully!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
