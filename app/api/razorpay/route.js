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
        console.log('Razorpay order creation response:', razorpayOrder);

        if (!razorpayOrder || !razorpayOrder.id) {
            // console.error('Razorpay order creation failed or missing order id:', razorpayOrder);
            return NextResponse.json({ error: 'Failed to create Razorpay order', details: razorpayOrder }, { status: 500 });
        }

        // Save the order in the database
        // Import the Order model at the top: import Order from "@/models/Order";
        let dbOrder;
        try {
            dbOrder = await Order.create({
                products,
                customerName: customer?.name,
                customerEmail: customer?.email,
                customerPhone: customer?.phone,
                address: customer?.address,
                amount,
                currency,
                receipt,
                razorpayOrderId: razorpayOrder.id,
                orderId: razorpayOrder.id,
                status: "Pending",
                payment: "online",
                paymentMethod: "razorpay"
            });
        } catch (dbErr) {
            console.error("Failed to save order in DB:", dbErr);
            return NextResponse.json({ error: "Failed to save order in DB" }, { status: 500 });
        }

        // Respond with both Razorpay order ID and DB order ID
        return NextResponse.json({
            id: razorpayOrder.id, // Razorpay order ID for payment modal
            orderId: dbOrder._id, // MongoDB order ID for tracking
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });
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
        // console.log({
        //     razorpay_payment_id,
        //     razorpay_order_id,
        //     razorpay_signature
        //   });
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
        const order = await Order.findOne({ orderId: razorpay_order_id });
        // console.log("Order found:", order);
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