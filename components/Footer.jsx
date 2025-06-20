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
                console.error("Error fetching pages:", error)
            }
        }
        fetchPages()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value.trim(); // Get the input value
        if (!email) {
            return toast.error("Please Enter Your Email", { style: { borderRadius: "10px", border: "2px solid red" } });
        }
        toast.success("Thank you for Subscribing!", { style: { borderRadius: "10px", border: "2px solid green" } });
        e.target.reset(); // Reset the form
    };


    return (
        <footer className={`print:hidden ${pathName.includes('admin') && 'hidden'}
         ${pathName.includes('artisan') && 'block'} 
        ${pathName.includes('product') && 'block'} ${pathName.includes('customEnquiry') && 'hidden'} ${pathName.includes('checkout') && 'hidden'}  ${pathName.includes('category') && 'block'} 
        bg-black text-white py-4`}>
            <div className="w-full flex justify-center pb-8">
                <div className="h-[3px] bg-gray-300 w-full mx-auto px-4" />
            </div>
            <div className="flex flex-wrap lg:justify-between px-10 justify-start md:gap-20 lg:gap-0 gap-12 max-w-[22rem] md:maxw-[45rem] lg:max-w-[60rem] xl:max-w-6xl mx-auto">
                <div className="flex flex-col gap-2 px-5">
                    <h1 className="font-semibold text-xl my-4">Main Menu</h1>
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
                </div>

                <div className="flex flex-col gap-8">
                    <div>
                        <h1 className="font-semibold text-xl flex items-center gap-2"><Phone className="text-blue-600" /> More Inquiry</h1>
                        <Link href={'tel:+917351009107'} className="my-2 block rounded-full px-5 py-1 font-barlow text-white  ">
                            +91 7351009107
                        </Link>
                    </div>
                    <div>
                        <h1 className="font-semibold text-xl flex items-center gap-2"><Send className="text-blue-600" /> Send Mail</h1>
                        <Link href={'mailto:info@rishikeshhandmade.com'} className="my-2 block rounded-full px-5 font-barlow text-white ">
                            info@rishikeshhandmade.com
                        </Link>
                        <Link href={'mailto:rishikeshhandmade@gmail.com'} className="my-2 block rounded-full px-5 font-barlow text-white ">
                            rishikeshhandmade@gmail.com
                        </Link>
                        <Link href={'mailto:sale@rishikeshhandmade.com'} className="my-2 block rounded-full px-5 font-barlow text-white ">
                            sale@rishikeshhandmade.com
                        </Link>
                        <Link href={'mailto:support@rishikeshhandmade.com'} className="my-2 block rounded-full px-5 font-barlow text-white ">
                            support@rishikeshhandmade.com
                        </Link>
                    </div>
                    <div>
                        <h1 className="font-semibold text-xl flex items-center gap-2"><MapPin className="text-blue-600" /> Address</h1>
                       <p className="my-2 px-5 font-barlow text-white mb-5">Upper Road Dhalwala (Rishikesh) 
                        <br />
                        Tehri Garhwal,Uttarakhand 249201
                       </p>
                    </div>
                </div>
            </div>
            {/* Accordance Section */}
            <div className="w-full flex justify-center">
                <div className="w-[85%]">
                    <Accordion type="single" collapsible className="bg-[#fff] rounded-md  mb-8">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-black px-6 py-4 text-base ">#AGREEMENT : IMPORTANT NOTICE</AccordionTrigger>
                            <AccordionContent className="text-gray-900 px-6 pb-6 pt-1 text-sm">
                                By accessing, using, browsing or booking through our Web Site(s) or Directly or Indirectly through YatraZone: Your Spiritual Travel Solution or its representative(s), you agree that you have read, understood and agree to be bound by these terms and conditions and you agree to comply with all applicable laws, rules and regulations. By accepting our booking terms & conditions, user is also agreeing to terms & conditions of the Spiritual Travel, Hotels, aviation services, Airlines, and other associate service provide from us. All Seasons reserves the right to amend, modify, change, cancel, vary or add to these Policies/Rules or the arrangements and content featured on our website at any time without prior notice. Please check our website regularly for updates to Policy/Rules. Any modification to these Policy/Rules that occurs before your departure is considered a part of your reservations agreement with us.<br /><br />
                                *Kindly read T&C Policy and All remarks carefully before making your bookings. Once you made your booking, you bound to accept these Terms and Conditions. The information contained in this Web site is intended solely to provide general information for the personal use of the reader, who accepts full responsibility for its use. We accept no responsibility for any errors or omissions, or for the results obtained from the use of this information. All information in this site is provided "as is," with no guarantee of completeness, accuracy, timeliness, or of the results obtained from the use of this information, and without warranty of any kind, expressed or implied, including, but not limited to warranties of performance, merchantability, and fitness for a particular purpose. Neither shall it any extent substitute for the independent investigations and the sound technical and business judgment of the reader. YatraZone reserves the right to change the terms, conditions, and notices under which the Services are offered through the Website, including but not limited to the charges for the Services provided through the Website. The User shall be responsible for regularly reviewing these terms and conditions.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            <Card className="my-2 px-2 py-8 max-w-xl lg:max-w-4xl xl:max-w-7xl mx-auto">
                <CardContent className="flex flex-col lg:flex-row items-start justify-between">
                    <div className="text-justify">
                        <Image src="/logo.png" width={200} height={100} alt="footer" />
                        <p className="text-gray-500 text-sm lg:w-[40vw] xl:w-[35vw] font-barlow mt-6">Rishikesh Handmade Craft is a platform that celebrates the traditional art and culture of Rishikesh. It showcases eco-friendly, handcrafted items like wooden carvings, paintings, jewelry, and home decor made by skilled local artisans. By supporting this platform, you help preserve age-old crafts and empower local communitiess.</p>
                        <p className="text-gray-500 text-sm lg:w-[40vw] xl:w-[35vw] font-barlow mt-6">Our website is your gateway to the heart of Rishikesh, offering rich and soulful handmade creations crafted by local artisans.</p>
                    </div>
                    <div className="font-barlow mt-10 lg:mt-0">
                        <h1 className="font-semibold text-xl ">Subscribe to our newsletter</h1>
                        <form onSubmit={handleSubmit} className="mt-4 flex items-center px-2 rounded-lg py-1 bg-gray-200">
                            <Input id="email" name="email" type="email" placeholder="Enter your email" className="border-0 focus-visible:ring-0 focus-active:ring-0" />
                            <Button type="submit" className="text-base" variant="contained" size="small" sx={{ ml: 1, mt: 1 }}>Subscribe</Button>
                        </form>
                        <p className="text-gray-500 text-sm lg:w-[30vw] xl:w-[20vw]  mt-6">Stay Informed. Stay Ahead.</p>
                        <p className="text-gray-500 text-sm lg:w-[30vw] xl:w-[23vw]">Subscribe to our newsletter to get the latest updates.</p>
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
            <div className="flex flex-col lg:flex-row items-center justify-center max-w-[25rem] md:max-w-[60rem] xl:max-w-6xl mx-auto font-barlow">
                <p className="text-black text-center my-4 text-white">
                    &copy; <CurrentYear /> <Link href={'/'} className="font-bold text-white">Rishikesh Handmade</Link>. All rights reserved
                </p>
            </div>
        </footer >
    )
}

export default Footer
