"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Check, CheckCheck, Pin, Paperclip, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { UploadButton } from "@/utils/uploadthing"
import Image from "next/image"
import { deleteFileFromUploadthing } from "@/utils/Utapi"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"

export default function Chat({
    className,
    type,
    userid,
    userId,
    bookingId,
    packageId,
    isAdmin = false,
    recipientName = "YatraZone",
}) {
    const { data: session } = useSession()
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [darkMode, setDarkMode] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [zoomImage, setZoomImage] = useState(null)
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [enquiryDetails, setEnquiryDetails] = useState(null)
    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)
    const pathname = usePathname()

    const [adminName, setAdminName] = useState(null);

    useEffect(() => {
        const markAsRead = async () => {
            try {
                await fetch('/api/chat/mark-as-read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type,
                        bookingId,
                        userId: isAdmin ? userid : userId,
                        isAdmin
                    })
                });
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        };

        markAsRead();

        // Also mark as read when new messages arrive
        if (messages.length > 0) {
            markAsRead();
        }
    }, [type, bookingId, messages.length, isAdmin, userid, userId]);


    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/getMessages?type=${type}&bookingId=${bookingId}`)
            const data = await res.json()

            if (data.messages && Array.isArray(data.messages)) {
                setMessages((prev) => (JSON.stringify(prev) !== JSON.stringify(data.messages) ? data.messages : prev))

                setAdminName(null);

                // Find the most recent admin message
                const adminMsg = [...data.messages].reverse().find(msg => msg.adminName);
                if (adminMsg?.adminName) {
                    setAdminName(adminMsg.adminName);
                }

            } else {
                setMessages([])
                setAdminName(null); // Reset when no messages
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
            setAdminName(null); // Reset on error
        }
    }, [type, bookingId])

    const fetchEnquiryDetails = async () => {
        try {
            const res = await fetch(`/api/getEnquiryById/${userId === 'admin' ? userid : userId}`)
            const data = await res.json()
            setEnquiryDetails(data.filter((enquiry) => enquiry.id === bookingId)[0])
        } catch (error) {
            console.error("Error fetching enquiry details:", error)
        }
    }

    const fetchBookingDetails = async () => {
        try {
            const res = await fetch(`/api/getBookingById/${bookingId}`);
            const data = await res.json();
            setBookingDetails(data.order);
        } catch (error) {
            console.error("Error fetching booking details:", error);
        }
    };

    // And update your useEffect to call it when type is "booking"
    useEffect(() => {
        fetchMessages();
        if (type === "enquiry") {
            fetchEnquiryDetails();
        } else if (type === "booking") {
            fetchBookingDetails();
        }
        const interval = setInterval(fetchMessages, 3000);
        return () => {clearInterval(interval);  setAdminName(null); }
    }, [fetchMessages]);

    const handleUpload = () => {
        document.querySelector("input[type='file']")?.click()
    }

    const handleInputChange = (e) => {
        setMessage(e.target.value)
    }

    const sendMessage = async () => {
        if (!message.trim() && attachments.length === 0) return;

        const adminNameToSet = isAdmin ? (session.user.name || session.user.email) : null;

        const newMessage = {
            sender: userId,
            ...(isAdmin && {
                adminName: adminNameToSet
            }),
            text: message,
            type,
            bookingId,
            userId: userId,
            status: "sent",
            createdAt: new Date().toISOString(),
            images: attachments,
        };

        // Optimistically update UI
        setMessages((prev) => [...prev, newMessage]);
        if (isAdmin) {
            setAdminName(adminNameToSet);
        }
        setMessage("");
        setAttachments([]);

        try {
            const res = await fetch(`/api/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMessage),
            });

            if (res.ok) {
                const data = await res.json();

                // Update message status to delivered
                setTimeout(() => {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.createdAt === newMessage.createdAt ?
                                { ...msg, status: "delivered" } : msg
                        ),
                    );

                    // Simulate read status after a delay if it's the recipient
                    setTimeout(() => {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.createdAt === newMessage.createdAt ?
                                    { ...msg, status: "read" } : msg
                            ),
                        );
                    }, 2000);
                }, 1000);

                // Optionally update local unread count if needed
                // You might want to refresh the chat data here
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Rollback optimistic update if needed
            setMessages((prev) => prev.filter(msg => msg.createdAt !== newMessage.createdAt));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "sent":
                return <Check className="h-3 w-3 text-gray-400" />
            case "delivered":
                return <CheckCheck className="h-3 w-3 text-gray-400" />
            case "read":
                return <CheckCheck className="h-3 w-3 text-blue-500" />
            default:
                return null
        }
    }

    const removeAttachment = async (key) => {
        await deleteFileFromUploadthing(key)
        setAttachments(attachments.filter((file) => file.key !== key))
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format number helper (for currency)
    const formatNumber = (num) => {
        if (!num) return "0";
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const HelicopterDetailsSection = ({ heliFormData }) => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Helicopter Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-gray-500">Number of Adults</p>
                    <p className="font-medium">{heliFormData.numAdults || "0"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Number of Children</p>
                    <p className="font-medium">{heliFormData.numChildren || "0"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Number of Infants</p>
                    <p className="font-medium">{heliFormData.numInfants || "0"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-medium">{heliFormData.pickupLocation || "Not provided"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Dropoff Location</p>
                    <p className="font-medium">{heliFormData.dropoffLocation || "Not provided"}</p>
                </div>
            </div>

            {heliFormData.medicalRequirements && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500">Medical Requirements</p>
                    <p className="font-medium">{heliFormData.medicalRequirements}</p>
                </div>
            )}

            {heliFormData.specialRequirements && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500">Special Requirements</p>
                    <p className="font-medium">{heliFormData.specialRequirements}</p>
                </div>
            )}

            <PassengerList
                title="Adult Passengers"
                passengers={heliFormData.adults}
            />
            <PassengerList
                title="Child Passengers"
                passengers={heliFormData.children}
            />
            <PassengerList
                title="Infant Passengers"
                passengers={heliFormData.infants}
            />
        </div>
    );

    const PassengerList = ({ title, passengers = [] }) => (
        passengers.length > 0 && (
            <div className="mt-6">
                <h4 className="font-semibold mb-2">{title}</h4>
                <div className="space-y-4">
                    {passengers.map((passenger, index) => (
                        <PassengerCard key={index} passenger={passenger} />
                    ))}
                </div>
            </div>
        )
    );

    const PassengerCard = ({ passenger }) => (
        <div className="border p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{passenger.fullName}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{passenger.age}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Weight (kg)</p>
                    <p className="font-medium">{passenger.weight}</p>
                </div>
            </div>
            {passenger.idProof?.url && (
                <div className="mt-3">
                    <p className="text-sm text-gray-500">ID Proof</p>
                    <div className="relative w-32 h-20 mt-1">
                        <Image
                            src={passenger.idProof.url}
                            alt="ID Proof"
                            fill
                            className="object-cover rounded-md cursor-pointer"
                            onClick={() => setZoomImage(passenger.idProof.url)}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Card
            className={cn(
                "flex flex-col md:h-[75vh] font-barlow w-full max-w-6xl md:my-0 border-2 border-blue-600 shadow-lg",
                darkMode ? "dark bg-gray-900 text-white" : "bg-white",
                className,
            )}
        >
            <CardHeader className="lg:flex-row p-4 border-b flex justify-between items-center lg:items-start">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={`/apple-touch-icon.png`} alt={recipientName} />
                        <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-medium">{recipientName}</h3>
                        {adminName && (
                            <p className="text-xs text-muted-foreground">
                                Handled by: <span className="font-semibold">{adminName}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end space-x-2">
                    {type === "booking" && (
                        <div className="flex flex-col items-end">
                            <p>Booking ID: <span className="font-semibold">{bookingId}</span></p>
                            <button type="button" onClick={() => setShowForm(true)} className="underline ">Click here to view Enquiry Form</button>
                        </div>
                    )}
                    {type === "enquiry" && (
                        <div className="flex flex-col items-end">
                            <p>Enquiry ID: <span className="font-semibold">{bookingId}</span></p>
                            <button type="button" onClick={() => setShowForm(true)} className="underline ">Click here to view Enquiry Form</button>
                        </div>
                    )}
                    {
                        isAdmin && (
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-muted-foreground">View Package: <Link target="_blank" href={`/package/${packageId}`} className="underline text-blue-600">Click here to view</Link></p>
                            </div>
                        )
                    }
                </div>
            </CardHeader>

            <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}

                {Array.isArray(messages) &&
                    messages.map((msg, index) => {
                        const isCurrentUser = msg.sender === userId
                        const showAvatar = index === 0 || messages[index - 1]?.sender !== msg.sender

                        return (
                            <div
                                key={msg.createdAt}
                                className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}
                            >
                                {!isCurrentUser && showAvatar && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`${pathname === '/admin/chat' ? '/user.png' : '/apple-touch-icon.png'}`} alt={recipientName} />
                                        <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
                                    </Avatar>
                                )}

                                {!isCurrentUser && !showAvatar && <div className="w-8" />}

                                <div
                                    className={cn(
                                        "max-w-[75%] px-4 py-2 rounded-2xl",
                                        isCurrentUser ? "bg-blue-600 text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
                                    )}
                                >
                                    {/* Display Sent Images */}
                                    {msg.image?.length > 0 && (
                                        <div className="mb-2 grid grid-cols-2 gap-2">
                                            {msg.image.map((img) => (
                                                <div key={img.key} className="relative w-20 md:w-32 h-20 md:h-32">
                                                    <Image onClick={() => setZoomImage(img.url)} src={img.url} alt="Sent Image" fill className="cursor-pointer rounded-lg object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Display Text Message */}
                                    {msg.text && <p className="break-words">{msg.text}</p>}


                                    <div className={cn("flex text-xs mt-1 gap-1", isCurrentUser ? "justify-end" : "justify-start")}>
                                        <span className={isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                        {isCurrentUser && getStatusIcon(msg.status)}
                                    </div>
                                </div>

                                {isCurrentUser && showAvatar && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`${pathname === '/admin/chat' ? '/apple-touch-icon.png' : '/user.png'}`} alt="You" />
                                        <AvatarFallback>{getInitials("You")}</AvatarFallback>
                                    </Avatar>
                                )}

                                {isCurrentUser && !showAvatar && <div className="w-8" />}
                            </div>
                        )
                    })}

                <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="p-3 border-t flex relative space-x-2">
                {/* Attachments preview with loading state */}
                <div className="absolute -top-24 left-10">
                    <div className="flex space-x-2 overflow-x-auto">
                        {attachments.map((file) => (
                            <div key={file.key} className="relative w-24 h-24">
                                {file.isUploading ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                    </div>
                                ) : (
                                    <>
                                        <Image
                                            src={file.url}
                                            alt="Preview"
                                            fill
                                            className="rounded-md w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeAttachment(file.key)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* File upload button with loading state */}
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    size="icon"
                    aria-label="Attach file"
                    onClick={handleUpload}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Paperclip className="h-5 w-5" />
                    )}
                </Button>

                {/* UploadButton with enhanced handlers */}
                <UploadButton
                    multiple
                    endpoint="chatAttachments"
                    onUploadBegin={() => {
                        setIsUploading(true);
                    }}
                    onClientUploadComplete={(res) => {
                        const newFiles = res.map(file => ({
                            url: file.ufsUrl,
                            key: file.key,
                            isUploading: false
                        }));
                        setAttachments([...attachments, ...newFiles]);
                        setIsUploading(false);
                    }}
                    onUploadError={(error) => {
                        console.error("Upload error:", error);
                        setIsUploading(false);
                        toast.error("File upload failed");
                    }}
                    className="hidden"
                />

                <Input
                    value={message}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isUploading}
                />

                <Button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={(!message.trim() && attachments.length === 0) || isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </Button>
            </CardFooter>
            {zoomImage && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="relative w-4/5 h-4/5">
                        <Image src={zoomImage} alt="Zoomed Image" fill className="object-cover rounded-lg z-[99999]" />
                        <button
                            onClick={() => setZoomImage(false)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs z-[99999]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            {showForm && enquiryDetails && (
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-barlow">
                        <DialogHeader>
                            <DialogTitle>Enquiry Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Personal Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium">{enquiryDetails.name || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{enquiryDetails.email || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="font-medium">{enquiryDetails.phone || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Number of Adults</p>
                                        <p className="font-medium">{enquiryDetails.adults || "1"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Number of Children</p>
                                        <p className="font-medium">{enquiryDetails.children || "0"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Address Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{enquiryDetails.address || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Apartment/Suite</p>
                                        <p className="font-medium">{enquiryDetails.aptName || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">City</p>
                                        <p className="font-medium">{enquiryDetails.city || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">State</p>
                                        <p className="font-medium">{enquiryDetails.state || "Not provided"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Pincode</p>
                                        <p className="font-medium">{enquiryDetails.pincode || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Travel Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Travel Date</p>
                                        <p className="font-medium">{formatDate(enquiryDetails.travelDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Pickup Location</p>
                                        <p className="font-medium">{enquiryDetails.pickupLocation || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            {enquiryDetails.extraInfo && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Additional Information</h3>
                                    <p className="font-medium">{enquiryDetails.extraInfo}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {showForm && bookingDetails && (
                <Dialog open={showForm} onOpenChange={setShowForm} className="!z-20">
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-barlow">
                        <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                                {bookingDetails.customOrder ? "Custom Package" : "Standard Package"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 p-4">
                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Personal Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium">
                                            {bookingDetails.name || bookingDetails.formData?.name || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">
                                            {bookingDetails.email || bookingDetails.formData?.email || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="font-medium">
                                            {bookingDetails.phone || bookingDetails.formData?.phone || "Not provided"}
                                        </p>
                                    </div>
                                    {!bookingDetails.customOrder && (
                                        <div>
                                            <p className="text-sm text-gray-500">Total Persons</p>
                                            <p className="font-medium">{bookingDetails.totalPerson || "1"}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Address Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Address Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">
                                            {bookingDetails.address || bookingDetails.formData?.address || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Additional Address Info</p>
                                        <p className="font-medium">
                                            {bookingDetails.extraAddressInfo || bookingDetails.formData?.extraAddressInfo || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">City</p>
                                        <p className="font-medium">
                                            {bookingDetails.city || bookingDetails.formData?.city || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">State</p>
                                        <p className="font-medium">
                                            {bookingDetails.state || bookingDetails.formData?.state || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Pincode</p>
                                        <p className="font-medium">
                                            {bookingDetails.pincode || bookingDetails.formData?.pincode || "Not provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Travel Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Travel Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Travel Date</p>
                                        <p className="font-medium">
                                            {formatDate(bookingDetails.travelDate || bookingDetails.bookingDetails?.travelDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Departure Location</p>
                                        <p className="font-medium">
                                            {bookingDetails.departureLocation || bookingDetails.bookingDetails?.departureLocation || "Not provided"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Status</p>
                                        <p className="font-medium capitalize">
                                            {bookingDetails.status?.toLowerCase() || "pending"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Method</p>
                                        <p className="font-medium">
                                            {bookingDetails.paymentMethod || "Not specified"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="font-medium">
                                            ₹{formatNumber(bookingDetails.totalAmount) || "0"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Advance Amount</p>
                                        <p className="font-medium">
                                            ₹{formatNumber(bookingDetails.amount) || "0"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            {(bookingDetails.instructions || bookingDetails.formData?.instructions) && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Special Instructions</h3>
                                    <p className="font-medium">
                                        {bookingDetails.instructions || bookingDetails.formData?.instructions}
                                    </p>
                                </div>
                            )}

                            {/* Custom Package Details (for CustomOrder) */}
                            {bookingDetails.customPackageForm && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Custom Package Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500">Package Plan</p>
                                            <p className="font-medium">{bookingDetails.customPackageForm.packagePlan || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Meal Plan</p>
                                            <p className="font-medium">{bookingDetails.customPackageForm.mealPlan || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Number of Adults</p>
                                            <p className="font-medium">{bookingDetails.customPackageForm.numAdults || "0"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Number of Children</p>
                                            <p className="font-medium">{bookingDetails.customPackageForm.numChildren || "0"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Number of Mattress</p>
                                            <p className="font-medium">{bookingDetails.customPackageForm.numMattress || "0"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Vehicle Type</p>
                                            <p className="font-medium">{bookingDetails.customPackageForm.vehicleType || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Helicopter Booking Details */}
                            {bookingDetails.heliFormData && (
                                <HelicopterDetailsSection heliFormData={bookingDetails.heliFormData} />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    )
}