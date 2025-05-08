import connectDB from "@/lib/connectDB";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

export async function POST(req, res) {
    try {
        await connectDB();
        const body = await req.json();
        const { sender, adminName, text, type, bookingId, userId, images } = body;

        const newMessage = {
            sender,
            text,
            ...(sender === 'admin' && { adminName }),
            status: "sent",
            createdAt: new Date(),
            image: images || [],
        };

        let chat = await Chat.findOne({ type, bookingId });

        if (!chat) {
            chat = new Chat({
                type,
                bookingId,
                userId,
                messages: [newMessage],
                unreadCountAdmin: sender !== 'admin' ? 1 : 0,
                unreadCountUser: sender === 'admin' ? 1 : 0
            });
        } else {
            chat.messages.push(newMessage);

            // Increment unread count for the recipient
            if (sender === 'admin') {
                chat.unreadCountUser += 1;
            } else {
                chat.unreadCountAdmin += 1;
            }

            chat.updatedAt = new Date();
        }

        await chat.save();

        return NextResponse.json({
            success: true,
            message: "Message sent successfully",
            chatId: chat._id
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}