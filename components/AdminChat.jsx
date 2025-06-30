"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, MessageSquare, Calendar, HelpCircle, Clock, User, RefreshCw, Check, ChevronDown } from "lucide-react"
import Chat from "@/components/Chat"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import ChatOrder from "./ChatOrder"

export default function AdminChat() {
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'resolved'
    const [selectedChat, setSelectedChat] = useState(null)
    const [showChat, setShowChat] = useState(false)
    const [chats, setChats] = useState([])
    const [type, setType] = useState("booking")
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [activeOrderChat, setActiveOrderChat] = useState(null);
    const [messages, setMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [orderThreads, setOrderThreads] = useState([])
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({
        chatbot: 0,
        "order-queries": 0,
        booking: 0,
        enquiry: 0
    });
    // console.log(selectedOrder)


    const fetchChats = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/getAllChats?type=${type}`)
            const data = await res.json()
            let enhancedChats = [];

            if (type === 'chatbot') {
                // Normalize Chat model data
                enhancedChats = data.chats.map(chat => ({
                    ...chat,
                    userName: chat?.userId?.name || "Unknown User",
                    lastMessage: chat?.messages?.length
                        ? chat.messages[chat.messages.length - 1]?.text
                        : "No messages yet",
                    lastMessageTime: chat?.messages?.length
                        ? chat.messages[chat.messages.length - 1]?.createdAt
                        : chat.createdAt,
                    unreadCountAdmin: chat?.unreadCountAdmin || 0,
                    unreadCountUser: chat?.unreadCountUser || 0,
                    status: chat.status || 'pending',
                    type: 'chatbot',
                }));
            } else if (type === 'order-queries') {
                // Normalize OrderChat model data
                enhancedChats = data.chats.map(chat => ({
                    ...chat,
                    userName: chat?.userId?.name || "Unknown User",
                    lastMessage: chat?.lastMessage || "No messages yet",
                    lastMessageTime: chat?.lastMessageTime || chat.createdAt,
                    unreadCountAdmin: chat?.unreadCountAdmin || 0,
                    unreadCountUser: chat?.unreadCountUser || 0,
                    status: chat.status || 'pending',
                    type: 'order-queries',
                }));
            } else {
                // fallback for future types
                enhancedChats = data.chats.map(chat => ({
                    ...chat,
                    userName: chat?.userId?.name || "Unknown User",
                    lastMessage: chat?.lastMessage || "No messages yet",
                    lastMessageTime: chat?.lastMessageTime || chat.createdAt,
                    unreadCountAdmin: chat?.unreadCountAdmin || 0,
                    unreadCountUser: chat?.unreadCountUser || 0,
                    status: chat.status || 'pending',
                    type: type,
                }));
            }

            setChats(enhancedChats);

            // Calculate unread counts for all types
            setUnreadCounts(prev => ({
                ...prev,
                [type]: enhancedChats.reduce((sum, chat) => sum + (chat.unreadCountAdmin || 0), 0)
            }));
        } catch (error) {
            // console.error("Error fetching chats:", error)
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        // Only mark as read for chatbot messages
        const markAsRead = async () => {
            if (type === 'chatbot' && selectedChat && selectedChat.userId && selectedChat.userId._id) {
                try {
                    await fetch('/api/chat/mark-as-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'chatbot',
                            userId: selectedChat.userId._id,
                            isAdmin: true
                        })
                    });
                    // Optionally update local state for unread count if needed
                } catch (error) {
                    // console.error("Failed to mark as read:", error);
                }
            }
        };
        markAsRead();
    }, [selectedChat, type]);

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, [type]);

    // Fetch messages for selected chat (user or order)
    useEffect(() => {
        setMessages([]);
        setMessagesLoading(true);

        // Order Chat (order-queries)
        if (type === "order-queries" && activeOrderChat) {
            fetch(`/api/getOrderChat?userId=${activeOrderChat.userId}&orderId=${activeOrderChat.orderId}`)
                .then(res => res.json())
                .then(data => setMessages(data.messages || []))
                .finally(() => setMessagesLoading(false));
        }
        // Chatbot Chat
        else if (type === "chatbot" && selectedChat && selectedChat.userId && selectedChat.userId._id) {
            fetch(`/api/getMessages?userId=${selectedChat.userId._id}`)
                .then(res => res.json())
                .then(data => setMessages(data.messages || []))
                .finally(() => setMessagesLoading(false));
        } else {
            setMessagesLoading(false);
        }
    }, [type, activeOrderChat, selectedChat]);

    const filteredChats = chats.filter(
        (chat) =>
            (chat.userName.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (true)
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500"
            case "resolved":
                return "bg-green-500"
            default:
                return "bg-blue-500"
        }
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } else if (diffDays === 1) {
            return "Yesterday"
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: "short" })
        } else {
            return date.toLocaleDateString([], { month: "short", day: "numeric" })
        }
    }

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }
    const handleStatusChange = async (newStatus) => {
        if (!selectedChat) return;
        try {
            let endpoint = '';
            if (type === "chatbot") {
                endpoint = `/api/chat/${selectedChat._id}`;
            } else if (type === "order-queries") {
                endpoint = `/api/orders/${selectedChat.orderId || selectedChat._id}`;
            }
            else {
                toast.error("Unknown chat type for status update.");
                return;
            }
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus.toLowerCase(),
                }),
            });
            if (res.ok) {
                setChats(prevChats =>
                    prevChats.map(chat =>
                        chat._id === selectedChat._id
                            ? {
                                ...chat,
                                status: newStatus.toLowerCase(),
                                chatStatus: newStatus.toLowerCase()
                            }
                            : chat
                    )
                );
                setSelectedChat(prev => ({
                    ...prev,
                    status: newStatus.toLowerCase(),
                    chatStatus: newStatus.toLowerCase()
                }));
                toast.success("Status updated successfully!");
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to update status.");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Network error while updating status.");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-transparent">
            {/* Sidebar */}
            <div className="w-full lg:max-w-xs border-r flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Admin Chat
                    </h1>
                </div>

                <Tabs defaultValue="booking" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-4">
                        <TabsList className="w-full p-2">
                            <TabsTrigger value="chatbot" className="flex-1 flex items-center py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white" onClick={() => { setType("chatbot"), setShowChat(false) }}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Chat Bot Chats
                            </TabsTrigger>
                            <TabsTrigger value="order-queries" className="flex-1 flex items-center py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white" onClick={() => { setType("order-queries"), setShowChat(false) }}>
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Order Enquiry
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search chats..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-sm text-muted-foreground">
                            {filteredChats.length} {filteredChats.length === 1 ? "chat" : "chats"}
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="shrink-0">
                                    {statusFilter === "all" ? "All Statuses" : statusFilter}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                                    All Statuses
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                                    Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>
                                    Resolved
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="sm" onClick={fetchChats} disabled={isLoading} className="h-8 w-8 p-0">
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            <span className="sr-only">Refresh</span>
                        </Button>
                    </div>

                    <TabsContent value="chatbot" className="flex-1 overflow-y-auto m-0 p-0">
                        <ChatList
                            chats={filteredChats}
                            selectedChat={selectedChat}
                            setShowChat={setShowChat}
                            showChat={showChat}
                            setSelectedChat={setSelectedChat}
                            getStatusColor={getStatusColor}
                            formatTime={formatTime}
                            getInitials={getInitials}
                        />
                    </TabsContent>

                    <TabsContent value="order-queries" className="flex-1 overflow-y-auto m-0 p-0">
                        <ChatList
                            chats={filteredChats}
                            selectedChat={selectedChat}
                            setShowChat={setShowChat}
                            showChat={showChat}
                            setSelectedChat={setSelectedChat}
                            getStatusColor={getStatusColor}
                            formatTime={formatTime}
                            getInitials={getInitials}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col w-full h-full">
                {showChat ? (
                    <>
                        {/* {type === "chatbot" && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="w-fit !m-4">
                                    <Button variant="outline" className={`!p-6 ${selectedChat.status === "pending" && "border-yellow-400 bg-yellow-100 hover:bg-yellow-600"} ${selectedChat.status === "resolved" && "border-green-400 bg-green-100 hover:bg-green-600"} border-2 hover:text-white flex items-center gap-2`}>
                                        <span className="capitalize">{selectedChat.status}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='border-2 border-blue-600'>
                                    {["pending", "resolved"].map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onClick={() => handleStatusChange(option)}
                                            className="capitalize focus:hover:bg-blue-100 cursor-pointer hover:bg-blue-100"
                                        >
                                            {option}
                                            {selectedChat.status === option && (
                                                <Check className="h-4 w-4 ml-2" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {type === "order-queries" && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="w-fit !m-4">
                                    <Button variant="outline" className={`!p-6 ${selectedChat.status === "pending" && "border-yellow-400 bg-yellow-100 hover:bg-yellow-600"} ${selectedChat.status === "resolved" && "border-green-400 bg-green-100 hover:bg-green-600"} border-2 hover:text-white flex items-center gap-2`}>
                                        <span className="capitalize">{selectedChat.status}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='border-2 border-blue-600'>
                                    {["pending", "resolved"].map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onClick={() => handleStatusChange(option)}
                                            className="capitalize focus:hover:bg-blue-100 cursor-pointer hover:bg-blue-100"
                                        >
                                            {option}
                                            {selectedChat.status === option && (
                                                <Check className="h-4 w-4 ml-2" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )} */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="flex-1 overflow-hidden p-4">
                                {selectedChat && (
                                    type === "order-queries" ? (
                                        <ChatOrder
                                            order={selectedChat}
                                            onBack={() => setShowChat(false)}
                                            onViewOrder={async (order) => {
                                                // Only fetch if full details are missing
                                                if (!order.items || !order.summary) {
                                                    try {
                                                        const res = await fetch(`/api/orders/${order.orderId || order._id}`);
                                                        if (!res.ok) throw new Error('Failed to fetch order details');
                                                        const fullOrder = await res.json();
                                                        setSelectedOrder(fullOrder);
                                                    } catch (err) {
                                                        alert('Failed to fetch order details');
                                                        return;
                                                    }
                                                } else {
                                                    setSelectedOrder(order);
                                                }
                                                setOrderModalOpen(true);
                                            }}
                                        />
                                    ) : (
                                        <Chat
                                            type={type}
                                            userId={selectedChat.userId?._id || selectedChat.userId}
                                            isAdmin={true}
                                            recipientName={selectedChat.userName}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground/50" />
                        <h2 className="text-xl font-medium mb-2">No chat selected</h2>
                        <p>Select a conversation from the sidebar to start messaging</p>
                    </div>
                )}
            </div>
            {
                orderModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative">
                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-800"
                                onClick={() => setOrderModalOpen(false)}
                            >
                                ×
                            </button>
                            {/* Header */}
                            <div className="mb-4">
                                <div className="text-lg font-bold">Order ID: {selectedOrder.orderId}</div>
                                <div className="text-sm">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                <div className="text-sm">
                                    Status: <span className="font-semibold text-red-500">{selectedOrder.status}</span>
                                </div>
                            </div>
                            {/* Product Table */}
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                                    <thead className="bg-gray-100 text-gray-700 font-semibold">
                                        <tr>
                                            <th className="py-3 px-2 text-center">Image</th>
                                            <th className="py-3 px-4 text-left">Product</th>
                                            <th className="py-3 px-3 text-center">Qty</th>
                                            <th className="py-3 px-3 text-center">Size</th>
                                            <th className="py-3 px-3 text-right">Price</th>
                                            <th className="py-3 px-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.products?.map((item, idx) => (
                                            <tr
                                                key={idx}
                                                className="border-t border-gray-200 hover:bg-gray-50 text-gray-800"
                                            >
                                                <td className="py-3 px-2 text-center">
                                                    {item.image?.url && (
                                                        <img
                                                            src={item.image.url}
                                                            alt={item.name}
                                                            className="w-14 h-14 object-cover rounded shadow mx-auto"
                                                        />
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 align-middle font-medium min-w-[180px]">
                                                    {item.name}
                                                </td>
                                                <td className="py-3 px-3 text-center align-middle">{item.qty}</td>
                                                <td className="py-3 px-3 text-center align-middle">{item.size}</td>
                                                <td className="py-3 px-3 text-right align-middle">₹{item.price}</td>
                                                <td className="py-3 px-3 text-right align-middle font-bold text-gray-900">
                                                    ₹{item.qty * item.price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Billing & Shipping Info + Summary */}
                            <div className="flex flex-wrap gap-6">
                                {/* Billing & Shipping */}
                                <div className="flex-1 min-w-[250px]">
                                    <div className="mb-2 font-semibold">Customer Information</div>
                                    <div>Name: {selectedOrder.firstName} {selectedOrder.lastName}</div>
                                    <div>Email: {selectedOrder.email}</div>
                                    <div>Phone: {selectedOrder.phone}</div>
                                    <div>Alt. Phone: {selectedOrder.altPhone}</div>
                                    <div className="mt-2 font-semibold">Shipping Address</div>
                                    <div>{selectedOrder.address}</div>
                                    <div>City: {selectedOrder.city}</div>
                                    <div>State: {selectedOrder.state}</div>
                                    <div>Pin Code: {selectedOrder.pincode}</div>
                                </div>
                                {/* Summary Card */}
                                <div className="flex-1 min-w-[220px] bg-gray-50 rounded-lg p-4 shadow-inner">
                                    <div>Subtotal (INR): <span className="float-right">{selectedOrder.subTotal}</span></div>
                                    <div>Discount Amount: <span className="float-right">{selectedOrder.totalDiscount}</span></div>
                                    <div>Cart Total: <span className="float-right">{selectedOrder.cartTotal}</span></div>
                                    <div className="font-bold mt-2">Status: <span className="float-right">{selectedOrder.status}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}


function ChatList({ chats, setShowChat, showChat, selectedChat, setSelectedChat, getStatusColor, formatTime, getInitials }) {
    if (chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 p-4 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 text-muted-foreground/50" />
                <p>No chats available</p>
            </div>
        )
    }
    return (
        <div className="space-y-1 p-2">
            {chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((chat) => (
                <Card
                    key={chat._id}
                    onClick={() => { setSelectedChat(chat); setShowChat(true) }}
                    className={cn(
                        `flex items-center p-3 border-2 cursor-pointer hover:bg-blue-100 transition-colors`,
                        selectedChat?._id === chat._id ? "border-blue-600" : "border-transparent"
                    )}
                >
                    <div className="relative mr-3">
                        <Avatar>
                            <AvatarImage src={`/user.png`} alt={chat.userName} />
                            <AvatarFallback>{getInitials(chat.userName)}</AvatarFallback>
                        </Avatar>
                        <span
                            className={cn(
                                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                                getStatusColor(chat.status),
                            )}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-medium text-sm truncate">{chat.userName}</h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {formatTime(chat.lastMessageTime)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                            {chat.unreadCountAdmin > 0 && (
                                <Badge variant="default" className="ml-2 bg-blue-600">
                                    {chat.unreadCountAdmin}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center mt-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                                <User className="h-3 w-3 mr-1" />
                                <span className="truncate">{chat.bookingId}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}