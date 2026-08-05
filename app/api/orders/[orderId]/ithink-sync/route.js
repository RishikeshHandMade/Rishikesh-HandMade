import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/Order'; // Assuming models are inside /models
import connectDB from '@/lib/connectDB';

export async function POST(req, { params }) {
    await connectDB();
    
    try {
        const { orderId } =await params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return NextResponse.json({ success: false, error: 'Invalid Order ID' }, { status: 400 });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        const access_token = process.env.ITHINK_ACCESS_TOKEN;
        const secret_key = process.env.ITHINK_SECRET_KEY;
        const pickup_address_id = process.env.ITHINK_PICKUP_ADDRESS_ID;
        // Default to Production API URL if not explicitly set in .env
        const apiUrl = process.env.ITHINK_API_URL;

        if (!access_token || !secret_key || !pickup_address_id) {
            return NextResponse.json({ success: false, error: 'iThinkLogistics API keys are missing' }, { status: 500 });
        }

        // Calculate total weight and dimensions (dummy values if not present)
        let totalWeight = 0;
        const productsPayload = order.products.map(p => {
            totalWeight += (p.weight || 0) * (p.qty || 1);
            return {
                "product_name": p.name || "Product",
                "product_sku": p.productCode || "",
                "product_quantity": (p.qty || 1).toString(),
                "product_price": (p.price || 0).toString(),
                "product_tax_rate": (p.cgst + p.sgst || 0).toString(),
                "product_hsn_code": "",
                "product_discount": (p.discountAmount || 0).toString(),
                "product_img_url": p.image || ""
            };
        });

        // Set default weight if it's 0 (API requires weight)
        if (totalWeight === 0) totalWeight = 500; // default 500 grams

        const addressLine1 = order.street || order.address || '';
        
        const shipmentData = {
            "waybill": "",
            "order": order.orderId || orderId.toString().substring(0, 8),
            "sub_order": "",
            "order_date": new Date(order.createdAt || order.datePurchased).toLocaleDateString('en-GB').replace(/\//g, '-'), // DD-MM-YYYY
            "total_amount": (order.cartTotal || order.subTotal || 0).toString(),
            "name": `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer',
            "company_name": "",
            "add": addressLine1.substring(0, 50), // max limit might apply
            "add2": addressLine1.length > 50 ? addressLine1.substring(50, 100) : "",
            "add3": "",
            "pin": order.pincode || "",
            "city": order.city || "",
            "state": order.state || "",
            "country": "India",
            "phone": order.phone || "",
            "alt_phone": order.altPhone || "",
            "email": order.email || "",
            "is_billing_same_as_shipping": "yes",
            "billing_name": `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer',
            "billing_company_name": "",
            "billing_add": addressLine1.substring(0, 50),
            "billing_add2": addressLine1.length > 50 ? addressLine1.substring(50, 100) : "",
            "billing_add3": "",
            "billing_pin": order.pincode || "",
            "billing_city": order.city || "",
            "billing_state": order.state || "",
            "billing_country": "India",
            "billing_phone": order.phone || "",
            "billing_alt_phone": order.altPhone || "",
            "billing_email": order.email || "",
            "products": productsPayload,
            "shipment_length": "10",
            "shipment_width": "10",
            "shipment_height": "10",
            "weight": totalWeight.toString(),
            "shipping_charges": (order.shippingCost || 0).toString(),
            "giftwrap_charges": "0",
            "transaction_charges": "0",
            "total_discount": (order.totalDiscount || 0).toString(),
            "first_attemp_discount": "0",
            "cod_charges": "0",
            "advance_amount": "0",
            "cod_amount": (order.paymentMethod === 'cod' || order.payment === 'cod') ? (order.cartTotal || order.subTotal || 0).toString() : "0",
            "payment_mode": (order.paymentMethod === 'cod' || order.payment === 'cod') ? "COD" : "Prepaid",
            "reseller_name": "",
            "eway_bill_number": "",
            "gst_number": "",
            "what3words": "",
            "return_address_id": pickup_address_id 
        };

        const payload = {
            "data": {
                "shipments": [shipmentData],
                "pickup_address_id": pickup_address_id,
                "access_token": access_token,
                "secret_key": secret_key,
                "logistics": "", // Default
                "s_type": "",
                "order_type": ""
            }
        };

        console.log("--- ITHINK LOGISTICS REQUEST PAYLOAD ---");
        console.log(JSON.stringify(payload, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        console.log("--- ITHINK LOGISTICS API RESPONSE ---");
        console.log(JSON.stringify(data, null, 2));

        if (data.status_code === 200 && data.status === "success") {
            const resultData = data.data && data.data["1"];
            if (resultData && resultData.status?.toLowerCase() === "success") {
                const waybill = resultData.waybill;
                const trackingUrl = resultData.tracking_url || `https://ithinklogistics.co.in/postship/tracking/${waybill}`;
                
                return NextResponse.json({
                    success: true,
                    waybill: waybill,
                    trackingUrl: trackingUrl,
                    message: 'Order synced successfully'
                });
            } else {
                return NextResponse.json({ success: false, error: resultData?.remark || 'Unknown error from iThinkLogistics' }, { status: 400 });
            }
        } else {
            // Extract the actual error message from data["1"].remark if available
            let errorMessage = data.html_message || 'Failed to sync with iThinkLogistics';
            if (data.data && typeof data.data === 'object') {
                const firstKey = Object.keys(data.data)[0];
                if (firstKey && data.data[firstKey] && data.data[firstKey].remark) {
                    errorMessage = data.data[firstKey].remark;
                }
            }
            return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
        }
        
    } catch (error) {
        console.error('Error syncing with iThinkLogistics:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
