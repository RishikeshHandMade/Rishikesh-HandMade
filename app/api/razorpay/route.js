import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import crypto from "crypto";
import Order from "@/models/Order"; // Import your Order model
import connectDB from "@/lib/connectDB";
import User from "@/models/User";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 📌 Create a Razorpay Order
export async function POST(request) {
    await connectDB();
    try {
        const { amount, currency, receipt, products, customer } = await request.json();

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // ₹1 = 100 paise
            currency,
            receipt,
        });

        if (!razorpayOrder || !razorpayOrder.id) {
            throw new Error("Failed to create Razorpay order");
        }

        // Generate a random 6-character alphanumeric orderId for user-facing use
        function generateOrderId(length = 6) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
        const userOrderId = generateOrderId(6);

        // Save order in MongoDB (products only)
        const newOrder = new Order({
            orderId: userOrderId, // 6-char string for user
            razorpayOrderId: razorpayOrder.id, // for internal reference
            products,                  // Array of products
            name: customer?.name || '',
            email: customer?.email || '',
            phone: customer?.phone || '',
            address: customer?.address || '',
            amount,
            status: "Pending",
            paymentMethod: "online"
        });

        await newOrder.save();

        // Return both the Razorpay order and the user-facing orderId
        return NextResponse.json({ ...razorpayOrder, userOrderId });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}

// 📌 Verify Payment & Fetch Payment Details
export async function PUT(request) {
    await connectDB();
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();

        // Step 1: Verify Razorpay Signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 400 }
            );
        }

        // Step 2: Update order with transactionId (Razorpay payment ID) and payment details
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found for this Razorpay order ID." }, { status: 404 });
        }
        order.transactionId = razorpay_payment_id;
        order.status = "Paid";
        order.paymentMethod = "online";
        order.datePurchased = new Date();
        // Fetch Full Payment Details from Razorpay
        const paymentResponse = await fetch(
            `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(
                        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
                    ).toString("base64")}`,
                },
            }
        );
        const paymentDetails = await paymentResponse.json();
        if (paymentResponse.ok) {
            order.bank = paymentDetails.bank || null;
            order.cardType = paymentDetails.card?.type || null;
        }
        await order.save();
        // Return user-facing orderId and payment details
        return NextResponse.json({
            success: true,
            orderId: order.orderId,
            paymentId: razorpay_payment_id,
            paymentMethod: paymentDetails.method,
            paymentStatus: paymentDetails.status,
            bank: paymentDetails.bank || null,
            cardType: paymentDetails.card?.type || null,
        });
    } catch (error) {
        // console.error("Error verifying Razorpay payment:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Payment verification failed" },
            { status: 500 }
        );
    }
}