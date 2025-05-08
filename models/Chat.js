import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: String,
  adminName: String, 
  text: String,
  status: String,
  createdAt: Date,
  image: [{ url: { type: String }, key: { type: String } }],
});

const chatSchema = new mongoose.Schema({
  type: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: String, required: true },
  messages: [messageSchema],
  unreadCountUser: { type: Number, default: 0 }, // Count for user
  unreadCountAdmin: { type: Number, default: 0 }, // Count for admin
  lastReadUser: { type: Date, default: Date.now },
  lastReadAdmin: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
