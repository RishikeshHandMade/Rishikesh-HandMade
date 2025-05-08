"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { statesIndia } from "@/lib/IndiaStates"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import Loading from "@/app/loading"

export default function ProfileForm() {
    const form = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            dateOfBirth: null
        },
    })

    const { data: session } = useSession()

    useEffect(() => {
        if (session?.user?.email) {
            form.setValue("email", session.user.email);
        }
    }, [session?.user?.email, form]);

    useEffect(() => {
        if (!session?.user?.email) return;

        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/getUserById/${session.user.id}`);

                const data = await response.json();
                if (response.ok) {
                    form.reset({
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        email: data.email || "",
                        city: data.city || "",
                        state: data.state || "",
                        postalCode: data.postalCode || "",
                        country: data.country === "India" ? "India" : "",
                        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                    });
                } else {
                    toast.error(data.message, {
                        style: { borderRadius: "10px", border: "2px solid red" },
                    });
                }
            } catch (error) {
                toast.error(error.message, {
                    style: { borderRadius: "10px", border: "2px solid red" },
                });
            }
        };

        fetchUserData();
    }, [session?.user?.email]);

    async function onSubmit(data) {
        data.name = `${data.firstName} ${data.lastName}`

        try {
            const response = await fetch("/api/updateUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const res = await response.json()

            if (!response.ok) {
                toast.error(res.message, {
                    style: { borderRadius: "10px", border: "2px solid red" },
                })
            } else {
                form.reset(data);
                toast.success("Profile updated successfully!", {
                    style: { borderRadius: "10px", border: "2px solid green" },
                })
            }
        } catch (error) {
            toast.error(error.message, {
                style: { borderRadius: "10px", border: "2px solid red" },
            })
        }
    }

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

    if (!session) {
        return (
            <div className="min-h-screen max-w-7xl mx-auto py-12 px-4">
                <Loading />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-52 px-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-barlow">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal information here.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="john@example.com"
                                                disabled
                                                type="email"
                                                value={session?.user?.email ?? ""}
                                                readOnly
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input maxLength={10} placeholder="+91 1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => {
                                    const [selectedYear, setSelectedYear] = useState(field.value ? field.value.getFullYear() : currentYear);
                                    const [selectedMonth, setSelectedMonth] = useState(new Date(selectedYear, 0, 1));

                                    return (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-4" align="start">
                                                    {/* Year Selector */}
                                                    <Select
                                                        value={selectedYear.toString()}
                                                        onValueChange={(year) => {
                                                            const newYear = Number(year);
                                                            setSelectedYear(newYear);
                                                            setSelectedMonth(new Date(newYear, 0, 1));
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full mb-2">
                                                            <SelectValue placeholder="Select Year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {years.map((year) => (
                                                                <SelectItem key={year} value={year.toString()}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    {/* Calendar */}
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                        month={selectedMonth}
                                                        onMonthChange={setSelectedMonth}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Address Information</CardTitle>
                            <CardDescription>Update your address details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a State" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {statesIndia.sort().map((state, index) => (
                                                        <SelectItem key={index} value={state}>{state}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="12345" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a Country" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="India">India</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="ml-auto bg-blue-600 hover:bg-blue-700" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    )
}

