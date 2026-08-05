import Order from '../../../../models/Order';
import connectDB from '../../../../lib/connectDB';

export async function GET(req, { params }) {
  await connectDB();
  // In Next.js 13+, we need to await the params object
  const { orderId } = await params;

  // Try finding by MongoDB _id first, then by orderId field
  let order = null;
  try {
    order = await Order.findById(orderId).populate('statusHistory');
  } catch (e) {
    // If not a valid ObjectId, skip error
    // console.log('Error finding by ID, will try orderId:', e.message);
  }
  if (!order) {
    order = await Order.findOne({ orderId: orderId });
  }
  if (!order) {
    return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  
  // Convert to plain object and ensure statusHistory exists
  const orderData = order.toObject ? order.toObject() : order;
  orderData.statusHistory = orderData.statusHistory || [];
  
  return new Response(
    JSON.stringify(orderData), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

// PUT /api/orders/[orderId] - update order fields (e.g., status with message)
export async function PUT(req, { params }) {
  await connectDB();
  try {
    // In Next.js 13+, we need to await the params object
    const { orderId } = await params;
    const requestData = await req.json();
    const { status, message, ...otherUpdates } = requestData;
    
    // console.log('Update request received:', { orderId, status, message, otherUpdates });
    
    // Prepare the update object
    const update = { ...otherUpdates };
    
    // If status is being updated, add to status history
    if (status) {
      update.status = status;
      const statusUpdate = {
        status,
        message: message || `Status updated to ${status}`,
        updatedAt: new Date()
      };

      // Add tracking info if status is Shipped and trackingNumber is provided
      if (status === 'Shipped' && otherUpdates.trackingNumber) {
        statusUpdate.trackingNumber = otherUpdates.trackingNumber;
        statusUpdate.trackingUrl = otherUpdates.trackingUrl || '';
        
        // Also update the main order with tracking info for easy access
        update.trackingNumber = otherUpdates.trackingNumber;
        update.trackingUrl = otherUpdates.trackingUrl || '';
      }

      update.$push = {
        statusHistory: statusUpdate
      };
    }
    
    // console.log('Prepared update object:', JSON.stringify(update, null, 2));
    
    // First try to update by _id
    // console.log('Attempting to find and update order by _id:', orderId);
    let order = await Order.findById(orderId);
    
    if (!order) {
      // If not found by _id, try finding by orderId
      // console.log('Order not found by _id, trying with orderId...');
      order = await Order.findOne({ orderId: orderId });
    }
    
    if (order) {
      // console.log('Found order, updating...');
      
      // Update the document with the new values
      Object.assign(order, update);
      
      // Handle status history update
      if (update.$push?.statusHistory) {
        order.statusHistory = order.statusHistory || [];
        const newStatusUpdate = update.$push.statusHistory;
        
        // Check if there's an existing status entry with the same status
        const existingStatusIndex = order.statusHistory.findIndex(
          entry => entry.status === newStatusUpdate.status
        );
        
        if (existingStatusIndex >= 0) {
          // Update existing status entry
          order.statusHistory[existingStatusIndex] = {
            ...order.statusHistory[existingStatusIndex],
            ...newStatusUpdate,
            updatedAt: new Date()
          };
          // Mark the array as modified
          order.markModified('statusHistory');
        } else {
          // Add new status entry if status is different
          order.statusHistory.push(newStatusUpdate);
        }
      }
      
      // Save the updated order
      order = await order.save();
      // console.log('Order updated successfully');

      // Send Shipping Confirmation Email
      if (status === 'Shipped' && order.email && process.env.BREVO_API_KEY) {
        try {
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #4F46E5;">Your Order Has Shipped! 🎉</h2>
                <p>Hi ${order.firstName || 'Customer'},</p>
                <p>Great news! Your order <strong>#${order.orderId || order._id}</strong> has been shipped and is on its way to you.</p>
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB;">
                    <h3 style="margin-top: 0; color: #1F2937;">Tracking Information</h3>
                    <p style="margin-bottom: 8px; font-size: 16px;"><strong>Tracking ID:</strong> ${otherUpdates.trackingNumber || 'N/A'}</p>
                    ${otherUpdates.trackingUrl ? `<p style="margin-bottom: 0; font-size: 16px;"><strong>Track your package:</strong> <br/><br/><a href="${otherUpdates.trackingUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Track Order Now</a></p>` : ''}
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Best regards,<br/><strong>Rishikesh HandMade</strong></p>
            </div>
          `;
          
          await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "api-key": process.env.BREVO_API_KEY,
              },
              body: JSON.stringify({
                  sender: { email: "rishikeshhandmade@gmail.com", name: "Rishikesh HandMade" },
                  to: [{ email: order.email }],
                  subject: `Your Order #${order.orderId || order._id} has shipped!`,
                  htmlContent: htmlContent
              }),
          });
          // console.log("Shipping email sent successfully to", order.email);
        } catch(emailErr) {
          console.error("Failed to send shipping email:", emailErr);
        }
      }
    }
    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found', success: false }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Fetch the order again with statusHistory populated
    const updatedOrder = await Order.findById(order._id).lean();
    
    return new Response(
      JSON.stringify({ 
        order: {
          ...updatedOrder,
          statusHistory: updatedOrder.statusHistory || []
        },
        success: true,
        message: 'Order updated successfully'
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // console.error('Error updating order:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        message: 'Failed to update order'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}