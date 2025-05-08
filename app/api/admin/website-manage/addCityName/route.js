import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import City from "@/models/City";

export async function POST(req) {
    try {
        await connectDB();
        const { stateName, cityName } = await req.json();

        if (!stateName || !cityName) {
            return NextResponse.json({ message: "State and City are required" }, { status: 400 });
        }

        // Capitalize city name properly (first letter uppercase, rest lowercase)
        const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();

        // Find state document
        let stateEntry = await City.findOne({ stateName });

        if (stateEntry) {
            // Convert cities to lowercase for checking uniqueness
            const existingCitiesLowercase = stateEntry.cities.map(city => city.toLowerCase());

            if (existingCitiesLowercase.includes(formattedCityName.toLowerCase())) {
                return NextResponse.json({ message: "City already exists in this state" }, { status: 400 });
            }

            // Add the formatted city name
            stateEntry.cities.push(formattedCityName);
            await stateEntry.save();
            return NextResponse.json({ message: "City added successfully!", city: stateEntry }, { status: 200 });

        } else {
            // Create new state entry if it does not exist
            const newStateEntry = await City.create({ stateName, cities: [formattedCityName] });
            return NextResponse.json({ message: "New state created and city added!", city: newStateEntry }, { status: 201 });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}

export async function GET() {
    await connectDB();
    const cities = await City.find({}).sort({ stateName: 1 });
    return NextResponse.json({ cities }, { status: 200 });
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { city, selectedState } = await req.json();

        if (!city || !selectedState) {
            return NextResponse.json({ message: "State and City are required" }, { status: 400 });
        }

        // Update the state's cities array and remove the city
        const updatedState = await City.findOneAndUpdate(
            { stateName: selectedState },
            { $pull: { cities: city } }, // Remove only the city
            { new: true } // Return updated document
        );

        if (!updatedState) {
            return NextResponse.json({ message: "State not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "City deleted successfully!", updatedState }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await connectDB();
        const { selectedState, oldCityName, newCityName } = await req.json();

        if (!selectedState || !oldCityName || !newCityName) {
            return NextResponse.json({ message: "State and city names are required" }, { status: 400 });
        }

        const updatedState = await City.findOneAndUpdate(
            { stateName: selectedState, cities: oldCityName },
            { $set: { "cities.$": newCityName } }, // Update the specific city in the array
            { new: true } // Return the updated document
        );

        if (!updatedState) {
            return NextResponse.json({ message: "City not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "City updated successfully!", updatedState }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}
