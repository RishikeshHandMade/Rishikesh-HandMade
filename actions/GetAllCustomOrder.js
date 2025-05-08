'use server'

import connectDB from "@/lib/connectDB";
import CustomOrder from "@/models/CustomOrder";
import Package from "@/models/Package";

export async function GetAllCustomOrder() {
    await connectDB();

    const customOrders = await CustomOrder.find({})
        .populate({
            path: "packageId",
            model: "Package",
        })
        .sort({ createdAt: -1 })
        .lean();

        customOrders.forEach(customOrder => {
        customOrder._id = customOrder._id.toString();
        if (customOrder.packageId) {
            customOrder.packageId._id = customOrder.packageId._id.toString();
        }
        customOrder.userId = customOrder.userId.toString();
    });


    return { customOrders };
}
