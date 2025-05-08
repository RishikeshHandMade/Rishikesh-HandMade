"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import PackageSummary from "./PackageSummary"
import ItinerarySchedule from "./ItinerarySchedule"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { statesIndia } from "@/lib/IndiaStates"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"
import { UploadButton } from "@/utils/uploadthing"
import { deleteFileFromUploadthing } from "@/utils/Utapi"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"

// Sample data for accommodation plans
const accommodationPlans = [
    { id: "ep", name: "EP (Room Only)", priceMultiplier: 1 },
    { id: "cp", name: "CP (Room With Include Breakfast)", priceMultiplier: 1.3 },
    { id: "map", name: "MAP (Room With Include Breakfast + Lunch/Dinner)", priceMultiplier: 1.8 },
    { id: "ap", name: "AP (Room With Include Breakfast + Lunch + Dinner)", priceMultiplier: 1.8 },
]

export default function TourPackageCalculator({ packages, plans }) {
    const { data: session } = useSession()
    const router = useRouter();

    const [date, setDate] = useState(() => {
        return new Date()
    })
    const [user, setUser] = useState({})
    const [step, setStep] = useState(() => {
        return "selectPackage"
    })

    const [packagePlan, setPackagePlan] = useState(() => {
        return ""
    })

    const [accommodationPlan, setAccommodationPlan] = useState(() => {
        return "ep"
    })

    const [adults, setAdults] = useState(() => {
        return "0"
    })
    const [adultPrice, setAdultPrice] = useState(0)
    const [childrenPrice, setChildrenPrice] = useState(0)
    const [mattressTotal, setMattressTotal] = useState(0)
    const [vehicleType, setVehicleType] = useState("")
    const [vehiclePrice, setVehiclePrice] = useState(0)
    const [children, setChildren] = useState(() => {
        return "0"
    })
    const [extraMattress, setExtraMattress] = useState(() => {
        return "0"
    })
    const [pickupRequired, setPickupRequired] = useState(() => {
        return ""
    })
    const [pickupValue, setPickupValue] = useState("")
    const [dropOffRequired, setDropOffRequired] = useState(() => {
        return ""
    })
    const [dropOffValue, setDropOffValue] = useState("")
    const [totalPrice, setTotalPrice] = useState(0)
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [disabled, setDisabled] = useState(true);

    const [pickupDetails, setPickupDetails] = useState(() => {
        return {
            city: "",
            vehicleType: "",
            vehiclePrice: 0,
        }
    })

    const [dropoffDetails, setDropoffDetails] = useState(() => {
        return {
            city: "",
            vehicleType: "",
            vehiclePrice: 0,
        }
    })

    const [formData, setFormData] = useState(() => {
        return {
            fullName: "",
            mobile: "",
            email: "",
            address: "",
            apartment: "",
            state: "",
            city: "",
            pincode: "",
            instructions: "",
        }
    })
    const [heliFormData, setHeliFormData] = useState(() => {
        return {
            numAdults: 0,
            numChildren: 0,
            numInfants: 0,
            adults: [{
                fullname: "",
                age: 0,
                weight: 0,
                idProof: { url: "", key: "" }
            }],
            children: [{
                fullname: "",
                age: 0,
                weight: 0,
                idProof: { url: "", key: "" }
            }],
            infants: [{
                fullname: "",
                age: 0,
                weight: 0,
                idProof: { url: "", key: "" }
            }],
            medicalRequirements: "",
            specialRequirements: "",
        }
    })
    const [bookingDetails, setBookingDetails] = useState(() => {
        return {
            travelDate: "",
            departureLocation: "",
        }
    })

    useEffect(() => {
        const fetchUser = async () => {
            if (session && session.user.isAdmin === false) {
                try {
                    const res = await fetch(`/api/getUserById/${session.user.id}`);
                    const data = await res.json();
                    setUser(data);

                    // Auto-fill the form with user data
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        fullName: data.name || '',
                        email: data.email || '',
                        mobile: data.phone || '',
                        address: data.address || '',
                        city: data.city || '',
                        state: data.state || '',
                        pincode: data.postalCode || '',
                    }));
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
        };

        fetchUser();
    }, [session]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isFormDirty) {
                event.preventDefault();
                event.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isFormDirty]);

    // Calculate total price whenever selections change
    useEffect(() => {
        calculateTotalPrice()
    }, [accommodationPlan, adults, children, extraMattress, pickupRequired, dropOffRequired])

    useEffect(() => {
        const totalAdults = Number.parseInt(adults) || 0;
        const totalChildren = Number.parseInt(children) || 0;

        const roomsRequired = Math.ceil(totalAdults / 2);
        const childrenPerRoom = 1;
        const totalChildrenCapacity = roomsRequired * childrenPerRoom;

        // Set to minimum required mattresses (0 if children ≤ capacity)
        const extraMattressRequired = Math.max(0, totalChildren - totalChildrenCapacity);
        setExtraMattress(extraMattressRequired.toString());
    }, [adults, children]);
    const calculateTotalPrice = () => {
        // 1. Find selected package and verify data
        const selectedPlan = plans.find((plan) => plan.planName === packagePlan);
        if (!selectedPlan) return;

        if (adults === "0") return;

        // 2. Extract tour details
        const tourDuration = packages.basicDetails?.duration || 1;
        const itineraryCities = packages.createPlanType.map((city) => city.city);
        if (itineraryCities.length !== tourDuration) return;

        // 3. Initialize totals
        let totalAccommodation = 0;
        let adultPrices = [];
        let childPrices = [];
        let mattress = [];

        itineraryCities.forEach((cityName) => {
            const cityData = selectedPlan.cities.find((city) => city.city === cityName);
            if (!cityData) return;

            // 4. Get pricing plans
            const adultPricing = cityData.adultPlan[accommodationPlan];
            const childPricing = cityData.childPlan[accommodationPlan];
            if (!adultPricing || !childPricing) return;

            const numExtraMattress = Number(extraMattress);
            const numAdults = Number(adults);
            const numChildren = Number(children);

            // 5. Calculate price per adult and child
            const adultPricePerPerson = adultPricing.wem.price * (1 + adultPricing.wem.margin / 100);
            const mattressArr = adultPricing.em.price * (1 + adultPricing.em.margin / 100);
            const childPricePerPerson = childPricing.wem.price * (1 + childPricing.wem.margin / 100);

            adultPrices.push(adultPricePerPerson);
            mattress.push(Math.round(mattressArr));
            childPrices.push(childPricePerPerson * numChildren);

            // 6. Calculate number of rooms needed
            const roomsNeeded = Math.ceil(numAdults / 2);

            // 8. Calculate accommodation cost for this city
            const cityCost =
                roomsNeeded * adultPricePerPerson +
                (numChildren > 0 ? numChildren * childPricePerPerson : 0) +
                (numExtraMattress > 0 ? Math.round(mattressArr * extraMattress) : 0);

            totalAccommodation += cityCost;
        });

        // 9. Store the calculated prices in state
        setAdultPrice(adultPrices.length > 0 ? adultPrices.reduce((a, b) => a + b) * (adults / 2) : 0);
        setChildrenPrice(childPrices.length > 0 ? childPrices.reduce((a, b) => a + b) : 0);
        setMattressTotal(mattress.length > 0 ? mattress.reduce((a, b) => a + b) * extraMattress : 0);

        // 10. Determine vehicle tier based on the number of people
        const totalPersons = Number(adults) + Number(children);
        let vehicleTier;

        if (totalPersons >= 8) {
            vehicleTier = 3;
            setVehicleType(packages.vehiclePlan.vehicleName3);
        } else if (totalPersons >= 5) {
            vehicleTier = 2;
            setVehicleType(packages.vehiclePlan.vehicleName2);
        } else {
            vehicleTier = 1;
            setVehicleType(packages.vehiclePlan.vehicleName1);
        }

        // Set vehicle charge dynamically based on vehicle tier
        const vehicleCharge = Number(packages.vehiclePlan[`vehiclePrice${vehicleTier}`]);
        setVehiclePrice(vehicleCharge);

        let transportCost = 0;

        // Handle Pickup (Calculate based on vehicle tier)
        if (pickupRequired === "Yes") {
            const pickupPrice = Number(packages.vehiclePlan.pickup[`price${vehicleTier}`]);
            transportCost += pickupPrice;

            // Only update pickup details if they haven't been set yet
            setPickupDetails(prev => ({
                city: prev.city || packages.vehiclePlan.pickup.city,
                vehicleType: prev.vehicleType || packages.vehiclePlan.pickup.vehicleType[`${vehicleTier}`],
                vehiclePrice: pickupPrice,
            }));
        } else {
            // Clear pickup details if pickup is not required
            setPickupDetails({
                city: "",
                vehicleType: "",
                vehiclePrice: 0
            });
        }

        // Handle Drop-off (Calculate based on vehicle tier)
        if (dropOffRequired === "Yes") {
            const dropPrice = Number(packages.vehiclePlan.drop[`price${vehicleTier}`]);
            transportCost += dropPrice;

            // Only update dropoff details if they haven't been set yet
            setDropoffDetails(prev => ({
                city: prev.city || packages.vehiclePlan.drop.city,
                vehicleType: prev.vehicleType || packages.vehiclePlan.pickup.vehicleType[`${vehicleTier}`],
                vehiclePrice: dropPrice,
            }));
        } else {
            // Clear dropoff details if dropoff is not required
            setDropoffDetails({
                city: "",
                vehicleType: "",
                vehiclePrice: 0
            });
        }

        // 11. Calculate total price
        const totalPrice = totalAccommodation + vehicleCharge + transportCost;
        setTotalPrice(Math.round(totalPrice));
    };

    const getSelectedAccommodationPlan = () => {
        return accommodationPlans.find((plan) => plan.id === accommodationPlan)
    }

    // Generate children options based on the number of adults
    const generateChildrenOptions = () => {
        const maxChildren = Number.parseInt(adults) || 0;
        return Array.from({ length: maxChildren + 1 }, (_, i) => i);
    };
    const generateExtraMattressOptions = () => {
        const totalAdults = Number.parseInt(adults) || 0;
        const totalChildren = Number.parseInt(children) || 0;

        // Calculate the number of rooms required
        const roomsRequired = Math.ceil(totalAdults / 2);

        // Each room can support 2 adults + 1 child without an extra mattress
        const childrenPerRoom = 1;
        const totalChildrenCapacity = roomsRequired * childrenPerRoom;

        // Minimum extra mattresses required (0 if children ≤ capacity)
        const minExtraMattress = Math.max(0, totalChildren - totalChildrenCapacity);

        // If children are exactly at capacity, allow 0 or 1 mattress (50-50 choice)
        if (totalChildren === totalChildrenCapacity) {
            return [0, 1];
        }
        // If children exceed capacity, allow minExtraMattress or minExtraMattress + 1 (50-50 choice)
        else if (totalChildren > totalChildrenCapacity) {
            return [minExtraMattress, minExtraMattress + 1];
        }
        // If children are below capacity, only allow 0
        else {
            return [0];
        }
    };

    const handlePickupChange = (value) => {
        if (!value) return;
        const [city, vehiclePickupType] = value.split(":");

        let vehicleTier = 1;
        if (vehiclePickupType === packages.vehiclePlan.vehicleName2) {
            vehicleTier = 2;
        } else if (vehiclePickupType === packages.vehiclePlan.vehicleName3) {
            vehicleTier = 3;
        }

        const vehiclePrice = Number(packages.vehiclePlan.pickup[`price${vehicleTier}`]) || 0;

        setPickupDetails({
            city,
            vehicleType: vehiclePickupType,
            vehiclePrice
        });
        setPickupValue(value);
    };

    const handleDropoffChange = (value) => {
        if (!value) return;
        const [city, vehicleDropType] = value.split(":");

        let vehicleTier = 1;
        if (vehicleDropType === packages.vehiclePlan.vehicleName2) {
            vehicleTier = 2;
        } else if (vehicleDropType === packages.vehiclePlan.vehicleName3) {
            vehicleTier = 3;
        }

        const vehiclePrice = Number(packages.vehiclePlan.drop[`price${vehicleTier}`]) || 0;

        setDropoffDetails({
            city,
            vehicleType: vehicleDropType,
            vehiclePrice
        });
        setDropOffValue(value);
    };

    const handleInputChange = (e, field, index = null, category = null) => {
        const { value } = e.target;
        const numericValue = field === 'age' || field === 'weight' ? parseInt(value) || 0 : value;

        if (field === 'numAdults' || field === 'numChildren' || field === 'numInfants') {
            // Handle changes to the count fields
            const count = parseInt(value) || 0;
            const group = field.replace('num', '').toLowerCase(); // 'numAdults' → 'adults'

            setHeliFormData(prev => {
                const currentArray = prev[group] || [];
                let newArray = [...currentArray];

                if (count > currentArray.length) {
                    // Add new empty objects
                    const itemsToAdd = count - currentArray.length;
                    for (let i = 0; i < itemsToAdd; i++) {
                        newArray.push({
                            fullname: "",
                            age: 0,
                            weight: 0,
                            idProof: { url: "", key: "" }
                        });
                    }
                } else if (count < currentArray.length) {
                    // Remove extra objects
                    newArray = newArray.slice(0, count);
                }

                return {
                    ...prev,
                    [field]: count,
                    [group]: newArray
                };
            });
        }
        else if (category && index !== null) {
            // Handle nested fields (adults, children, infants)
            setHeliFormData(prev => {
                const updatedCategory = [...prev[category]];
                updatedCategory[index] = {
                    ...updatedCategory[index],
                    [field]: numericValue
                };
                return { ...prev, [category]: updatedCategory };
            });
        } else {
            // Handle top-level fields
            setHeliFormData(prev => ({ ...prev, [field]: numericValue }));
        }
    };

    const handleFileUpload = (res, index, category) => {
        if (res && res[0]?.ufsUrl) {
            const updatedCategory = [...heliFormData[category]];
            updatedCategory[index] = { ...updatedCategory[index], idProof: { url: res[0].ufsUrl, key: res[0].key } };
            setHeliFormData({ ...heliFormData, [category]: updatedCategory });
        }
    };

    const handleDeleteImage = async (index, category) => {
        const fileKey = heliFormData[category][index].idProof.key;
        if (fileKey) {
            try {
                // Delete the file from UploadThing
                await deleteFileFromUploadthing(fileKey);

                // Remove the file from the state
                const updatedCategory = [...heliFormData[category]];
                updatedCategory[index] = { ...updatedCategory[index], idProof: { url: "", key: "" } };
                setHeliFormData({ ...heliFormData, [category]: updatedCategory });

            } catch (error) {
                console.error("Error deleting file:", error);
            }
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault()

        if (!formData.fullName || !formData.email || !formData.mobile || !formData.address || !formData.city || !formData.state || !formData.pincode) {
            return toast.error("Please fill all the required fields", {
                style: { borderRadius: "10px", border: "2px solid red" },
            })
        }

        if (packages?.basicDetails?.heliBooking === "Yes") {
            if (heliFormData.numAdults > 0 && heliFormData.adults.some((adult) => !adult.fullname || !adult.age || !adult.weight || !adult.idProof.url || !adult.idProof.key)) {
                return toast.error("Please fill all the required fields for Adults", {
                    style: { borderRadius: "10px", border: "2px solid red" },
                })
            }
            if (heliFormData.numChildren > 0 && heliFormData.children.some((child) => !child.fullname || !child.age || !child.weight || !child.idProof.url || !child.idProof.key)) {
                return toast.error("Please fill all the required fields for Children", {
                    style: { borderRadius: "10px", border: "2px solid red" },
                })
            }
            if (heliFormData.numInfants > 0 && heliFormData.infants.some((infant) => !infant.fullname || !infant.age || !infant.weight || !infant.idProof.url || !infant.idProof.key)) {
                return toast.error("Please fill all the required fields for Infants", {
                    style: { borderRadius: "10px", border: "2px solid red" },
                })
            }
        }
        setStep("booking")
    }

    const advancePay = Math.round(totalPrice * 0.25)

    const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num)

    const handlePayment = async () => {
        if (!formData.fullName || !formData.email || !formData.mobile || !formData.address || !formData.city || !formData.state || !formData.pincode) {
            return toast.error("Please fill all the required fields", {
                style: { borderRadius: "10px", border: "2px solid red" },
            })
        }
        if (packages?.basicDetails?.heliBooking === "Yes") {
            if (heliFormData.numAdults > 0 && heliFormData.adults.some((adult) => !adult.fullname || !adult.age || !adult.weight || !adult.idProof.url || !adult.idProof.key)) {
                return toast.error("Please fill all the required fields for Adults", {
                    style: { borderRadius: "10px", border: "2px solid red" },
                })
            }
            if (heliFormData.numChildren > 0 && heliFormData.children.some((child) => !child.fullname || !child.age || !child.weight || !child.idProof.url || !child.idProof.key)) {
                return toast.error("Please fill all the required fields for Children", {
                    style: { borderRadius: "10px", border: "2px solid red" },
                })
            }
            if (heliFormData.numInfants > 0 && heliFormData.infants.some((infant) => !infant.fullname || !infant.age || !infant.weight || !infant.idProof.url || !infant.idProof.key)) {
                return toast.error("Please fill all the required fields for Infants", {
                    style: { borderRadius: "10px", border: "2px solid red" },
                })
            }
        }
        try {
            const orderResponse = await axios.post("/api/razorpay-package-calculator", {
                userId: user._id,
                packageId: packages._id,
                totalAmount: totalPrice,
                amount: advancePay,
                currency: "INR",
                receipt: `order_${Date.now()}`,
                formData: {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.mobile,
                    address: formData.address,
                    extraAddressInfo: formData.apartment,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    instructions: formData.instructions || '',
                },
                bookingDetails: {
                    travelDate: bookingDetails.travelDate,
                    departureLocation: bookingDetails.departureLocation,
                },
                heliFormData: {
                    adults: heliFormData.adults,
                    children: heliFormData.children,
                    infants: heliFormData.infants,
                    numAdults: parseInt(heliFormData.numAdults),
                    numChildren: parseInt(heliFormData.numChildren),
                    numInfants: parseInt(heliFormData.numInfants),
                    medicalRequirements: heliFormData.medicalRequirements,
                    specialRequirements: heliFormData.specialRequirements
                },
                customPackageForm: {
                    travelDate: date,
                    packagePlan: packagePlan,
                    mealPlan: accommodationPlan,
                    numAdults: heliFormData.numAdults,
                    numChildren: heliFormData.numChildren,
                    numMattress: heliFormData.numMattress,
                    vehicleType: vehicleType,
                    vehiclePrice: vehiclePrice,
                    totalAmount: totalPrice,
                    pickupDetails: {
                        city: pickupDetails.city,
                        vehicleType: pickupDetails.vehicleType,
                        vehiclePrice: pickupDetails.vehiclePrice,
                    },
                    dropoffDetails: {
                        city: dropoffDetails.city,
                        vehicleType: dropoffDetails.vehicleType,
                        vehiclePrice: dropoffDetails.vehiclePrice,
                    }
                }
            })

            const { id: orderId } = orderResponse.data

            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: advancePay * 100,
                    image: "/android-chrome-512x512.png",
                    currency: "INR",
                    name: "YatraZone",
                    description: "Booking Advance Payment",
                    order_id: orderId,
                    handler: async (response) => {
                        // Verify payment
                        const verificationResponse = await axios.put("/api/razorpay-package-calculator", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        })

                        if (verificationResponse.data.success) {
                            try {
                                await axios.post("/api/brevo", {
                                    to: formData.email,
                                    subject: "Booking Confirmation",
                                    htmlContent: `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Payment Successful</title>
                      <style type="text/css">
                      .header {
                              text-align: center;
                              padding: 20px 0;
                          }
                          .header img {
                              max-width: 300px;
                          }
                          @media only screen and (max-width: 600px) {
                              .container {
                                  width: 100% !important;
                              }
                              .content {
                                  padding: 20px !important;
                              }
                              .payment-details {
                                  padding: 15px !important;
                              }
                          }
                          .footer {
                              text-align: center;
                              padding: 20px;
                              font-size: 14px;
                              color: #777777;
                              border-top: 1px solid #eeeeee;
                              margin-top: 20px;
                          }
                          .footer a {
                              color: #007BFF;
                              text-decoration: none;
                          }
                      </style>
                  </head>
                  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                              <td align="center" style="padding: 20px 0;">
                                  <table class="container" role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                                      <!-- Header -->
                                      <tr>
                      <td align="center" style="padding: 30px 0; background-color: #10B981; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                          <a href="https://yatrazone.vercel.app/" class="header">
                              <img src="https://yatrazone.vercel.app/logo.png" alt="YatraZone Logo" style="max-width: 300px;">
                          </a>

                          <!-- Centered Table -->
                          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                              <tr>
                                  <td align="center">
                                      <img src="https://yatrazone.vercel.app/green-tick.gif" alt="Payment Successful Animation" style="width: 100px; height: 100px;">
                                  </td>
                              </tr>
                              <tr>
                                  <td align="center">
                                      <p style="margin: 10px 0 5px; font-size: 32px; font-weight: 600;">₹${formatNumber(advancePay)}</p>
                                      <h1 style="margin: 0; font-size: 24px;">Payment Successful</h1>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>

                                      <!-- Content -->
                                      <tr>
                                          <td class="content" style="padding: 40px 30px;">
                                              <p style="margin-top: 0; color: #333333; font-size: 16px; line-height: 1.5;">Hello, ${formData.fullName}</p>
                                              <p style="color: #333333; font-size: 16px; line-height: 1.5;">Thank you for your payment (<span style="font-weight: 700; color: #00ABE9">${packages.packageName}</span>). Your transaction has been completed successfully.</p>

                                              <div class="payment-details" style="background-color: #f8f9fa; border-radius: 4px; padding: 25px; margin: 30px 0;">
                                                  <h2 style="margin-top: 0; color: #333333; font-size: 18px;">Transaction Details</h2>

                                                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px;">
                                                      <tr>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Amount</td>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #333333;">${formatNumber(advancePay)}</td>
                                                      </tr>
                                                      <tr>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Payment ID</td>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333;">${verificationResponse.data.paymentId}</td>
                                                      </tr>
                                                      <tr>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Payment Method</td>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333; text-transform: uppercase">${verificationResponse.data.paymentMethod || 'N/A'}</td>
                                                      </tr>
                                                      <tr>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Paid On</td>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333;">${new Date().toLocaleString()}</td>
                                                      </tr>
                                                      <tr>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Email</td>
                                                          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333;">${formData.email}</td>
                                                      </tr>
                                                      <tr>
                                                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Mobile Number</td>
                                                          <td style="padding: 8px 0; text-align: right; color: #333333;">${formData.mobile}</td>
                                                      </tr>
                                                  </table>
                                              </div>

                                              <p style="color: #333333; font-size: 16px; line-height: 1.5; text-align: center;">For any order related queries please reach out to <a href="mailto:yatrazone.experts@gmail.com" style="color: #00ABE0">yatrazone.experts@gmail.com</a> or Call on <a href="tel:+918006000325" style="color: #00ABE0">+91 8006000325</a> </p>

                                              <div style="margin-top: 30px; text-align: center;">
                                                  <a href="https://yatrazone.vercel.app/profile/orders" style="display: inline-block; background-color: #10B981; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">View Your Account</a>
                                              </div>
                                          </td>
                                      </tr>
                                      <!-- Footer -->
                                      <tr>
                                          <td style="padding: 20px 30px; text-align: center; background-color: #f8f9fa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                              <div class="footer">
                              <p>If you have any questions, feel free to contact: <a href="mailto:info@yatrazone.com">info@yatrazone.com</a>.</p>
                              <p>&copy; ${new Date().getFullYear()} YatraZone. All rights reserved.</p>
                          </div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </body>
                  </html>`,
                                })
                            } catch (error) {
                                console.error("Error sending email:", error);
                            }

                            router.push(`/checkout/orderConfirmed/${response.razorpay_order_id}`);
                            toast.success("Payment successful! Check your email for details.", {
                                style: { borderRadius: "10px", border: "2px solid green" },
                            })
                        }
                    },
                    prefill: {
                        name: formData.fullName,
                        email: formData.email,
                        contact: formData.mobile,
                    },
                    theme: {
                        color: "#2563EB",
                    },
                }

                const rzp = new window.Razorpay(options)
                const handlePaymentFailed = async (response) => {
                    const { error } = response;

                    const emailMessage = `
                                          <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Payment Failed</title>
                  <style type="text/css">
                  .header {
                          text-align: center;
                          padding: 20px 0;
                      }
                      .header img {
                          max-width: 300px;
                      }
                      @media only screen and (max-width: 600px) {
                          .container {
                              width: 100% !important;
                          }
                          .content {
                              padding: 20px !important;
                          }
                          .payment-details {
                              padding: 15px !important;
                          }
                      }
                      .footer {
                          text-align: center;
                          padding: 20px;
                          font-size: 14px;
                          color: #777777;
                          border-top: 1px solid #eeeeee;
                          margin-top: 20px;
                      }
                      .footer a {
                          color: #007BFF;
                          text-decoration: none;
                      }
                  </style>
                  <script
                src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
                type="module"
              ></script>
              </head>
              <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                          <td align="center" style="padding: 20px 0;">
                              <table class="container" role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                                  <!-- Header -->
                                  <tr>
                  <td align="center" style="padding: 30px 0; background-color: #EF4444;; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                      <a href="https://yatrazone.vercel.app/" class="header">
                          <img src="https://yatrazone.vercel.app/logo.png" alt="YatraZone Logo" style="max-width: 300px;">
                      </a>

                      <!-- Centered Table -->
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                          <tr>
                              <td align="center">
                                  <img src="https://yatrazone.vercel.app/cancel.gif" alt="Payment Failed Animation" style="width: 100px; height: 100px;">
                              </td>
                          </tr>
                          <tr>
                              <td align="center">
                                  <p style="margin: 10px 0 5px; font-size: 32px; font-weight: 600;">₹${formatNumber(advancePay)}</p>
                                  <h1 style="margin: 0; font-size: 24px;">Payment Failed</h1>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
                                  <!-- Content -->
                                  <tr>
                                      <td class="content" style="padding: 40px 30px;">
                                          <p style="margin-top: 0; color: #333333; font-size: 16px; line-height: 1.5;">Hello, ${formData.fullName}</p>
                                          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
                We're sorry, but your recent payment for 
                <span style="font-weight: 700; color: #00ABE9">${packages.packageName}</span> could not be processed.
              </p>

                                           <p style="color: #333333; font-size: 16px; line-height: 1.5;">
                In case your money has been debited, it will be credited to your bank account within 5-7 business days.
              </p>
                                          <div class="payment-details" style="background-color: #f8f9fa; border-radius: 4px; padding: 25px; margin: 30px 0;">
                                              <h2 style="margin-top: 0; color: #333333; font-size: 18px;">Transaction Attempt Details</h2>

                                              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px;">
                                                  <tr>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Amount</td>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #333333;">₹${formatNumber(advancePay)}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Payment ID</td>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333;">${error.metadata.payment_id}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Payment Method</td>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333;">${error.source || 'N/A'}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Attempted On</td>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333;">${new Date().toLocaleString()}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Email</td>
                                                      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #333333;">${formData.email}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Mobile Number</td>
                                                      <td style="padding: 8px 0; text-align: right; color: #333333;">${formData.mobile}</td>
                                                  </tr>
                                              </table>
                                          </div>
                                          <p style="color: #333333; font-size: 16px; line-height: 1.5;">Common reasons for payment failure include:</p>
                                          <p>Reason: ${error.description}</p>
                                          <ul style="color: #333333; font-size: 16px; line-height: 1.5;">
                                              <li>Insufficient funds</li>
                                              <li>Incorrect card details</li>
                                              <li>Card expired</li>
                                              <li>Transaction declined by bank</li>
                                          </ul>

                                          <p style="color: #333333; font-size: 16px; line-height: 1.5; text-align: center; padding-top: 24px;">For any order related queries please reach out to <a href="mailto:yatrazone.experts@gmail.com" style="color: #00ABE0">yatrazone.experts@gmail.com</a> or Call on <a href="tel:+918006000325" style="color: #00ABE0">+91 8006000325</a> </p>

                                          <div style="margin-top: 30px; text-align: center;">
                                              <a href="https://yatrazone.vercel.app/profile/orders" style="display: inline-block; background-color: #10B981; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">View Your Account</a>
                                          </div>
                                      </td>
                                  </tr>
                                  <!-- Footer -->
                                  <tr>
                                      <td style="padding: 20px 30px; text-align: center; background-color: #f8f9fa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                          <div class="footer">
                          <p>If you have any questions, feel free to contact: <a href="mailto:info@yatrazone.com">info@yatrazone.com</a>.</p>
                          <p>&copy; ${new Date().getFullYear()} YatraZone. All rights reserved.</p>
                      </div>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
              </body>
              </html>
                                      `
                    await axios.post('/api/setOrderFailed', {
                        id: orderId
                    })
                    try {
                        await axios.post("/api/brevo", {
                            to: formData.email,
                            subject: "Payment Failed",
                            htmlContent: emailMessage,
                        });
                    } catch (error) {
                        console.error("Error sending email:", error);
                    }

                    toast.error("Payment failed! Check your email for details.", {
                        style: { borderRadius: "10px", border: "2px solid red" },
                    });

                    // Clean up the event listener
                    rzp.off("payment.failed", handlePaymentFailed);
                };

                rzp.on("payment.failed", handlePaymentFailed);

                rzp.open()
            }
            document.body.appendChild(script)
        } catch (error) {
            console.error("Error during payment:", error);
            if (error.response) {
                // Server responded with a status code outside 2xx
                toast.error(`Error: ${error.response.data.error || "Payment failed"}`);
            } else if (error.request) {
                // No response received
                toast.error("No response from the server. Please try again.");
            } else {
                // Something went wrong in setting up the request
                toast.error("An error occurred. Please try again.");
            }
        }
    }

    const handleNextForm = () => {
        if (!packagePlan) return toast.error("Please Select a Package Plan", { style: { borderRadius: "10px", border: "2px solid red" } })
        if (adults === "0") return toast.error("Please Select Adults", { style: { borderRadius: "10px", border: "2px solid red" } })
        if (pickupRequired === "Yes" && !pickupValue) return toast.error("Please Select Pickup Option", { style: { borderRadius: "10px", border: "2px solid red" } })
        if (dropOffRequired === "Yes" && !dropOffValue) return toast.error("Please Select DropOff Option", { style: { borderRadius: "10px", border: "2px solid red" } })

        // Initialize helicopter form with adult and child counts
        setHeliFormData({
            ...heliFormData,
            numAdults: parseInt(adults) || 0,
            numChildren: parseInt(children) || 0,
            // Initialize arrays with empty objects for each adult/child
            adults: Array(parseInt(adults) || 0).fill().map(() => ({
                fullname: "",
                age: 0,
                weight: 0,
                idProof: { url: "", key: "" }
            })),
            children: Array(parseInt(children) || 0).fill().map(() => ({
                fullname: "",
                age: 0,
                weight: 0,
                idProof: { url: "", key: "" }
            }))
        });

        setStep("form")
    }

    useEffect(() => {
        setDisabled(!checkFormCompletion());
    }, [formData, bookingDetails, heliFormData, packages?.basicDetails?.heliBooking]);
    const checkFormCompletion = () => {
        // Basic form validation
        const basicFieldsFilled =
            formData.fullName &&
            formData.email &&
            formData.mobile &&
            formData.address &&
            formData.city &&
            formData.state &&
            formData.pincode !== undefined && formData.pincode !== null && formData.pincode !== '';

        // Helicopter booking validation if applicable
        let heliFieldsFilled;
        if (packages?.basicDetails?.heliBooking === "Yes") {
            heliFieldsFilled =
                (!heliFormData.numAdults > 0 ||
                    heliFormData.adults.every(adult =>
                        adult.fullname &&
                        adult.age &&
                        adult.weight &&
                        adult.idProof.url
                    )) &&
                (!heliFormData.numChildren > 0 ||
                    heliFormData.children.every(child =>
                        child.fullname &&
                        child.age &&
                        child.weight &&
                        child.idProof.url
                    ))
        } else {
            heliFieldsFilled = true
        }

        const bookingDetailsFilled =
            bookingDetails.travelDate &&
            bookingDetails.departureLocation !== undefined && bookingDetails.departureLocation !== null && bookingDetails.departureLocation !== ''

        return basicFieldsFilled && heliFieldsFilled && bookingDetailsFilled;
    };

    const previewFormSave = {
        userId: user._id,
        packageId: packages._id,
        totalAmount: totalPrice,
        amount: advancePay,
        formData: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.mobile,
            address: formData.address,
            extraAddressInfo: formData.apartment,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            instructions: formData.instructions || '',
        },
        bookingDetails: {
            travelDate: bookingDetails.travelDate,
            departureLocation: bookingDetails.departureLocation,
        },
        heliFormData: {
            adults: heliFormData.adults,
            children: heliFormData.children,
            infants: heliFormData.infants,
            numAdults: parseInt(heliFormData.numAdults),
            numChildren: parseInt(heliFormData.numChildren),
            numInfants: parseInt(heliFormData.numInfants),
            medicalRequirements: heliFormData.medicalRequirements,
            specialRequirements: heliFormData.specialRequirements
        },
        customPackageForm: {
            travelDate: date,
            packagePlan: packagePlan,
            mealPlan: accommodationPlan,
            numAdults: heliFormData.numAdults,
            numChildren: heliFormData.numChildren,
            numMattress: extraMattress,
            vehicleType: vehicleType,
            vehiclePrice: vehiclePrice,
            totalAmount: totalPrice,
            pickupRequired: pickupRequired,
            pickupDetails: {
                city: pickupDetails.city,
                vehicleType: pickupDetails.vehicleType,
                vehiclePrice: pickupDetails.vehiclePrice,
            },
            dropoffRequired: dropOffRequired,
            dropoffDetails: {
                city: dropoffDetails.city,
                vehicleType: dropoffDetails.vehicleType,
                vehiclePrice: dropoffDetails.vehiclePrice,
            }
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3  gap-2 xl:gap-8 font-barlow mx-4 xl:mx-12 my-12">
            <div className="lg:col-span-1 block lg:hidden">
                <div className="lg:sticky lg:top-28">
                    <PackageSummary
                        packageDetails={packages}
                        packagePlan={packagePlan}
                        accommodationPlan={getSelectedAccommodationPlan()?.name || ""}
                        adults={Number.parseInt(adults)}
                        adultPrice={adultPrice}
                        childrenPrice={childrenPrice}
                        children={Number.parseInt(children)}
                        vehiclePrice={vehiclePrice}
                        vehicleType={vehicleType}
                        extraMattress={Number.parseInt(extraMattress)}
                        mattressTotal={mattressTotal}
                        pickupRequired={pickupRequired === "Yes"}
                        dropOffRequired={dropOffRequired === "Yes"}
                        pickupDetails={pickupDetails}
                        dropoffDetails={dropoffDetails}
                        totalPrice={totalPrice}
                        travelDate={date}
                        handlePayment={handlePayment}
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
                {step === "selectPackage" &&
                    <>
                        <Card className="border-blue-300 border-2 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="!text-lg font-gilda">Plan Your Itinerary</CardTitle>
                                <CardDescription className="text-justify">
                                    When planning your trip, selecting the "Option" is a crucial step to ensure all arrangements align with your schedule. The Estimated Travel Date refers to the anticipated date when you plan to begin your journey. This selection helps service providers, such as transportation, hotels, accommodation & meals plan, and tour operators, to tailor their services to your needs. It allows them to check availability, provide accurate pricing, and make necessary reservations in advance. While subject to change, providing an estimated date as early as possible helps streamline the planning process and ensures that you secure the best options for your travel. Be sure to review and update this date if your plans change to avoid any potential disruptions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Travel Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="travel-date" className="text-lg font-semibold font-gilda">Travel Date</Label>
                                    <p className="text-sm text-muted-foreground">Choose available options and the estimated date of travel. Yatrazone will therefore make sure that all scheduled fees for guides in spiritual inquiry and cultural immersion are customized for your prosperous voyage.</p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn("w-full justify-start text-left font-normal outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none", !date && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 font-barlow">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                                disabled={(date) => date < new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Package Plan */}
                                <div className="space-y-2">
                                    <Label htmlFor="package-plan" className="text-lg font-semibold font-gilda">Available Package Plan</Label>
                                    <p className="text-sm text-muted-foreground">Package plan offer according to the type of facilities, assistance, or service. What possibilities are accessible to you will depend on your requirements or budget.</p>
                                    <Select value={packagePlan} onValueChange={setPackagePlan}>
                                        <SelectTrigger id="package-plan" className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select Package Plan" />
                                        </SelectTrigger>
                                        <SelectContent className="outline-none border-2 font-barlow border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            {plans?.map((plan) => (
                                                <SelectItem key={plan._id} value={plan.planName}>
                                                    {plan.planName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Accommodation Plan */}
                                <div className="space-y-2">
                                    <Label htmlFor="accommodation-plan" className="text-lg font-semibold font-gilda">Custom Accommodation & Meals Plan</Label>
                                    <p className="text-sm text-muted-foreground">Choose from a variety of lodging and meal plan categories, including those that are added to the cost of a room in order to provide guests with lodging and meals at a hotel.</p>
                                    <Select value={accommodationPlan} onValueChange={setAccommodationPlan}>
                                        <SelectTrigger id="accommodation-plan" className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select accommodation" />
                                        </SelectTrigger>
                                        <SelectContent className="outline-none border-2 font-barlow border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            {accommodationPlans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Number of Adults */}
                                <div className="space-y-2">
                                    <Label htmlFor="adults" className="text-lg font-semibold font-gilda">Number of Adults</Label>
                                    <p className="text-sm text-muted-foreground">The selected adult unit must be older than twelve. Adulthood should be considered for anyone over 12 years old.</p>
                                    <Select value={adults} onValueChange={(value) => {
                                        setAdults(value)
                                        setChildren("0") // Reset children when adults change
                                        setExtraMattress("0") // Reset extra mattress when adults change
                                    }}>
                                        <SelectTrigger id="adults" className="outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select number of adults" />
                                        </SelectTrigger>
                                        <SelectContent className="font-barlow outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            {[2, 4, 6, 8].map((num, index) => (
                                                <SelectItem key={`adult-${num}`} value={num.toString()}>
                                                    {`${num} Adult, ${index === 0 ? "One Room Only" : `${index + 1} Room Mandatory`}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                </div>

                                {/* Number of Children */}
                                <div className="space-y-2">
                                    <Label htmlFor="children" className="text-lg font-semibold font-gilda">Number of Children</Label>
                                    <p className="text-sm text-muted-foreground">The chosen child unit needs to be a youngster aged five to twelve. Any age over 12 ought to be considered adulthood.</p>
                                    <Select value={children} onValueChange={setChildren}>
                                        <SelectTrigger id="children" className="outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select number of children" />
                                        </SelectTrigger>
                                        <SelectContent className="font-barlow outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            {generateChildrenOptions().map((num) => (
                                                <SelectItem key={`child-${num}`} value={num.toString()}>
                                                    {num}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Extra Mattress */}
                                <div className="space-y-2">
                                    <Label htmlFor="extra-mattress" className="text-lg font-semibold font-gilda">Extra Mattress</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Choose the number of extra mattresses required based on the number of people.
                                    </p>
                                    <Select value={extraMattress} onValueChange={setExtraMattress}>
                                        <SelectTrigger id="extra-mattress" className="outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select extra mattress" />
                                        </SelectTrigger>
                                        <SelectContent className="font-barlow outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            {generateExtraMattressOptions().map((num) => (
                                                <SelectItem key={`mattress-${num}`} value={num.toString()}>
                                                    {num}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Pickup Required */}
                                <div className="space-y-2">
                                    <Label htmlFor="pickup" className="text-lg font-semibold font-gilda">Pickup Required</Label>
                                    <p className="text-sm text-muted-foreground">
                                        For convenience, choose our traveller pickup service at the closest preferred location.
                                    </p>
                                    <Select
                                        value={pickupRequired}
                                        onValueChange={(value) => {
                                            setPickupRequired(value);
                                            if (value === "No") {
                                                setPickupDetails({
                                                    city: "",
                                                    vehicleType: "",
                                                    vehiclePrice: 0
                                                });
                                                setPickupValue("");
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="pickupRequired" className="outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select Pickup Required" />
                                        </SelectTrigger>
                                        <SelectContent className="font-barlow outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {pickupRequired === "Yes" && (
                                        <Select
                                            value={pickupValue}
                                            onValueChange={handlePickupChange}
                                        >
                                            <SelectTrigger id="pickup" className="outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                                <SelectValue placeholder="Select pickup option" />
                                            </SelectTrigger>
                                            <SelectContent className="font-barlow outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                                {/* Only show pickup options for pickup selection */}
                                                {packages.vehiclePlan.pickup.vehicleType.map((type, index) => (
                                                    <SelectItem key={`pickup-${index}`} value={`${packages.vehiclePlan.pickup.city}:${type}`}>
                                                        {`${packages.vehiclePlan.pickup.city}: ${type}`}
                                                    </SelectItem>
                                                ))}
                                                {packages.vehiclePlan.drop.vehicleType.map((type, index) => (
                                                    <SelectItem key={`dropoff-${index}`} value={`${packages.vehiclePlan.drop.city}:${type}`}>
                                                        {`${packages.vehiclePlan.drop.city}: ${type}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Drop-off Required */}
                                <div className="space-y-2">
                                    <Label htmlFor="dropoff" className="text-lg font-semibold font-gilda">Drop-off Required</Label>
                                    <p className="text-sm text-muted-foreground">
                                        For easy onboarding, choose to drop off at the designated location by car at the nearby specified location.
                                    </p>
                                    <Select
                                        value={dropOffRequired}
                                        onValueChange={(value) => {
                                            setDropOffRequired(value);
                                            if (value === "No") {
                                                setDropoffDetails({
                                                    city: "",
                                                    vehicleType: "",
                                                    vehiclePrice: 0
                                                });
                                                setDropOffValue("");
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="dropRequired" className="outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select Drop-Off Required" />
                                        </SelectTrigger>
                                        <SelectContent className="font-barlow outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {dropOffRequired === "Yes" && (
                                        <Select
                                            value={dropOffValue}
                                            onValueChange={handleDropoffChange}
                                        >
                                            <SelectTrigger id="dropoff" className="outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                                <SelectValue placeholder="Select drop-off option" />
                                            </SelectTrigger>
                                            <SelectContent className="font-barlow outline-none border-2 border-blue-600 bg-white focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                                {/* Only show drop options for dropoff selection */}
                                                {packages.vehiclePlan.pickup.vehicleType.map((type, index) => (
                                                    <SelectItem key={`pickup-${index}`} value={`${packages.vehiclePlan.pickup.city}:${type}`}>
                                                        {`${packages.vehiclePlan.pickup.city}: ${type}`}
                                                    </SelectItem>
                                                ))}
                                                {packages.vehiclePlan.drop.vehicleType.map((type, index) => (
                                                    <SelectItem key={`dropoff-${index}`} value={`${packages.vehiclePlan.drop.city}:${type}`}>
                                                        {`${packages.vehiclePlan.drop.city}: ${type}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="w-full text-center">
                            <Button
                                onClick={handleNextForm}
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-lg mt-4"
                            >
                                Continue To Next Form
                            </Button>
                        </div>

                        {/* Itinerary Schedule */}
                        <ItinerarySchedule
                            packageDetails={packages}
                            packagePlan={packagePlan}
                            allPlans={plans}
                            pickupRequired={pickupRequired}
                            pickupDetails={pickupDetails}
                            dropOffRequired={dropOffRequired}
                            dropoffDetails={dropoffDetails}
                        />
                    </>
                }
                {step === "form" && (
                    <form onSubmit={handleFormSubmit} onChange={() => { setIsFormDirty(true) }} className="h-fit space-y-4 p-8 bg-white  rounded-xl border-2 border-blue-300 shadow-2xl">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Booking Form</h2>
                            <div className="lg:grid grid-cols-1 lg:grid-cols-2 gap-4">

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <Input
                                        type="text"
                                        className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">10-Digit Mobile Number</label>
                                    <Input
                                        type="number"
                                        className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.mobile}
                                        onChange={(e) => {
                                            // Ensure the input value is no longer than 10 digits
                                            if (e.target.value.length <= 10) {
                                                setFormData({ ...formData, mobile: e.target.value });
                                            }
                                        }}
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input
                                        type="email"
                                        className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Permanent Address */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Permanent Address</label>
                                    <Textarea
                                        className="resize-none outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Apartment, Suite, etc. (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Apartment, Suite, etc. (Optional)</label>
                                    <Input
                                        type="text"
                                        className="resize-none outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.apartment}
                                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <Select
                                        required
                                        value={formData.state}
                                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                                    >
                                        <SelectTrigger className="resize-none outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                        <SelectContent className="outline-none border-2 border-blue-600 bg-blue-100 focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none">
                                            {statesIndia.sort().map((state) => (
                                                <SelectItem key={state} value={state}>
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <Input
                                        type="text"
                                        className="resize-none outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pincode</label>
                                    <Input
                                        type="text"
                                        className="resize-none outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Instructions/Notes */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Any Required Instructions/Notes</label>
                                    <Textarea
                                        className="resize-none outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                        value={formData.instructions}
                                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    />
                                </div>
                            </div>

                        </div>
                        {packages?.basicDetails?.heliBooking === "Yes" && <div className="space-y-4 pt-8">
                            <h2 className="text-2xl font-bold">Helicopter Booking Form</h2>

                            {/* Number of Adults */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Number of Adults</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={heliFormData.numAdults}
                                    readOnly
                                    className="outline-none border-2 border-blue-600 bg-gray-100 focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                />
                            </div>

                            {/* Adults Details */}
                            {Array.from({ length: heliFormData.numAdults }).map((_, index) => (
                                <div key={index} className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold">Adult {index + 1}</h3>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Full Name</label>
                                        <Input
                                            type="text"
                                            value={heliFormData.adults[index]?.fullname || ""}
                                            onChange={(e) => handleInputChange(e, "fullname", index, "adults")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Age</label>
                                        <Input
                                            type="number"
                                            value={heliFormData.adults[index]?.age || ""}
                                            onChange={(e) => handleInputChange(e, "age", index, "adults")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                                        <Input
                                            type="number"
                                            value={heliFormData.adults[index]?.weight || ""}
                                            onChange={(e) => handleInputChange(e, "weight", index, "adults")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ID Proof</label>
                                        <UploadButton
                                            endpoint="imageUploader" // Replace with your UploadThing endpoint
                                            onClientUploadComplete={(res) => handleFileUpload(res, index, "adults")}
                                            onUploadError={(error) => console.error("Upload Error:", error)}
                                        />
                                        {heliFormData.adults[index]?.idProof?.url && (
                                            <div className="mt-2 relative flex items-center gap-4 aspect-video">
                                                <Image
                                                    src={heliFormData.adults[index].idProof.url}
                                                    width={1280}
                                                    height={720}
                                                    quality={25}
                                                    alt="ID Proof"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    size={"icon"}
                                                    onClick={() => handleDeleteImage(index, "adults")}
                                                    className="bg-red-500 absolute top-0 right-0 rounded-full text-white hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Number of Children */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Number of Children</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={heliFormData.numChildren}
                                    readOnly
                                    className="outline-none border-2 border-blue-600 bg-gray-100 focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                />
                            </div>

                            {/* Children Details */}
                            {Array.from({ length: heliFormData.numChildren }).map((_, index) => (
                                <div key={index} className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold">Child {index + 1}</h3>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Full Name</label>
                                        <Input
                                            type="text"
                                            value={heliFormData.children[index]?.fullname || ""}
                                            onChange={(e) => handleInputChange(e, "fullname", index, "children")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Age</label>
                                        <Input
                                            type="number"
                                            value={heliFormData.children[index]?.age || ""}
                                            onChange={(e) => handleInputChange(e, "age", index, "children")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                                        <Input
                                            type="number"
                                            value={heliFormData.children[index]?.weight || ""}
                                            onChange={(e) => handleInputChange(e, "weight", index, "children")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ID Proof</label>
                                        <UploadButton
                                            endpoint="imageUploader" // Replace with your UploadThing endpoint
                                            onClientUploadComplete={(res) => handleFileUpload(res, index, "children")}
                                            onUploadError={(error) => console.error("Upload Error:", error)}
                                        />
                                        {heliFormData.children[index]?.idProof?.url && (
                                            <div className="mt-2 relative flex items-center gap-4 aspect-video">
                                                <Image
                                                    src={heliFormData.children[index].idProof.url}
                                                    width={1280}
                                                    height={720}
                                                    quality={25}
                                                    alt="ID Proof"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    size={"icon"}
                                                    onClick={() => handleDeleteImage(index, "children")}
                                                    className="bg-red-500 absolute top-0 right-0 rounded-full text-white hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Number of Infants */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Number of Infants</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={heliFormData.numInfants}
                                    onChange={(e) => handleInputChange(e, "numInfants")}
                                    className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                />
                            </div>

                            {/* Infants Details */}
                            {Array.from({ length: heliFormData.numInfants }).map((_, index) => (
                                <div key={index} className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold">Infant {index + 1}</h3>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Full Name</label>
                                        <Input
                                            type="text"
                                            value={heliFormData.infants[index]?.fullname || ""}
                                            onChange={(e) => handleInputChange(e, "fullname", index, "infants")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Age</label>
                                        <Input
                                            type="number"
                                            value={heliFormData.infants[index]?.age || ""}
                                            onChange={(e) => handleInputChange(e, "age", index, "infants")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                                        <Input
                                            type="number"
                                            value={heliFormData.infants[index]?.weight || ""}
                                            onChange={(e) => handleInputChange(e, "weight", index, "infants")}
                                            className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"

                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ID Proof</label>
                                        <UploadButton
                                            endpoint="imageUploader" // Replace with your UploadThing endpoint
                                            onClientUploadComplete={(res) => handleFileUpload(res, index, "infants")}
                                            onUploadError={(error) => console.error("Upload Error:", error)}
                                        />
                                        {heliFormData.infants[index]?.idProof?.url && (
                                            <div className="mt-2 relative flex items-center gap-4 aspect-video">
                                                <Image
                                                    src={heliFormData.infants[index].idProof.url}
                                                    width={1280}
                                                    height={720}
                                                    quality={25}
                                                    alt="ID Proof"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    size={"icon"}
                                                    onClick={() => handleDeleteImage(index, "infants")}
                                                    className="bg-red-500 absolute top-0 right-0 rounded-full text-white hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Medical Requirements */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Medical Requirements</label>
                                <Textarea
                                    value={heliFormData.medicalRequirements}
                                    onChange={(e) => handleInputChange(e, "medicalRequirements")}
                                    className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                />
                            </div>

                            {/* Special Requirements */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Special Requirements</label>
                                <Textarea
                                    value={heliFormData.specialRequirements}
                                    onChange={(e) => handleInputChange(e, "specialRequirements")}
                                    className="outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                />
                            </div>
                        </div>}
                        <div className="text-center">
                            <Button
                                onClick={() => {
                                    setStep("selectPackage")
                                }}
                                type="submit"
                                className="bg-blue-600  hover:bg-blue-700 text-lg mt-4"
                            >
                                Go To Previous Form
                            </Button>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full mt-8 text-lg !py-6 border-2 border-blue-600 bg-blue-200 hover:bg-blue-600 hover:text-white text-black">
                            Go To Next Form
                        </Button>
                    </form>
                )}

                {/* Booking Details Section */}
                {step === "booking" && (
                    <div className="flex flex-col gap-8">
                        <div className="space-y-4 p-8 shadow-2xl rounded-xl border-2 border-blue-300 h-fit">
                            <h2 className="text-3xl font-bold mb-6 font-gilda">Date Schedule</h2>

                            {/* Travel Date */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Travel Date</label>
                                <Input
                                    type="date"
                                    className="resize-none w-fit outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                    value={bookingDetails.travelDate}
                                    onChange={(e) => setBookingDetails({ ...bookingDetails, travelDate: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Departure Location */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    From which location (city) Bus/Rail/Airport would you like to leave?
                                </label>
                                <Input
                                    type="text"
                                    className="resize-none outline-none border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                    value={bookingDetails.departureLocation}
                                    onChange={(e) =>
                                        setBookingDetails({ ...bookingDetails, departureLocation: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            {/* Previous Button */}
                            <Button
                                variant="outline"
                                className="outline-none w-full !mt-12 border-2 border-blue-600 bg-transparent focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                                onClick={() => setStep("form")}
                            >
                                Previous
                            </Button>
                        </div>
                        {packages?.basicDetails?.heliBooking === "Yes" && <div className="space-y-4 p-8 bg-blue-100 rounded-xl border-2 border-blue-300 h-fit">
                            <h2 className="text-3xl font-bold mb-6 font-gilda">Special Note: Follow Heli Tour Policy</h2>

                            <div className="space-y-4 pt-8">
                                <p className=" font-semibold text-justify">
                                    Each helicopter can accommodate up to 6 passengers with a total body weight limitation of 445 kg for 6 passengers.</p>
                                <p className=" font-semibold text-justify">
                                    Yatrazone: Your Spiritual Travel Solution holds the right to de-board the passenger if the given body weight deviates from the actual body weight provided at the time of making the booking. In such a scenario, we will not be liable to provide the refund amount to any passenger de-boarded. Passengers are requested to share the exact body weight measured on an electronic measuring scale.</p>
                                <p className=" font-semibold text-justify">
                                    Passengers with body weight above 75 kg will be charged INR 2,000. This amount will be collected in Dehradun to avoid last-minute hassle.</p>
                                <p className=" font-semibold text-justify">
                                    In case the overall body weight exceeds more than 450 kg, passengers whose given body weight is wrong will be charged INR 2,500 per kg only on the final call of the pilot, else will be de-boarded without any refund.</p>
                                <p className=" font-semibold text-justify">
                                    By submitting this information, you acknowledge that the details provided are accurate and complete. The service provider is not responsible for any inaccuracies or omissions in the provided data. Any medical or special requirements should be communicated clearly, and the service provider will make reasonable efforts to accommodate these needs.</p>
                                <p className=" font-semibold text-justify">
                                    The transportation service is provided based on availability, and all applicable terms and conditions apply. The tour package pricing and the minimum rate indicated above may change based on the hotels and transportation options available on that particular date. While subject to change, providing an estimated date as early as possible helps streamline the planning process and ensures that you secure the best options for your travel. Be sure to review and update this date if your plans change to avoid any potential disruptions.</p>
                            </div>
                        </div>}
                        <div className="space-y-4 p-8 bg-blue-100 rounded-xl border-2 shadow-2xl border-blue-300 h-fit">
                            <h2 className="text-3xl font-bold mb-6">Review Customer Information</h2>

                            {/* Customer Name */}
                            <div>
                                <p className="block mb-1 text-sm font-medium text-gray-800">Name of Traveller: <span className="font-bold text-base text-blue-600">{formData.fullName}</span></p>
                                <p className="block mb-1 text-sm font-medium text-gray-800">Contact Number: <span className="font-bold text-base text-blue-600">+91 {formData.mobile}</span></p>
                                <p className="block mb-1 text-sm font-medium text-gray-800">Email: <span className="font-bold text-base text-blue-600">{formData.email}</span></p>
                                <p className="block mb-1 text-sm font-medium text-gray-800">Address: <span className="font-bold text-base text-blue-600">{formData.address}, {formData.city}, {formData.state}, {formData.pincode}</span></p>
                            </div>

                            <div className="space-y-8 pt-8">
                                <p className=" font-semibold  text-justify ">Note: The tour package pricing and the minimum rate indicated above may change based on the hotels and transportation options available on that particular date. While subject to change, providing an estimated date as early as possible helps streamline the planning process and ensures that you secure the best options for your travel. Be sure to review and update this date if your plans change to avoid any potential disruptions.</p>

                                <p>Our team will connect with you shortly to discuss the details and help you create an amazing travel experience.</p>

                                <p>If you have any immediate questions or preferences,
                                    feel free to share with us!</p>

                                <p>Email: <Link href={"mailto:info@yatrazone.com"} className="text-blue-600 font-semibold">Info@yatrazone.com</Link> or call <Link href={"tel:+918006000325"} className="text-blue-600 font-semibold"> +91 8006000325</Link></p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Package Summary - Sticky on mobile */}
            <div className="lg:col-span-1 hidden lg:block">
                <div className="lg:sticky lg:top-28">
                    <PackageSummary
                        previewFormSave={previewFormSave}
                        packageDetails={packages}
                        packagePlan={packagePlan}
                        accommodationPlan={getSelectedAccommodationPlan()?.name || ""}
                        adults={Number.parseInt(adults)}
                        adultPrice={adultPrice}
                        childrenPrice={childrenPrice}
                        children={Number.parseInt(children)}
                        vehiclePrice={vehiclePrice}
                        vehicleType={vehicleType}
                        extraMattress={Number.parseInt(extraMattress)}
                        mattressTotal={mattressTotal}
                        pickupRequired={pickupRequired === "Yes"}
                        dropOffRequired={dropOffRequired === "Yes"}
                        pickupDetails={pickupDetails}
                        dropoffDetails={dropoffDetails}
                        totalPrice={totalPrice}
                        travelDate={date}
                        handlePayment={handlePayment}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div >
    )
}