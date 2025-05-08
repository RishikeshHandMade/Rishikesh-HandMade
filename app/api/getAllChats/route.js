import connectDB from "@/lib/connectDB";
import Chat from "@/models/Chat";
import CustomOrder from "@/models/CustomOrder";
import Enquiry from "@/models/Enquiry";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");

    // Build query
    const query = { type };
    if (userId) {
      query.userId = userId;
    }

    // Fetch chats with lean() for better performance
    const chats = await Chat.find(query)
      .populate("userId", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    // Helper function to fetch enquiry details
    const getEnquiryDetails = async (chat) => {
      const enquiry = await Enquiry.findOne({
        userId: chat.userId?._id,
        id: chat.bookingId,
      }).select("packageId status").lean();
      return {
        packageId: enquiry?.packageId?.toString(),
        status: (enquiry?.status || "pending").toLowerCase() // Ensure lowercase
      };
    };

    // Helper function to fetch booking details
    const getBookingDetails = async (chat) => {
      // Try Order collection first
      let order = await Order.findOne({
        $or: [
          { orderId: chat.bookingId },
        ]
      }).select("packageId chatStatus").lean();

      if (order) {
        return {
          packageId: order.packageId?.toString(),
          status: (order.chatStatus || "pending").toLowerCase() // Use chatStatus
        };
      }

      // Try CustomOrder collection
      order = await CustomOrder.findOne({
        $or: [
          { orderId: chat.bookingId },
        ]
      }).select("packageId chatStatus").lean();
      return {
        packageId: order?.packageId?.toString(),
        status: (order?.chatStatus || "pending").toLowerCase() // Use chatStatus
      };
    };

    // Enhanced chat data
    const enhancedChats = await Promise.all(
      chats.map(async (chat) => {
        let packageId = null;
        let status = "pending";

        if (type === "enquiry") {
          const details = await getEnquiryDetails(chat);
          packageId = details.packageId;
          status = details.status;
        } else if (type === "booking") {
          const details = await getBookingDetails(chat);
          packageId = details.packageId;
          status = details.status;
        }

        return {
          ...chat,
          _id: chat._id.toString(),
          userId: {
            _id: chat.userId?._id?.toString(),
            name: chat.userId?.name,
            email: chat.userId?.email
          },
          bookingId: chat.bookingId?.toString(),
          userName: chat.userId?.name || "Unknown User",
          lastMessage: chat.messages?.length > 0
            ? chat.messages[chat.messages.length - 1]?.text
            : "No messages yet",
          lastMessageTime: chat.messages?.length > 0
            ? chat.messages[chat.messages.length - 1]?.createdAt
            : chat.createdAt,
          unreadCountAdmin: chat.unreadCountAdmin || 0,
          unreadCountUser: chat.unreadCountUser || 0,
          status: status, // This is now consistently set for both types
          chatStatus: status, // Add this for backward compatibility
          packageId,
          unreadCount: userId
            ? chat.unreadCountUser
            : chat.unreadCountAdmin
        };
      })
    );

    return NextResponse.json({
      success: true,
      chats: enhancedChats
    }, { status: 200 });
  } catch (error) {
    console.error("Error in getAllChats:", error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}