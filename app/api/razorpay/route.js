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
        // console.log('Razorpay order creation response:', razorpayOrder);

        if (!razorpayOrder || !razorpayOrder.id) {
            // console.error('Razorpay order creation failed or missing order id:', razorpayOrder);
            return NextResponse.json({ error: 'Failed to create Razorpay order', details: razorpayOrder }, { status: 500 });
        }

        // Save the order in the database
        // Use frontend-provided orderId and transactionId if present
        let dbOrder;
        try {
            let userEmail = customer?.email;
            dbOrder = await Order.create({
                products: products.map(item => ({
                    productId: item.productId || item._id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty || item.quantity || 1,
                    image: item.image,
                    color: item.color || '',
                    size: item.size || ''
                })),
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
                paymentMethod: "razorpay",
                agree: true, // Always set agree true for online orders
                email: userEmail // Always set email for online orders, prefer session user
            });
        } catch (dbErr) {
            // console.error("Failed to save order in DB:", dbErr);
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
            // console.error("Error creating Razorpay order:", error);
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
        console.log('Starting payment verification...');
        const body = await request.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, cart, checkoutData, formFields, user } = body;
        
    
    
        
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
            
        console.log('Signature verification completed');

        if (generatedSignature !== razorpay_signature) {
            console.error('Invalid signature:', {
                generated: generatedSignature,
                received: razorpay_signature
            });
            return NextResponse.json(
                { success: false, error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Step 2: Find and update the order
        // console.log('Looking up order with orderId:', razorpay_order_id);
        const order = await Order.findOne({ orderId: razorpay_order_id });
        
        if (!order) {
            console.error('Order not found for orderId:', razorpay_order_id);
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }
        
        console.log('Found order:', order._id);
        
        // Update order status and payment details
        order.transactionId = razorpay_payment_id;
        order.status = "Paid";
        order.paymentMethod = "online";
        order.datePurchased = new Date();
        
        // Update products if cart data is provided
        if (cart && Array.isArray(cart)) {
            console.log('Updating products from cart:', cart.length, 'items');
            try {
                order.products = cart.map(item => {
                    // Handle image field - extract URL if it's an object
                    let imageUrl = item.image;
                    if (item.image && typeof item.image === 'object') {
                        imageUrl = item.image.url || '';
                    }
                    
                    return {
                        productId: item.productId || item._id,
                        name: item.name,
                        price: item.price,
                        qty: item.qty || item.quantity || 1,
                        image: imageUrl, // Now we're sure this is a string
                        color: item.color || '',
                        size: item.size || ''
                    };
                });
                // console.log('Products updated successfully');
            } catch (cartError) {
                console.error('Error updating products:', cartError);
                // Continue with the order update even if product update fails
            }
        }
        
        // Update checkout summary if available
        if (checkoutData) {
            console.log('Updating checkout summary');
            order.cartTotal = checkoutData.cartTotal;
            order.subTotal = checkoutData.subTotal;
            order.totalDiscount = checkoutData.totalDiscount;
            order.totalTax = checkoutData.totalTax;
            order.shippingCost = checkoutData.shippingCost;
            order.promoCode = checkoutData.promoCode;
            order.promoDiscount = checkoutData.promoDiscount;
        }
        
        // Update customer details if form fields are provided
        if (formFields) {
            console.log('Updating customer details');
            order.firstName = formFields.firstName || formFields.fullName || order.firstName;
            order.lastName = formFields.lastName || order.lastName;
            order.email = formFields.email || order.email;
            order.phone = formFields.mobile || formFields.phone || order.phone;
            order.altPhone = formFields.altPhone || order.altPhone;
            order.street = formFields.street || order.street;
            order.city = formFields.city || order.city;
            order.district = formFields.district || order.district;
            order.state = formFields.state || order.state;
            order.pincode = formFields.pincode || order.pincode;
            order.address = formFields.address || 
                [formFields.street, formFields.city, formFields.district, formFields.state, formFields.pincode]
                    .filter(Boolean).join(', ');
        }
        
        // Update user ID if available
        if (user && user._id) {
            console.log('Updating user ID:', user._id);
            order.userId = user._id;
        }
        
        try {
            await order.save();
            console.log('Order updated successfully');
        } catch (orderSaveError) {
            console.error('Error updating order:', orderSaveError);
            return NextResponse.json(
                { success: false, error: "Failed to update order" },
                { status: 500 }
            );
        }
        
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
        // Always set email for online orders (on update)
        if (user && user.email) {
            order.email = user.email;
        } else if (formFields && formFields.email) {
            order.email = formFields.email;
        } // else leave as-is if already present
        order.agree = true; // Always set agree true for online orders (on update)
        await order.save();

        // Update quantities after successful payment
        try {
            const products = cart || order.products || [];
            const itemsToUpdate = products.map(item => ({
                productId: item.productId || item._id,
                variantId: item.variantId || 0, // Default to 0 if no variantId
                quantity: item.quantity || 1
            })).filter(item => item.productId && item.quantity > 0);

            if (itemsToUpdate.length > 0) {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${baseUrl}/api/product/updateQuantities`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ items: itemsToUpdate })
                });

                if (!response.ok) {
                    console.error('Failed to update quantities after payment:', await response.text());
                }
            }
        } catch (error) {
            console.error('Error updating quantities after payment:', error);
            // Don't fail the payment flow if quantity update fails
        }

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