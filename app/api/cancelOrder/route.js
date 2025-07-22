// app/api/cancelOrder/route.js
import connectDB  from '@/lib/connectDB';
import CancelOrder from '@/models/CancelOrder';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const order = await Order.findById(data.orderId)
    populate('items.productId')
    .lean();
    // Create new cancellation request
    const cancelRequest = new CancelOrder({
      ...data,
      order: {
        items: order.items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.price,
          quantity: item.quantity,
          image: item.productId.images[0], // First image
          size: item.size,
          color: item.color
        })),
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        orderDate: order.createdAt
      },
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        note: 'Cancellation request submitted'
      }]
    });
    
    await cancelRequest.save();
    
    return NextResponse.json({ 
      success: true, 
      data: cancelRequest 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const requests = await CancelOrder.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { id, status, adminNotes } = await req.json();
    
    const request = await CancelOrder.findById(id);
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update request status
    request.status = status;
    request.adminNotes = adminNotes;
    request.statusHistory.push({
      status,
      note: adminNotes || `Status changed to ${status}`
    });

    // If approved, update the order status
    if (status === 'approved') {
      await Order.findByIdAndUpdate(request.orderId, {
        status: 'cancelled',
        $push: {
          statusHistory: {
            status: 'cancelled',
            note: 'Order cancelled by admin'
          }
        }
      });
    }

    await request.save();
    
    return NextResponse.json({ 
      success: true, 
      data: request 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}