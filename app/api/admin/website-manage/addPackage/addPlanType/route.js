import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Package from "@/models/Package";
import mongoose from "mongoose";

export async function POST(req) {
    await connectDB();
    const body = await req.json();

    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(body.pkgId)) {
            return NextResponse.json({ message: "Invalid package ID" }, { status: 400 });
        }

        const packageDoc = await Package.findById(body.pkgId);
        if (!packageDoc) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        let existingPlans = packageDoc.createPlanType || [];

        // Convert existing data to a Map for easy updates
        const planMap = new Map(existingPlans.map(plan => [plan.day, plan.toObject()])); // Convert Mongoose docs to plain objects

        // Merge updates while avoiding empty values
        body.createPlanType.forEach(newPlan => {
            if (planMap.has(newPlan.day)) {
                let existingPlan = planMap.get(newPlan.day);

                // Only update non-empty values
                planMap.set(newPlan.day, {
                    ...existingPlan,
                    ...(newPlan.state !== "" ? { state: newPlan.state } : {}),
                    ...(newPlan.city !== "" ? { city: newPlan.city } : {})
                });
            } else {
                planMap.set(newPlan.day, newPlan); // Add new plan if not found
            }
        });

        // Convert back to array
        const updatedCreatePlanType = Array.from(planMap.values());

        // Perform the update
        const updateResult = await Package.updateOne(
            { _id: body.pkgId },
            { $set: { createPlanType: updatedCreatePlanType } }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ message: "No changes made" }, { status: 200 });
        }

        return NextResponse.json({ message: "Plan type updated successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error updating plan type:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
