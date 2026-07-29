import { NextResponse } from 'next/server';
import Order from '../../../models/Order';
import connectDB from '@/lib/connectDB';
import { createIThinkShipment, extractIThinkShipmentInfo, hasIThinkShipmentIdentifiers } from '@/lib/ithinkLogistics';

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    if (body.payment === 'cod' || body.paymentMethod === 'cod') {
      return NextResponse.json(
        { error: 'Selected payment method is no longer supported', success: false },
        { status: 400 }
      );
    }
    const isOnline = body.payment === 'online' || body.paymentMethod === 'online';
    if (isOnline && !body.transactionId) {
      body.transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (!isOnline) {
      delete body.transactionId;
    }

    // Process and validate products array
    if (Array.isArray(body.products)) {
      body.products = body.products.map(product => {
        // Handle image - ensure it's a string URL
        let imageUrl = '';
        if (typeof product.image === 'string') {
          imageUrl = product.image;
        } else if (product.image?.url) {
          imageUrl = product.image.url;
        } else if (Array.isArray(product.images) && product.images[0]?.url) {
          imageUrl = product.images[0].url;
        }

        // Calculate afterDiscount if not provided
        const price = Number(product.price) || 0;
        const discountAmount = Number(product.discountAmount) || 0;
        const afterDiscount = product.afterDiscount !== undefined
          ? Number(product.afterDiscount)
          : Math.max(0, price - discountAmount);

        return {
          // Core product info
          _id: product._id || product.productId || product.id,
          productId: product.productId || product._id || product.id,
          id: product.id || product._id?.toString(),
          name: product.name || 'Unnamed Product',
          qty: Math.max(1, Number(product.qty) || 1),
          price: price,
          originalPrice: Number(product.originalPrice) || price,
          afterDiscount: afterDiscount,

          // Product details
          image: imageUrl,
          color: product.color || '',
          size: product.size || '',
          productCode: product.productCode || '',
          weight: Number(product.weight) || 0,
          totalQuantity: Number(product.totalQuantity) || 0,

          // Tax and pricing
          cgst: Number(product.cgst) || 0,
          sgst: Number(product.sgst) || 0,
          discountAmount: discountAmount,
          discountPercent: Number(product.discountPercent) || 0,
          // Handle both couponApplied boolean and string values
          couponApplied: product.couponApplied === true || String(product.couponApplied).toLowerCase() === 'true',
          // Get coupon code from multiple possible fields
          couponCode: String(product.couponCode || product.coupon || '').trim()
        };
      });
    }

    // Ensure order summary fields
    body.cartTotal = Number(body.cartTotal) || 0;
    body.subTotal = Number(body.subTotal) || 0;
    body.totalDiscount = Number(body.totalDiscount) || 0;
    body.totalTax = Number(body.taxTotal) || Number(body.totalTax) || 0;
    body.shippingCost = Number(body.shippingCost) || 0;

    // Handle coupon data from multiple possible sources
    // 1. Check for appliedCoupon object first
    if (body.appliedCoupon) {
      body.promoCode = body.appliedCoupon.code || body.promoCode || '';
      body.promoDiscount = Number(body.appliedCoupon.discount) || Number(body.promoDiscount) || 0;
    }
    // 2. Check for coupon data in products
    else if (body.products && Array.isArray(body.products)) {
      const productWithCoupon = body.products.find(p => p.couponCode);
      if (productWithCoupon) {
        body.promoCode = productWithCoupon.couponCode || body.promoCode || '';
        body.promoDiscount = Number(productWithCoupon.discountAmount) || Number(body.promoDiscount) || 0;
      }
    }
    // 3. Fall back to root level promo data
    else if (body.promoCode || body.promoDiscount) {
      body.promoCode = String(body.promoCode || '');
      body.promoDiscount = Number(body.promoDiscount) || 0;
    }

    // Ensure coupon data is properly set in the order
    if (body.couponCode) {
      body.promoCode = String(body.couponCode);
      body.promoDiscount = Number(body.promoDiscount) || 0;
    }
    // For vendor orders, ensure vendor-specific fields are set
    if (body.isVendorOrder) {
      // Apply vendor pricing if available
      if (body.products && Array.isArray(body.products)) {
        body.products = body.products.map(product => {
          // Use vendorPrice if available, otherwise use regular price
          const price = product.vendorPrice || product.price;
          return {
            ...product,
            price: price,
            originalPrice: product.originalPrice || product.price,
            isVendorOrder: true
          };
        });
      }
      // Set default status for vendor orders
      body.status = 'Bulk Order Requested';
      body.vendorStatus = 'pending';
    }

    // ✅ Save the order
    body.agree = true; // Always set agree true for all new orders
    const order = await Order.create(body);

    if (!body.isVendorOrder && (body.payment === 'online' || body.paymentMethod === 'online' || body.paymentMethod === 'razorpay')) {
      try {
        console.log('[ITHINK][ORDERS] Sync attempt started', {
          orderId: order?.orderId || order?._id?.toString?.() || '',
          paymentMethod: body.paymentMethod || body.payment || '',
        });

        const logisticsResult = await createIThinkShipment(order);
        const shipmentInfo = logisticsResult.success ? extractIThinkShipmentInfo(logisticsResult.data) : {};
        const isShipmentSynced = logisticsResult.success && hasIThinkShipmentIdentifiers(shipmentInfo);
        const ithinkResponseMessage =
          logisticsResult?.data?.message ||
          logisticsResult?.data?.error ||
          String(logisticsResult?.data?.html_message || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const logisticsFailureReason = logisticsResult.error || ithinkResponseMessage || (logisticsResult.success ? 'iThink response did not include shipment identifiers' : 'Failed to sync order to iThink Logistics');

        console.log('[ITHINK][ORDERS] Sync attempt result', {
          orderId: order?.orderId || order?._id?.toString?.() || '',
          success: logisticsResult.success,
          skipped: logisticsResult.skipped || false,
          isShipmentSynced,
          logisticsOrderId: shipmentInfo.logisticsOrderId || '',
          waybill: shipmentInfo.waybill || '',
          trackingNumber: shipmentInfo.trackingNumber || '',
          error: isShipmentSynced ? '' : logisticsFailureReason,
        });

        await Order.findByIdAndUpdate(order._id, {
          logisticsProvider: 'iThink Logistics',
          logisticsStatus: isShipmentSynced ? 'synced' : logisticsResult.skipped ? 'skipped' : 'failed',
          logisticsOrderId: shipmentInfo.logisticsOrderId || '',
          waybill: shipmentInfo.waybill || '',
          trackingNumber: shipmentInfo.trackingNumber || '',
          trackingUrl: shipmentInfo.trackingUrl || '',
          logisticsResponse: logisticsResult.data || null,
          logisticsError: isShipmentSynced
            ? ''
            : logisticsFailureReason,
          logisticsSyncedAt: isShipmentSynced ? new Date() : null,
        });
      } catch (logisticsError) {
        console.error('[ITHINK][ORDERS] Sync crashed', {
          orderId: order?.orderId || order?._id?.toString?.() || '',
          error: logisticsError?.message || 'Unknown iThink error',
        });

        await Order.findByIdAndUpdate(order._id, {
          logisticsProvider: 'iThink Logistics',
          logisticsStatus: 'failed',
          logisticsError: logisticsError.message || 'Failed to sync order to iThink Logistics',
          logisticsSyncedAt: null,
        });
      }
    }

    // ✅ Update quantities using the updateQuantities endpoint
    const products = Array.isArray(body.products) ? body.products : [];
    const items = Array.isArray(body.items) ? body.items : [];

    const itemsToUpdate = [];

    // First, process the items array if it exists (for quantity updates)
    for (const item of items) {
      try {
        const productId = item.productId || item._id;
        if (!productId) {
          // console.warn('Skipping item with no product ID:', JSON.stringify(item, null, 2));
          continue;
        }

        itemsToUpdate.push({
          productId,
          variantId: item.variantId || 0,
          quantity: item.qty || 1,
          size: item.size,
          price: item.price,
          discount: item.discount,
          total: item.total,
          image: item.image
        });
      } catch (error) {
        // console.error('Error processing item:', error, 'Item:', JSON.stringify(item, null, 2));
      }
    }

    // If no items were found in the items array, try to extract from products
    if (itemsToUpdate.length === 0) {
      for (const product of products) {
        try {
          const productId = product._id || product.id;
          if (!productId) {
            // console.warn('Skipping product with no ID:', JSON.stringify(product, null, 2));
            continue;
          }

          // If we have variants, find the matching one
          if (product.quantity?.variants?.length > 0) {
            let variantIndex = 0;

            // If variant is specified, find its index
            if (product.variantId !== undefined) {
              variantIndex = product.quantity.variants.findIndex(
                v => v._id === product.variantId || v.size === product.size
              );
              if (variantIndex === -1) variantIndex = 0;
            }
            // Otherwise try to find by size
            else if (product.size) {
              variantIndex = product.quantity.variants.findIndex(
                v => v.size === product.size
              );
              if (variantIndex === -1) variantIndex = 0;
            }

            itemsToUpdate.push({
              productId,
              variantId: variantIndex,
              quantity: product.qty || 1,
              size: product.size,
              price: product.price,
              discount: product.discount,
              total: product.total,
              image: product.image
            });
          }
          // No variants, just use the product
          else {
            itemsToUpdate.push({
              productId,
              variantId: 0,
              quantity: product.qty || 1,
              size: product.size,
              price: product.price,
              discount: product.discount,
              total: product.total,
              image: product.image
            });
          }
        } catch (error) {
          console.error('Error processing product:', error, 'Product:', JSON.stringify(product, null, 2));
        }
      }
    }

    // console.log('Attempting to update quantities for items:', JSON.stringify(itemsToUpdate, null, 2));

    if (itemsToUpdate.length > 0) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/product/updateQuantities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: itemsToUpdate })
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
          // console.error('Failed to update quantities. Status:', response.status);
          // console.error('Response:', responseData);
          // Continue with order creation even if quantity update fails
        } else {
          // console.log('Successfully updated quantities:', responseData);
          if (responseData.results) {
            responseData.results.forEach(result => {
              if (result.success) {
                // console.log(`Updated product ${result.productId}, variant ${result.variantId}: ${result.previousQty} → ${result.newQty}`);
              } else {
                // console.error(`Failed to update product ${result.productId}, variant ${result.variantId}:`, result.error);
              }
            });
          }
        }
      } catch (error) {
        // console.error('Error in quantity update process:', {
        // error: error.message,
        //   stack: error.stack,
        //   name: error.name
        // });
      }
    }

    return NextResponse.json({
      orderId: order._id,
      success: true
    }, { status: 200 });
  } catch (error) {
    // console.error('Error creating order:', error);
    return NextResponse.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
}

import { getServerSession } from "next-auth/next";

// GET /api/orders - fetch only orders for the current user with agree === true
export async function GET(req) {
  await connectDB();
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
  }
  try {
    const orders = await Order.find({ agree: true, email: session.user.email }).sort({ createdAt: -1 });
    return NextResponse.json({ orders, success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}


