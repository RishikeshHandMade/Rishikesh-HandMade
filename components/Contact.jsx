'use client'

import { House, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"

export default function Contact() {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const [phoneError, setPhoneError] = useState("");

    // Auto-fill form when user signs in
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || "",
                email: session.user.email || "",
                phone: session.user.phone || "",
            }));
        }
    }, [session]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length > 10) return;

            setFormData({ ...formData, phone: numericValue });

            if (numericValue.length !== 10) {
                setPhoneError("Phone number must be exactly 10 digits.");
            } else {
                setPhoneError("");
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.phone.length !== 10 || isNaN(formData.phone)) {
            setPhoneError("Phone number must be exactly 10 digits.");
            return;
        }

        try {
            const response = await fetch("/api/saveContact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    userId: session?.user?.id || null // Include user ID if available
                }),
            })
            
            const res = await response.json()
            if (!response.ok) {
                toast.error(res.message || "Something went wrong.");
                return;
            }
            
            toast.success("Form submitted successfully!", { 
                style: { borderRadius: "10px", border: "2px solid green" } 
            });
            
            // Don't reset if user is signed in (keep their info)
            setFormData(prev => ({
                ...prev,
                subject: "",
                message: "",
            }))
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong. Please try again later.", {
                style: { borderRadius: "10px", border: "2px solid red" },
            });
        }
    };

    return (
        <div className="min-h-screen bg-white py-20 text-blue-600">
            <Card className="overflow-hidden max-w-7xl mx-auto my-12">
                <div className="h-[400px] w-full">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.2813227450333!2d78.28852027605755!3d30.114762515234705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39093df50896eea5%3A0xe0ce04ef663b6dd1!2sYatra%20Zone!5e0!3m2!1sen!2sin!4v1740052921613!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </Card>

            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <h1 className="text-2xl text-black font-semibold">Happy To Assist You</h1>
                        <div className="space-y-4 font-barlow">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone className="h-5 w-5 text-blue-600" />
                                <Link href="tel:+918006000325" className="hover:text-blue-600">+91 80060000325</Link>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="h-5 w-5 text-blue-600" />
                                For Any Query:
                                <Link href="mailto:info@yatrazone.com" className="hover:text-blue-600">info@yatrazone.com</Link>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="h-5 w-5 text-blue-600" />
                                For Booking:
                                <Link href="mailto:sales@yatrazone.com" className="hover:text-blue-600">sales@yatrazone.com</Link>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <House className="h-5 w-5 text-blue-600" />
                                Office Hours:
                                <p className="text-blue-600">Mon to Sat: 09:30AM - 08:00PM</p>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <House className="h-5 w-5 text-red-600" />
                                <p className="text-red-600">Sunday / Public Holiday's Closed</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <Card className="bg-white/95 shadow-lg backdrop-blur-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-2xl">Leave a Reply</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6 font-barlow" onSubmit={handleSubmit}>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            onChange={handleChange}
                                            value={formData.name}
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            required
                                            readOnly={!!session?.user} // Make read-only if signed in
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        onChange={handleChange}
                                        value={formData.email}
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        required
                                        readOnly={!!session?.user} // Make read-only if signed in
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        onChange={handleChange}
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        placeholder="9876543210"
                                        value={formData.phone}
                                        required
                                    />
                                    {phoneError && (
                                        <p className="text-sm text-red-600">{phoneError}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        onChange={handleChange}
                                        value={formData.subject}
                                        id="subject"
                                        name="subject"
                                        placeholder="How can we help you?"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        onChange={handleChange}
                                        value={formData.message}
                                        id="message"
                                        name="message"
                                        placeholder="Your message here..."
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}