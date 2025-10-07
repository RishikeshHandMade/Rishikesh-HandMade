'use client'

import { Handshake, Phone, Send, MapPin } from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "./ui/card"
import Image from "next/image"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import toast from "react-hot-toast"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion"
import CurrentYear from './CurrentYear';
const Footer = () => {
    const pathName = usePathname()
    const [pages, setPages] = useState([])

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await fetch("/api/getAllPages")
                const data = await response.json()
                setPages(data.pages)
            } catch (error) {
                // console.error("Error fetching pages:", error)
            }
        }
        fetchPages()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value.trim();
        if (!email) {
            return toast.error("Please Enter Your Email", { style: { borderRadius: "10px", border: "2px solid red" } });
        }
        try {
            const res = await fetch('/api/newsLetter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Thank you for Subscribing!", { style: { borderRadius: "10px", border: "2px solid green" } });
                e.target.reset();
            } else {
                toast.error(data.message || "Subscription failed.", { style: { borderRadius: "10px", border: "2px solid red" } });
            }
        } catch {
            toast.error("An error occurred.", { style: { borderRadius: "10px", border: "2px solid red" } });
        }
    };

    return (
        <footer className={`print:hidden ${pathName.includes('admin') && 'hidden'}
         ${pathName.includes('artisan') && 'block'} ${pathName.includes('product') && 'block'} ${pathName.includes('customEnquiry') && 'hidden'} ${pathName.includes('checkout') && 'hidden'}  ${pathName.includes('category') && 'block'} bg-black text-white py-4`}>
            <div className="hidden md:flex flex-wrap lg:justify-between px-10 justify-start md:gap-20 lg:gap-0 gap-12 max-w-[22rem] md:maxw-[45rem] lg:max-w-[60rem] xl:max-w-6xl mx-auto">
                <div className="flex flex-col gap-2 px-5">
                    <h1 className="font-semibold text-xl my-4">Main Menu</h1>
                    <Link href={'/'} className="block text-white font-barlow ">Home</Link>
                    {pages.filter(page => !page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="block text-white font-barlow ">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/contact'} className="block text-white font-barlow ">Contact</Link>
                </div>

                <div className="flex flex-col gap-2 px-6">
                    <h1 className="font-semibold text-xl my-4">Our Policy</h1>
                    {pages.filter(page => page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="block text-white font-barlow">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/faq'} className="block text-white font-barlow ">FAQ</Link>
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="font-semibold text-xl flex items-center gap-2"> More Inquiry</h1>
                    <div className="flex items-start gap-2">
                        <Link href={'tel:+919411571947'} className="my-2 text-sm rounded-full py-1 font-barlow text-white flex items-center gap-2">
                            <Phone size={20} className="text-blue-600" />
                            +91 9411571947
                        </Link>
                        <Link href={'tel:+917351009107'} className="my-2 text-sm rounded-full py-1 font-barlow text-white flex items-center gap-2">
                            +91 7351009107
                        </Link>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="py-2">
                            <Send className="text-blue-600" size={20} />
                        </div>
                        <div className="flex items-start flex-col gap-1">
                            <Link href={'mailto:support@rishikeshhandmade.com'} className="rounded-full font-barlow text-white flex items-center gap-2">
                                rishikeshhandmade@gmail.com
                            </Link>
                            <Link href={'mailto:Support@rishikeshhandmade.com'} className=" rounded-full font-barlow text-white flex items-center gap-2">
                                Support@rishikeshhandmade.com
                            </Link>
                            <Link href={'mailto:Info@rishikeshhandmade.com'} className="rounded-full font-barlow text-white flex items-center gap-2">
                                Info@rishikeshhandmade.com
                            </Link>
                            <Link href={'mailto:Sales@rishikeshhandmade.com'} className="rounded-full font-barlow text-white flex items-center gap-2">
                                Sales@rishikeshhandmade.com
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-start flex-row gap-2 py-2">
                    <div className="py-2">

                        <MapPin className="text-blue-600" size={20} />
                    </div>
                    <div className="flex items-start flex-col gap-2">
                        <p className="gap-2 font-barlow text-white flex items-start">
                            <span className="font-semibold">Corporate
                                <br />
                                Address :
                            </span> Upper Road Dhalwala (Rishikesh)
                            <br />
                            Tehri Garhwal,Uttarakhand 249137
                        </p>
                      
                    </div>
                </div>
                </div>
            </div>
            <div className="md:hidden flex items-center gap-2 justify-start px-5">
                <div className="flex flex-col gap-2 px-2">
                    <h1 className="font-semibold text-xl my-4">Main Menu</h1>
                    <Link href={'/'} className="block text-white font-barlow ">Home</Link>
                    {pages.filter(page => !page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="text-sm block text-white font-barlow ">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/contact'} className="text-sm block text-white font-barlow ">Contact</Link>
                </div>

                <div className="flex flex-col gap-2 px-2">
                    <h1 className="font-semibold text-xl my-4">Our Policy</h1>
                    {pages.filter(page => page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="text-sm block text-white font-barlow">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/faq'} className="text-sm block text-white font-barlow ">FAQ</Link>
                </div>
            </div>
            <div className="md:hidden flex flex-col gap-1 p-5">
                <h1 className="font-semibold text-xl flex items-center gap-2"> More Inquiry</h1>
                <div className="flex items-start gap-2">
                    <Link href={'tel:+919411571947'} className="my-2 text-sm rounded-full py-1 font-barlow text-white flex items-center gap-2">
                        <Phone size={20} className="text-blue-600" />
                        +91 9411571947
                    </Link>
                    <Link href={'tel:+917351009107'} className="my-2 text-sm rounded-full py-1 font-barlow text-white flex items-center gap-2">
                        +91 7351009107
                    </Link>
                </div>
                <div className="flex items-start gap-2">
                    <div className="py-2">
                        <Send className="text-blue-600" size={20} />
                    </div>
                    <div className="flex items-start flex-col gap-1">
                        <Link href={'mailto:support@rishikeshhandmade.com'} className="rounded-full font-barlow text-white flex items-center gap-2">
                            rishikeshhandmade@gmail.com
                        </Link>
                        <Link href={'mailto:Support@rishikeshhandmade.com'} className=" rounded-full font-barlow text-white flex items-center gap-2">
                            Support@rishikeshhandmade.com
                        </Link>
                        <Link href={'mailto:Info@rishikeshhandmade.com'} className="rounded-full font-barlow text-white flex items-center gap-2">
                            Info@rishikeshhandmade.com
                        </Link>
                        <Link href={'mailto:Sales@rishikeshhandmade.com'} className="rounded-full font-barlow text-white flex items-center gap-2">
                            Sales@rishikeshhandmade.com
                        </Link>
                    </div>
                </div>
                <p className="my-2 text-sm font-barlow text-white mb-5 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={20} />
                    Corporate & Store Address:

                    <br />
                    Upper Road Dhalwala (Rishikesh)
                    Tehri Garhwal,Uttarakhand 249137
                </p>
            </div>

            {/* Accordance Section */}
            <div className="w-full flex justify-center my-4">
                <div className="w-[85%]">
                    <Accordion type="single" collapsible className="bg-[#fff] rounded-md  mb-8">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-black px-6 py-4 text-base ">IMPORTANT NOTICE</AccordionTrigger>
                            <AccordionContent className="text-gray-900 px-6 pb-6 pt-1 text-sm space-y-3">
                                <p>
                                    <strong>Purchasing Policy</strong><br />
                                    At Rishikesh Handmade Craft, we strive to offer a seamless and secure shopping experience. Our purchasing policy outlines everything you need to know when placing an order with us.
                                </p>

                                <ul className="list-disc list-inside space-y-2">
                                    <li>
                                        <strong>1. Product Availability</strong><br />
                                        We aim to keep our inventory up-to-date. However, due to demand, some items may go out of stock. In such cases:
                                        <ul className="list-disc list-inside ml-4">
                                            <li>You will be notified promptly.</li>
                                            <li>We may offer an alternative or initiate a full refund as per your preference.</li>
                                        </ul>
                                    </li>

                                    <li>
                                        <strong>2. Order Placement</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>Select your items and proceed to checkout.</li>
                                            <li>Provide accurate billing and shipping details.</li>
                                            <li>Complete payment through our secure gateway.</li>
                                        </ul>
                                        <p className="ml-4">Note: Orders with incomplete or incorrect information may be delayed or canceled.</p>
                                    </li>

                                    <li>
                                        <strong>3. Payment Methods</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>Credit/Debit Cards (Visa, MasterCard, etc.)</li>
                                            <li>UPI / Wallets / Net Banking (for India)</li>
                                            <li>PayPal / Razorpay / Stripe (International Orders)</li>
                                        </ul>
                                        <p className="ml-4">All transactions are encrypted and 100% secure.</p>
                                    </li>

                                    <li>
                                        <strong>4. Order Confirmation</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>You will receive an email confirmation with your order number and details.</li>
                                            <li>A separate email will be sent once the order is dispatched, along with tracking info.</li>
                                        </ul>
                                    </li>

                                    <li>
                                        <strong>5. Pricing & Taxes</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>All prices are listed in [INR/USD] and include applicable taxes unless otherwise stated.</li>
                                            <li>Shipping charges, if any, will be calculated at checkout based on location and package size.</li>
                                            <li>Promotional discounts cannot be combined unless explicitly stated.</li>
                                        </ul>
                                    </li>

                                    <li>
                                        <strong>6. Cancellations</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>You may cancel your order within 12 hours of placing it or before shipment.</li>
                                            <li>Once dispatched, orders cannot be canceled. Please refer to our Return Policy instead.</li>
                                        </ul>
                                    </li>

                                    <li>
                                        <strong>7. Fraud Prevention</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>We may verify orders manually for high-value purchases.</li>
                                            <li>We reserve the right to cancel orders suspected of fraudulent activity, with or without notice.</li>
                                        </ul>
                                    </li>

                                    <li>
                                        <strong>8. Bulk or Custom Orders</strong><br />
                                        We welcome bulk purchases or custom requests<br />
                                        Contact our team at support@rishikeshhandmade.com for quotations and lead times.
                                    </li>

                                    <li>
                                        <strong>9. Customer Support</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            <li>📧 Email: support@rishikeshhandmade.com</li>
                                            <li>☎ Call/WhatsApp:                                          +91 9411571947,
                                            +91 7351009107
                                            </li>
                                            <li>🕒 Hours: Monday to Saturday, 10:00 AM – 6:00 PM IST</li>
                                        </ul>
                                    </li>

                                    <li>
                                        <strong>10. Acceptance of Policy</strong><br />
                                        By placing an order on our website, you agree to the terms outlined in this Purchasing Policy.
                                    </li>
                                </ul>
                            </AccordionContent>

                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            <Card className="my-2 px-2 py-8 max-w-xl lg:max-w-4xl xl:max-w-7xl mx-auto">
                <CardContent className="flex flex-col lg:flex-row items-start justify-between">
                    <div className="text-justify">
                        <Image src="/logo.png" width={200} height={100} alt="footer" />
                        <p className="text-black text-sm lg:w-[40vw] xl:w-[35vw] font-barlow mt-6">Rishikesh Handmade Craft is a platform that celebrates the traditional art and culture of Rishikesh. It showcases eco-friendly, handcrafted items like wooden carvings, paintings, jewelry, and home decor made by skilled local artisans. By supporting this platform, you help preserve age-old crafts and empower local communities.</p>
                        <p className="text-black text-sm lg:w-[40vw] xl:w-[35vw] font-barlow mt-6">Our website is your gateway to the heart of Rishikesh, offering rich and soulful handmade creations crafted by local artisans.</p>

                    </div>
                    <div className="font-barlow mt-10 lg:mt-0">
                        <h1 className="font-semibold text-xl ">Subscribe to our newsletter</h1>
                        <form onSubmit={handleSubmit} className="mt-4 flex overflow-hidden rounded-lg bg-gray-200">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                className="border-0 rounded-none focus:ring-0 focus-visible:ring-0 focus:outline-none bg-gray-200"
                            />
                            <button
                                type="submit"
                                className="bg-red-600 text-white text-sm p-2 h-full"
                            >
                                Subscribe
                            </button>
                        </form>


                        <p className="text-black text-sm lg:w-[30vw] xl:w-[20vw]  mt-6">Stay Informed. Stay Ahead.</p>
                        <p className="text-black text-sm lg:w-[30vw] xl:w-[23vw]">Subscribe to our newsletter to get the latest updates.</p>
                    </div>
                </CardContent>
                <CardFooter className="mt-8 flex flex-col items-start md:w-fit">
                    <div className="w-full h-[1px] bg-gray-400" />
                    <div className="flex items-center justify-between font-barlow">
                        <div className="flex flex-col md:flex-row items-start  md:items-center gap-2">
                            <Link href={'/terms-condition'} className="0 !text-sm font-semibold">Terms of Use</Link>
                            <p className="text-gray-900 md:block hidden">|</p>
                            <Link href={'/privacy-policy'} className="0 !text-sm font-semibold">Privacy and Cookies Policy</Link>
                        </div>
                    </div>
                </CardFooter>
            </Card>
            <div className="max-w-[25rem] md:max-w-[60rem] xl:max-w-7xl mx-auto font-barlow">
                <p className="text-white text-center text-sm">Buy Handicraft and Handloom Items Online | Home and Living Products for Sale | Buy Handloom and Handicraft Items | Handmade Home Décor and Utility for Sale | Buy Home Decor Items Online | Handloom Cushions Online | Buy Handmade Bhimal And Jute Accessories |  Handmade Handicraft Accessories for Sale | Handmade Floor Coverings Jute Bhimal Foot Door Mat Online Sale | Handmade Religious Items for Sale Online | Buy Handmade Jute Bhimal Woolen Footwear | Buy Handmade Jute Slippers  Footwear | Handcrafted Lighting Items Online | Handmade Office Stationery Jute File Folder  Items for Sale | Jute Bags for Shopping</p>
                <p className="text-white font-bold text-center my-4">
                    &copy; <CurrentYear /> <Link href={'/'} className="font-bold text-white">Rishikesh Handmade</Link>. All rights reserved
                </p>
            </div>
        </footer >
    )
}

export default Footer
