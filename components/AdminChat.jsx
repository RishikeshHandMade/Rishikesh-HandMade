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

export default function AdminChat() {
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'resolved'
    const [selectedChat, setSelectedChat] = useState(null)
    const [showChat, setShowChat] = useState(false)
    const [chats, setChats] = useState([])
    const [type, setType] = useState("booking")
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [userQueries, setUserQueries] = useState([]);
    const [uqLoading, setUqLoading] = useState(false);
    console.log(selectedChat)

    const [unreadCounts, setUnreadCounts] = useState({
        bookings: 0,
        enquiries: 0,
    })

    const fetchChats = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/getAllChats?type=${type}`)
            const data = await res.json()

            const enhancedChats = data.chats.map((chat) => {
                return {
                    ...chat,
                    userName: chat?.userId?.name || "Unknown User",
                    lastMessage: chat?.messages?.length
                        ? chat.messages[chat.messages.length - 1]?.text
                        : "No messages yet",
                    lastMessageTime: chat?.messages?.length
                        ? chat.messages[chat.messages.length - 1]?.createdAt
                        : new Date().toISOString(),
                    unreadCountAdmin: chat?.unreadCountAdmin || 0,
                    unreadCountUser: chat?.unreadCountUser || 0,
                    status: chat.status || 'pending', // Always use the status field

                }
            });

            setChats(enhancedChats)

            // Update the unread counts for the tabs
            const bookingUnread = enhancedChats
                .filter(chat => chat.type === 'booking')
                .reduce((sum, chat) => sum + chat.unreadCountAdmin, 0);

            const enquiryUnread = enhancedChats
                .filter(chat => chat.type === 'enquiry')
                .reduce((sum, chat) => sum + chat.unreadCountAdmin, 0);

            setUnreadCounts({
                bookings: bookingUnread,
                enquiries: enquiryUnread
            });
        } catch (error) {
            console.error("Error fetching chats:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const markAsRead = async () => {
            if (selectedChat) {
                try {
                    await fetch('/api/chat/mark-as-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: type,
                            bookingId: selectedChat.bookingId,
                            userId: selectedChat.userId._id,
                            isAdmin: true
                        })
                    });

                    // Update local state
                    setChats(prevChats =>
                        prevChats.map(chat =>
                            chat.bookingId === selectedChat.bookingId
                                ? { ...chat, unreadCountAdmin: 0 }
                                : chat
                        )
                    );

                    // Update the unread counts for the tabs
                    setUnreadCounts(prev => ({
                        bookings: type === 'booking' ? prev.bookings - selectedChat.unreadCountAdmin : prev.bookings,
                        enquiries: type === 'enquiry' ? prev.enquiries - selectedChat.unreadCountAdmin : prev.enquiries
                    }));
                } catch (error) {
                    console.error("Failed to mark as read:", error);
                }
            }
        };

        markAsRead();
    }, [selectedChat, type]);
    useEffect(() => {
        if (type === "user-queries") {
            setUqLoading(true);
            fetch("/api/chat/user-query")
                .then(res => res.json())
                .then(data => setUserQueries(data.queries || []))
                .finally(() => setUqLoading(false));
        }
    }, [type]);
    useEffect(() => {
        fetchChats()
        // Set up polling for new messages
        const interval = setInterval(fetchChats, 10000)
        return () => clearInterval(interval)
    }, [type])

    const filteredChats = chats.filter(
        (chat) =>
            (chat.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.userName.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (statusFilter === "all" || chat.status === statusFilter)
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
            let endpoint;
            let method = "PUT";
            let body;

            if (type === "booking") {
                endpoint = `/api/getBookingById/${selectedChat.bookingId}`;
                body = JSON.stringify({ status: newStatus.toLowerCase() });
            } else if (type === "enquiry") {
                endpoint = `/api/getEnquiryById/${selectedChat.bookingId}`;
                body = JSON.stringify({ status: newStatus.toLowerCase() });
            } else if (type === "user-queries") {
                // User Queries PATCH endpoint
                endpoint = `/api/chat/user-query`;
                method = "PATCH";
                body = JSON.stringify({ id: selectedChat._id, status: newStatus.toLowerCase() });
            }

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body,
            });

            if (res.ok) {
                if (type === "user-queries") {
                    // Update userQueries state
                    setUserQueries(prev =>
                        prev.map(q =>
                            q._id === selectedChat._id
                                ? { ...q, status: newStatus.toLowerCase() }
                                : q
                        )
                    );
                    setSelectedChat(prev =>
                        prev ? { ...prev, status: newStatus.toLowerCase() } : prev
                    );
                } else {
                    // CORRECT STATE UPDATE - Only update the specific chat
                    setChats(prevChats =>
                        prevChats.map(chat =>
                            chat._id === selectedChat._id // Match by _id for exact reference
                                ? {
                                    ...chat,
                                    status: newStatus.toLowerCase(),
                                    chatStatus: newStatus.toLowerCase()
                                }
                                : chat
                        )
                    );

                    // Update the selectedChat reference
                    setSelectedChat(prev => ({
                        ...prev,
                        status: newStatus.toLowerCase(),
                        chatStatus: newStatus.toLowerCase()
                    }));
                }

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
    { console.log("Rendering <Chat /> with userId:", selectedChat?.userId?._id, selectedChat) }

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
                            <TabsTrigger value="user-queries" className="flex-1 flex items-center py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white" onClick={() => { setType("user-queries"), setShowChat(false) }}>
                                <HelpCircle className="mr-2 h-4 w-4" />
                                User Queries
                            </TabsTrigger>
                            <TabsTrigger value="order-queries" className="flex-1 flex items-center py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white" onClick={() => { setType("order-queries"), setShowChat(false) }}>
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Order Queries
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
                    <TabsContent value="user-queries" className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <h2 className="text-lg font-bold mb-4">User Queries</h2>
                            {uqLoading ? (
                                <div>Loading...</div>
                            ) : userQueries.length === 0 ? (
                                <div>No user queries yet.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {userQueries.map(q => (
                                        <li
                                            key={q._id}
                                            className={`p-4 border rounded bg-gray-50 cursor-pointer ${selectedChat && selectedChat._id === q._id ? "border-blue-500 bg-blue-50" : ""}`}
                                            onClick={() => {
                                                setSelectedChat(q);
                                                setShowChat(true);
                                            }}
                                        >
                                            <div>
                                                <span className="font-semibold">{q.userName || q.userEmail}</span>
                                                <span className="text-xs text-gray-500 ml-2">{new Date(q.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="mt-1">{q.question}</div>
                                            {q.answer && (
                                                <div className="mt-2 text-green-700">
                                                    <strong>Admin Reply:</strong> {q.answer}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="enquiry" className="flex-1 overflow-y-auto m-0 p-0">
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
                        {type === "user-queries" && selectedChat && selectedChat.userId ? (
                            <Chat
                                userId={selectedChat.userId}
                                isAdmin={true}
                                recipientName={selectedChat.userName || selectedChat.userEmail}
                            />
                        ) : type === "user-queries" && selectedChat ? (
                            // Fallback to static Q/A panel if userId is missing
                            <div className="w-full max-w-xl mx-auto bg-white rounded shadow p-6 my-4 border">
                                <div className="mb-2">
                                    <span className="font-semibold">{selectedChat.userName || selectedChat.userEmail}</span>
                                    <span className="text-xs text-gray-500 ml-2">{selectedChat.createdAt ? new Date(selectedChat.createdAt).toLocaleString() : ""}</span>
                                </div>
                                <div className="mb-4">
                                    <span className="block text-gray-800">{selectedChat.question}</span>
                                </div>
                                {selectedChat.answer ? (
                                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                                        <strong>Admin Reply:</strong> {selectedChat.answer}
                                    </div>
                                ) : (
                                    <div className="italic text-gray-400">No reply yet.</div>
                                )}
                            </div>
                        ) :(
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground/50" />
                                <h2 className="text-xl font-medium mb-2">No chat selected</h2>
                                <p>Select a conversation from the sidebar to start messaging</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground/50" />
                        <h2 className="text-xl font-medium mb-2">No chat selected</h2>
                        <p>Select a conversation from the sidebar to start messaging</p>
                    </div>
                )}
            </div>
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
    // Only show chats with valid userId and userId._id
    const filteredChats = chats.filter(chat => chat.userId && chat.userId._id);
    return (
        <div className="space-y-1 p-2">
            {filteredChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((chat) => (
                <Card
                    key={chat.userId._id}
                    onClick={() => { setSelectedChat(chat); setShowChat(true) }}
                    className={cn(
                        `flex items-center p-3 border-2 cursor-pointer hover:bg-blue-100 transition-colors`,
                        selectedChat?.userId?._id === chat.userId._id ? "border-blue-600" : "border-transparent"
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