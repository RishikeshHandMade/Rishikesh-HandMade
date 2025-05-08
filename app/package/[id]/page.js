import Image from "next/image"
import {
    MapPin,
    Calendar,
    Clock,
    Tag,
    Star,
    Check,
    X,
    AlertTriangle,
    Calculator,
    MessageSquare,
    ShoppingCart,
    PhoneCall,
    MessageCircle,
    CalendarClock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ReviewForm from "@/components/Category/review-form"
import PackageGallery from "@/components/Category/package-gallery"
import PackageMap from "@/components/Category/package-map"
import Link from "next/link"
import { SidebarInset } from "@/components/ui/sidebar"
import User from "@/models/User"
import { getReviewsById } from "@/actions/GetReviewsById"
import { Card, CardContent } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DismissableInfoBox } from "@/components/Package/NoticeBox"
import connectDB from "@/lib/connectDB"
import Package from "@/models/Package"
import PackageCarouselWrapper from "@/components/PackageCarouselWrapper";
import FeaturedCarouselWrapper from "@/components/FeaturedCarouselWrapper";
import ComingSoon from "@/models/ComingSoon";
import ComingSoonEnquiryForm from "@/components/ComingSoonEnquiryForm";
import ImportantNotice from "@/components/ImportantNotice"

const getPackageById = async (id) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getPackageById/${id}`);

        if (!res.ok) {
            return null; // Return null when package is not found
        }

        const data = await res.json();
        if (data.error) {
            return null; // Return null if API returns an error
        }

        return data;
    } catch (error) {
        // console.error("Fetch error:", error);
        return null; // Return null on fetch failure
    }
};

// Fetch featured packages from the API
const getFeaturedPackages = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/featured-packages`);

        if (!res.ok) return [];
        const data = await res.json();
        // console.log(data);
        return data || [];
    } catch (error) {
        // console.error('Error fetching featured packages:', error);
        return [];
    }
};

// Helper: get Coming Soon package by id
const getComingSoonById = async (id) => {
    try {
        await connectDB();
        const pkg = await ComingSoon.findById(id).lean();
        // console.log(pkg)
        return pkg || null;
    } catch (e) {
        return null;
    }
};

const PackageDetailsPage = async ({ params }) => {
    const { id } = await params;
    await connectDB();
    const session = await getServerSession(authOptions);
    // Try Package first
    let packageDetails = await getPackageById(id);
    let isComingSoon = false;
    if (!packageDetails) {
        // Try ComingSoon
        packageDetails = await getComingSoonById(id);
        isComingSoon = !!packageDetails;
    }
    const reviews = await getReviewsById(id);

    const packages = await Package.find({}).limit(10).lean().exec();

    const featuredPackages = await getFeaturedPackages();
    // console.log('SSR featuredPackages:', featuredPackages);

    const user = session?.user
        ? await User.findOne({ _id: (session?.user?.id) }).lean()
        : null;
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-IN').format(number);
    };

    if (!packageDetails) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold mb-4">Package Not Available</h1>
                <p className="mb-8">This package is either not found or has been disabled by the admin.</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        );
    }

    if (isComingSoon) {
        // --- COMING SOON PAGE ---
        return (
            <SidebarInset>
                <div className="min-h-screen mb-20 font-barlow">
                    {/* Banner */}
                    <div className="relative h-[120px] md:h-[300px] w-full overflow-hidden bg-gray-300 flex items-center justify-center">
                        {packageDetails.bannerUrl ? (
                            <Image src={packageDetails.thumbUrl} alt="Banner" fill className="object-cover" />
                        ) : (
                            <span className="text-2xl md:text-4xl font-bold text-gray-400">IMAGE BANNER</span>
                        )}
                    </div>
                    <div className="lg:p-6 p-2 border-b">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex md:flex-row flex-col items-center gap-4">
                            {packageDetails.thumbUrl ? (
                                <Image
                                    src={packageDetails.bannerUrl || "https://dummyimage.com/600x400/000/fff"}
                                    alt="Tour package image"
                                    width={300}
                                    height={300}
                                    className="object-cover w-full lg:w-96 rounded-xl aspect-video"
                                />
                            ):(
                                <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">Image<br/>Update Soon</div>
                            )}
                                <div className="flex flex-col gap-2 lg:w-[50rem]">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Tag className="h-4 w-4" />
                                        <span className="font-medium">Package Code: <span className="font-bold tracking-wider text-2xl text-black">Not Available</span></span>
                                    </div>
                                    <h2 className="text-2xl lg:text-4xl font-gilda font-bold w-full">{packageDetails?.title}</h2>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span>Location: {packageDetails.location}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            <span>Duration: {packageDetails.days} Days</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="h-4 w-4 mr-1 " />
                                            <span>Tour Type: {packageDetails.tourType}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <Button size="icon" className="bg-white border-2 border-blue-600 !p-6 hover:bg-blue-100 rounded-lg">
                                            <Link href={`tel:+918006000325`}><PhoneCall className="!h-6 !w-6 text-black" /></Link>
                                        </Button>
                                        <Button className="bg-green-600 border-2 border-green-300 !p-6 hover:bg-green-700 !text-white rounded-lg">
                                            <Link
                                                href={`https://wa.me/918006000325?text=${encodeURIComponent(`I'm interested in your package $sdfg`)}`}
                                                className="flex items-center gap-2 text-lg"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MessageCircle className="!h-6 !w-6 !text-white" />
                                                Whatsapp
                                            </Link>
                                        </Button>
                                    </div>
                                    <h2 className="text-2xl lg:text-4xl font-gilda font-bold w-full">Package Price Not Available Now</h2>
                                </div>
                            </div>
                            <div className="md:text-right w-fit">
                                <div className="text-2xl font-bold text-primary">₹<span className="text-4xl text-blue-600">XXXX*</span></div>
                                <div className="text-sm text-gray-600 font-medium">Per Person</div>
                                <div className="flex items-center md:justify-end mt-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="ml-1 text-sm font-medium">0</span>
                                         <span className="ml-1 text-sm text-gray-500 font-medium">reviews</span>
                                    </div>
                            </div>
                        </div>
                    </div>
                    {/* ENQUIRY FORM */}
                    <div className="rounded-lg p-8 mt-10 max-w-3xl mx-auto">
                        <ComingSoonEnquiryForm packageId={packageDetails._id?.toString()} />
                    </div>
                </div>
            </SidebarInset>
        );
    }

    const formatNumeric = (number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const sanitizedUser = JSON.parse(
        JSON.stringify({
            ...user,
            _id: user?._id?.toString(),
            packages: user?.packages?.map(pkg => pkg.toString()),
            orders: user?.orders?.map(order => order.toString()),
            reviews: user?.reviews?.map(review => ({
                ...review,
                _id: review._id?.toString(),
            })),
            createdAt: user?.createdAt?.toISOString(),
            updatedAt: user?.updatedAt?.toISOString(),
        })
    );

    const validReviews = Array.isArray(reviews) ? reviews.filter(review => review.approved === true) : [];

    const avgRating = validReviews.length > 0
        ? parseFloat(validReviews.reduce((total, review) => total + review.rating, 0) / validReviews.length)
        : 0;

    return (
        <SidebarInset>
            {/* Package Content */}
            <div className="min-h-screen mb-20 font-barlow">
                {/* Banner */}
                <div className="relative h-[100px]  md:h-[300px] w-full  overflow-hidden">
                    <Image
                        src={packageDetails.basicDetails?.imageBanner?.url || "https://dummyimage.com/600x400/000/fff"}
                        alt={packageDetails.packageName || "Tour package image"}
                        fill
                        className="object-cover md:object-fill"
                        priority
                    />
                </div>
                {/* Package Details */}
                <div className="md:w-full w-[22rem] mx-auto md:px-4 py-6">
                    <div className="bg-white rounded-lg  overflow-hidden">
                        {/* Package Header */}
                        <div className="lg:p-6 p-2 border-b">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="flex md:flex-row flex-col items-center gap-4">
                                    <Image
                                        src={packageDetails.basicDetails?.thumbnail?.url || "https://dummyimage.com/600x400/000/fff"}
                                        alt={packageDetails.packageName || "Tour package image"}
                                        width={300}
                                        height={300}
                                        className="object-cover w-full lg:w-96 rounded-xl aspect-video"
                                    />
                                    <div className="flex flex-col gap-2 lg:w-[50rem]">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Tag className="h-4 w-4" />
                                            <span className="font-medium">Package Code: <span className="font-bold tracking-wider text-black">{packageDetails.packageCode}</span></span>
                                        </div>
                                        <h2 className="text-2xl lg:text-4xl font-gilda font-bold w-full">{packageDetails.packageName}</h2>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                <span>Location: {packageDetails.basicDetails?.location}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                <span>Duration: {packageDetails.basicDetails?.duration} Days</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="h-4 w-4 mr-1 " />
                                                <span>Tour Type: {packageDetails.basicDetails?.tourType}</span>
                                            </div>
                                            {packageDetails?.basicDetails?.heliBooking === "Yes" && (
                                                <div className="flex items-center text-gray-600">
                                                    <Image src="/helicopter.png" alt="Helicopter" width={20} height={20} className="h-6 w-6 mr-1" />
                                                    <span>Helicopter Tour: {packageDetails.basicDetails?.heliBooking}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-4">
                                            <Button size="icon" className="bg-white border-2 border-blue-600 !p-6 hover:bg-blue-100 rounded-lg">
                                                <Link href={`tel:+918006000325`}><PhoneCall className="!h-6 !w-6 text-black" /></Link>
                                            </Button>
                                            <Button className="bg-green-600 border-2 border-green-300 !p-6 hover:bg-green-700 !text-white rounded-lg">
                                                <Link
                                                    href={`https://wa.me/918006000325?text=${encodeURIComponent(`I'm interested in your package ${packageDetails.packageName}`)}`}
                                                    className="flex items-center gap-2 text-lg"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <MessageCircle className="!h-6 !w-6 !text-white" />
                                                    Whatsapp
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:text-right w-fit">
                                    <div className="text-2xl font-bold text-primary">₹<span className="text-4xl text-blue-600">{formatNumber(packageDetails.price)}*</span></div>
                                    <div className="text-sm text-gray-600 font-medium">{packageDetails.priceUnit}</div>
                                    <div className="flex items-center md:justify-end mt-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="ml-1 text-sm font-medium">{avgRating || 0}</span>
                                        <span className="ml-1 text-sm text-gray-500 font-medium">({reviews?.filter((review) => review.approved === true).length || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Important Notice Tag Line */}
                        <ImportantNotice />


                        {/* Important Notice Tag Line */}
                        {packageDetails.basicDetails?.notice && packageDetails.basicDetails.notice.trim() !== '' && (
                            <DismissableInfoBox packages={packageDetails} />
                        )}
                        {/* Action Buttons */}
                        <div className="p-6 bg-blue-100 border-b">
                            <div className="flex flex-col sm:flex-row gap-3 justify-center mx-auto">
                                <Link href={`/checkout/${packageDetails._id}`} className="flex-1">
                                    <button className="w-full flex items-center justify-center !py-4 text-lg border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                        <ShoppingCart className="mr-2 !h-6 !w-6" />
                                        Package Checkout
                                    </button>
                                </Link>
                                <Link href={`/customEnquiry/${packageDetails._id}`} className="flex-1">
                                    <button className="w-full flex items-center justify-center !py-4 text-lg border-2 border-blue-600 hover:bg-white rounded-lg" variant="outline">
                                        <MessageSquare className="mr-2 !h-6 !w-6" />
                                        Custom Enquiry
                                    </button>
                                </Link>
                                {packageDetails.basicDetails?.planCalculator === 'Yes' &&
                                    (
                                        <Link href={`calculator/${packageDetails._id}`} className="flex-1">
                                            <button className="w-full flex items-center justify-center bg-transparent !py-4 text-lg border-2 border-blue-600 hover:bg-white rounded-lg">
                                                <Calculator className="mr-2 !h-6 !w-6" />
                                                Package Calculator
                                            </button>
                                        </Link>
                                    )
                                }
                            </div>
                        </div>
                        <Tabs defaultValue="overview">
                            <TabsList className="grid grid-cols-2 bg-transparent md:grid-cols-3 lg:grid-cols-6 mb-6 w-full">
                                <TabsTrigger
                                    className="text-[16px] font-[600] text-black py-4 relative  border-black data-[state=active]:!shadow-none data-[state=active]:!rounded-none   data-[state=active]:border-b-2 group"
                                    value="overview"
                                >
                                    Overview
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 
                    group-hover:w-full data-[state=active]:w-full"></span>
                                </TabsTrigger>

                                <TabsTrigger
                                    className="py-4 text-[16px] font-[600] text-black  relative border-black data-[state=active]:!shadow-none data-[state=active]:!rounded-none data-[state=active]:border-b-2 group"
                                    value="Day Plan"
                                >
                                    Day Plan
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 
                    group-hover:w-full data-[state=active]:w-full"></span>
                                </TabsTrigger>

                                <TabsTrigger
                                    className="py-4 text-[16px] font-[600] text-black  relative border-black data-[state=active]:!shadow-none data-[state=active]:!rounded-none data-[state=active]:border-b-2 group"
                                    value="Include/Exclude"
                                >
                                    Include/Exclude
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 
                    group-hover:w-full data-[state=active]:w-full"></span>
                                </TabsTrigger>

                                <TabsTrigger
                                    className="py-4 text-[16px] font-[600] text-black  relative border-black data-[state=active]:!shadow-none data-[state=active]:!rounded-none data-[state=active]:border-b-2 group"
                                    value="AdditionalInformation"
                                >
                                    Additional Information
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 
                    group-hover:w-full data-[state=active]:w-full"></span>
                                </TabsTrigger>

                                <TabsTrigger
                                    className="py-4 text-[16px] font-[600] text-black  relative border-black data-[state=active]:!shadow-none data-[state=active]:!rounded-none data-[state=active]:border-b-2 group"
                                    value="PolicyContent"
                                >
                                    Policy Content
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 
                    group-hover:w-full data-[state=active]:w-full"></span>
                                </TabsTrigger>

                                <TabsTrigger
                                    className="py-4 text-[16px] font-[600] text-black  relative border-black data-[state=active]:!shadow-none data-[state=active]:!rounded-none data-[state=active]:border-b-2 group"
                                    value="reviews"
                                >
                                    Reviews
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 
                    group-hover:w-full data-[state=active]:w-full"></span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 ">
                                {/* Description */}
                                {(packageDetails.basicDetails?.fullDesc) &&
                                    <div className="prose max-w-none leading-none">
                                        <div className="custom-desc-list  px-6">
                                            {packageDetails.basicDetails?.fullDesc ? (
                                                <div dangerouslySetInnerHTML={{ __html: packageDetails.basicDetails.fullDesc }}></div>
                                            ) : (
                                                <p>No description available</p>
                                            )}
                                        </div>
                                    </div>
                                }
                                {/* Location Map & Gallery Row (50% width each, only in overview section) */}
                                <div className="flex  gap-8 my-8 w-full">
                                    {/* Location Map - only show if location exists */}
                                    {packageDetails.info?.filter((item) => item.typeOfSelection === "Location Map")[0]?.selectionDesc && (
                                        <div className="w-full">
                                            <h3 className="text-2xl font-bold mb-4 px-2 text-center"> Map Location</h3>
                                            <p className="text-gray-900 text-sm md:text-md lg:text-lg font-barlow my-4 px-6 text-center">
                                                Visit Us with Ease – Your next favorite pick is closer than you think!
                                            </p>
                                            <PackageMap location={packageDetails.info?.filter((item) => item.typeOfSelection === "Location Map")[0]?.selectionDesc} />
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Day Plan */}
                            <TabsContent value="Day Plan" className="space-y-6">
                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Day Plan")?.length > 0 &&
                                    <>
                                        <Accordion type="single" collapsible className="w-full">
                                            {packageDetails.info?.filter((info) => info.typeOfSelection === "Day Plan")?.map((day) => (
                                                <AccordionItem key={day._id} value={`day-${day.selectionTitle}`} className="my-4 border-black">
                                                    <AccordionTrigger className="text-left px-4 rounded-xl hover:no-underline">
                                                        <div>
                                                            <span className="font-bold text-lg">{day.selectionTitle}</span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="py-2 px-6 prose max-w-none leading-none">
                                                            {day.selectionDesc ? (
                                                                <div dangerouslySetInnerHTML={{ __html: day.selectionDesc }}></div>
                                                            ) : (
                                                                <p>No description available</p>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </>
                                }
                            </TabsContent>

                            <TabsContent value="Include/Exclude" className="space-y-8">
                                {/* Inclusions & Exclusions */}
                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Inclusions").length > 0 && (
                                    <div className="flex md:flex-row flex-col items-start justify-evenly gap-6">
                                        {/* Inclusions */}
                                        <div className="w-full overflow-x-auto">
                                            <h3 className="text-2xl font-bold mb-4 text-center">Inclusions</h3>
                                            <table className="min-w-full table-auto border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border px-4 py-2 text-left">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {packageDetails.info
                                                        ?.filter((info) => info.typeOfSelection === "Inclusions")
                                                        ?.map((item, index) => (
                                                            <tr key={index} className="border-t">

                                                                <td className="border px-4 py-2 text-left">
                                                                    {item.selectionDesc ? (
                                                                        <div dangerouslySetInnerHTML={{ __html: item.selectionDesc }}></div>
                                                                    ) : (
                                                                        <span>No description available</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Exclusions */}
                                        <div className="w-full overflow-x-auto">
                                            <h3 className="text-2xl font-bold mb-4 text-center">Exclusions</h3>
                                            <table className="min-w-full table-auto border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border px-4 py-2 text-left">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {packageDetails.info
                                                        ?.filter((info) => info.typeOfSelection === "Exclusions")
                                                        ?.map((item, index) => (
                                                            <tr key={index} className="border-t">

                                                                <td className="border px-4 py-2 text-left">
                                                                    {item.selectionDesc ? (
                                                                        <div dangerouslySetInnerHTML={{ __html: item.selectionDesc }}></div>
                                                                    ) : (
                                                                        <span>No description available</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="AdditionalInformation" className="space-y-8">
                                {/* FAQs */}
                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Frequently Asked Questions").length > 0 && <div>
                                    <Accordion type="single" collapsible className="w-full">
                                        {packageDetails.info?.filter((info) => info.typeOfSelection === "Frequently Asked Questions")?.map((faq, index) => (
                                            <AccordionItem key={index} value={`faq-${index}`} className="border-black">
                                                <AccordionTrigger className="text-left text-lg !no-underline font-bold  px-4 rounded-xl">{faq.selectionTitle}</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="py-2 px-6 text-base whitespace-pre-line  prose max-w-none leading-none custom-desc-list ">
                                                        {faq.selectionDesc ? (
                                                            <div dangerouslySetInnerHTML={{ __html: faq.selectionDesc }}></div>
                                                        ) : (
                                                            <p>No description available</p>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>}
                                {/* Important Information */}
                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Important Information").length > 0 && <div className="">
                                    <div className="p-1">
                                        <div className="flex items-start">
                                            <Accordion type="single" collapsible className="w-full">
                                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Important Information")?.map((info, index) => (
                                                    <AccordionItem key={index} value={`info-${index}`} className="border-yellow-400">
                                                        <AccordionTrigger className="text-left text-lg hover:no-underline">{info.selectionTitle}</AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="py-2 px-6 text-base whitespace-pre-line">
                                                                {info.selectionDesc ? (
                                                                    <div dangerouslySetInnerHTML={{ __html: info.selectionDesc }}></div>
                                                                ) : (
                                                                    <p>No description available</p>
                                                                )}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    </div>
                                </div>}

                                {/* Other */}
                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Other").length > 0 && <div className="">
                                    <div className="p-1">
                                        <div className="flex items-start">
                                            <Accordion type="single" collapsible className="w-full">
                                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Other")?.map((info, index) => (
                                                    <AccordionItem key={index} value={`info-${index}`} className="border-black">
                                                        <AccordionTrigger className="text-left text-lg hover:no-underline">{info.selectionTitle}</AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="py-2 px-6 text-base whitespace-pre-line  prose max-w-none leading-none custom-desc-list ">
                                                                {info.selectionDesc ? (
                                                                    <div dangerouslySetInnerHTML={{ __html: info.selectionDesc }}></div>
                                                                ) : (
                                                                    <p>No description available</p>
                                                                )}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    </div>
                                </div>}
                            </TabsContent>

                            <TabsContent value="PolicyContent" className="space-y-8">
                                {/* Policies */}
                                {packageDetails.info?.filter((info) => info.typeOfSelection === "Policy Content").length > 0 && <div>
                                    <h3 className="text-2xl font-bold mb-4 px-2"></h3>
                                    <div className="space-y-4 px-2">
                                        {packageDetails.info?.filter((info) => info.typeOfSelection === "Policy Content")?.map((policy, index) => (
                                            <div key={index}>
                                                <h4 className="font-bold text-lg px-5 mb-3">{policy.selectionTitle}</h4>
                                                {policy.selectionDesc.split("\n")?.map((line, lineIndex) => (
                                                    line ? (
                                                        <p key={lineIndex} className="text-gray-700 whitespace-pre-line px-6  prose max-w-none leading-none custom-desc-list ">
                                                            <span dangerouslySetInnerHTML={{ __html: line }}></span>
                                                        </p>
                                                    ) : (
                                                        <p key={lineIndex} className="text-gray-700 whitespace-pre-line px-6"></p>
                                                    )
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>}
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-6">
                                {/* Write Review Form */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-4">• Write a Review</h3>
                                    <ReviewForm user={sanitizedUser} packageName={packageDetails.packageName} packageId={packageDetails._id} />
                                </div>

                                <div className="flex md:flex-row flex-col justify-between md:items-center">
                                    <h3 className="text-2xl font-bold">• Customer Reviews</h3>
                                    <div className="flex items-center">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        <span className="ml-1 font-bold">{avgRating || 0}</span>
                                        <span className="ml-1 text-gray-500">({reviews.filter((review) => review.approved === true).length || 0} reviews)</span>
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {reviews.filter((review) => review.approved === true).length > 0 ? reviews?.filter((review) => review.approved === true)?.map((review, index) => (
                                        <Card key={index}>
                                            <CardContent>
                                                <div className="mt-4">
                                                    <h4 className="font-semibold">{review.user.name}</h4>
                                                    <div className="flex items-center mt-1">
                                                        {[...Array(5)]?.map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                                            />
                                                        ))}
                                                        <span className="ml-2">({review.rating}.0)</span>
                                                        <span className="ml-2 text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                                    </div>
                                                    <p className="mt-4 text-gray-700 italic">{review.message}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <div className="flex flex-col justify-center items-center pb-4 min-h-[20rem]">
                                            <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
                                            <h4 className="font-semibold text-lg text-center">No Reviews</h4>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Gallery */}
                        {packageDetails?.gallery?.length > 0 &&
                            <div className="px-2 md:px-8 py-6 mt-5 md:mt-10">
                                <h3 className="text-2xl font-bold mb-4 px-2 text-center"> Glimpse of a package</h3>
                                <p className="text-gray-900 font-barlow my-4 px-6 text-center w-[80%] mx-auto">
                                    Step Inside Our World – Explore Our Gallery to see the latest trending packages, customer favorites, and behind-the-scenes moments. From curated collections to exclusive glimpses of what’s in store, every image tells a story of style, quality, and innovation. Get inspired, get excited – and get ready to experience it for yourself.
                                </p>
                                <PackageGallery images={packageDetails.gallery} />
                            </div>
                        }
                        {/* You Might Also Like */}
                        {packages.length > 0 && <div className="px-2 md:px-8 py-6 mt-10 md:mt-3">
                            <h3 className="text-2xl font-bold mb-4 px-2 text-center">You Might Also Like</h3>
                            <p className="text-gray-900 font-barlow my-4 px-6 text-center w-[80%] mx-auto">
                                Discover the Best with Trending Packages – Handpicked deals that are hot today and gone tomorrow! Whether you're looking for top-rated experiences, exclusive products, or unbeatable services, our curated selection brings you the finest offers, updated daily. Don’t miss out – explore what’s trending now and elevate your day with the best!
                            </p>
                            <PackageCarouselWrapper
                                packages={JSON.parse(JSON.stringify(packages))}
                                formatNumeric={formatNumeric.toString()}
                            />
                        </div>}

                        {/* Be a part of spiritual journey */}
                        <section className="px-2">
                            <h3 className="font-bold text-2xl md:text-2xl text-center mt-7">Be a part of a spiritual journey.</h3>
                            <p className="text-gray-900 py-8 text-center font-barlow  w-[80%] mx-auto">
                                YatraZone is more than just a travel company; we are facilitators of spiritual exploration and cultural immersion tailored for Indian pilgrims and global adventurers. With years of expertise in pilgrimage tourism within India, we curate authentic and meaningful journeys that resonate with every spiritual seeker.
                                From holy treks in the Himalayas to pilgrimages to ancient temples and sacred sites, we ensure transformative experiences.
                            </p>
                            <FeaturedCarouselWrapper featuredPackages={JSON.parse(JSON.stringify(featuredPackages))} />
                        </section>
                    </div>
                </div>
            </div>
        </SidebarInset>
    )
}

export default PackageDetailsPage