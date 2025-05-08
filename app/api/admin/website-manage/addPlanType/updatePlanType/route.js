import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import Plan from "@/models/Plan";

export async function PATCH(req) {
    await connectDB();
    const body = await req.json();

    if (!body._id) {
        return NextResponse.json({ message: "Plan ID is missing" }, { status: 400 });
    }

    try {
        // Get existing plan
        const existingPlan = await Plan.findById(body._id);
        if (!existingPlan) {
            return NextResponse.json({ message: "Plan not found" }, { status: 404 });
        }

        // Extract city update
        const newCityData = body.cities[0]; // Assuming only one city is sent at a time
        const existingCities = existingPlan.cities || [];

        // Check if city already exists
        const cityIndex = existingCities.findIndex(city => city.city === newCityData.city);

        if (cityIndex !== -1) {
            // Update existing city
            existingCities[cityIndex] = newCityData;
        } else {
            // Add new city
            existingCities.push(newCityData);
        }

        // Update the database without overwriting other fields
        const updatedPlan = await Plan.findByIdAndUpdate(
            body._id,
            { $set: { cities: existingCities } },
            { new: true }
        );

        return NextResponse.json({ message: "Plan updated successfully!", plan: updatedPlan }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
