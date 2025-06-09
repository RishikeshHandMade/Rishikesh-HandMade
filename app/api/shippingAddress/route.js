import connectDB from "@/lib/connectDB";
import ShippingAddress from "@/models/ShippingAddress";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";

export async function POST(req) {
  await connectDB();
  const session = await getServerSession();

  if (!session || !session.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  // Find user by email to get Mongo _id
  const dbUser = await User.findOne({ email: session.user.email });
  if (!dbUser) {
    return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
  }

  const body = await req.json();
  const { firstName, lastName, address, city, state, postalCode, country, phone, email } = body;

  if (!firstName || !lastName || !address || !city || !state || !postalCode || !country || !phone || !email) {
    return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
  }

  const shippingAddress = await ShippingAddress.create({
    user: dbUser._id,
    firstName, lastName, address, city, state, postalCode, country, phone, email
  });

  // Add the address to the user's shippingAddresses array
  await User.findByIdAndUpdate(dbUser._id, { $push: { shippingAddresses: shippingAddress._id } });

  return new Response(JSON.stringify({ success: true, shippingAddress }), { status: 201 });
}