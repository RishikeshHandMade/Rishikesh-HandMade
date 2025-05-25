"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const accordionData = [
  {
    title: "What Makes Us Unique?",
    content: `Authentic Handcrafted Products. Every item featured on our platform is 100% handmade, ensuring uniqueness and individuality. No two pieces are exactly the same, making your purchase truly special.`
  },
  {
    title: "Sustainable & Eco-Friendly",
    content: `We prioritize natural, locally sourced materials and environmentally conscious production techniques that minimize waste and reduce our carbon footprint.`
  },
  {
    title: "Empowering Local Artisans",
    content: `By eliminating middlemen, we ensure fair compensation to our artisans, helping them build sustainable livelihoods and encouraging the younger generation to continue their cultural legacy.`
  },
  {
    title: "Cultural Preservation",
    content: `Each product is a piece of Rishikesh’s heritage — infused with spiritual symbolism, traditional techniques, and cultural stories. We aim to keep these traditions alive by providing a platform where they are celebrated and valued.`
  },
  {
    title: "Global Accessibility with Local Roots",
    content: `Whether you’re shopping from India or abroad, our platform brings the soul of Rishikesh to your doorstep with a seamless online shopping experience and reliable worldwide shipping.\n\nAt Rishikesh Handmade Craft, we envision a world where conscious consumerism supports tradition, where handmade replaces mass-produced, and where every purchase carries purpose. When you choose us, you don’t just buy a product — you become a part of a larger story: one of culture, compassion, and community.\n\nThank you for supporting our mission to preserve heritage and empower artisans, one handmade piece at a time.`
  }
];
const teamMembers = [
  { name: "John Doe", role: "CEO & Founder" },
  { name: "Ivan Mathews", role: "iOS Developer" },
  { name: "Macauley Herring", role: "Customer Success" },
  { name: "Alya Levine", role: "CTO" },
  { name: "Rose Hernandez", role: "Backend Developer" },
  { name: "Elen Benitez", role: "Designer" },
];
const AboutMe = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="w-full min-h-screen bg-[#fcf7f1]">
      {/* Banner */}
      <div className="relative w-full h-[280px] flex items-center justify-center bg-secondary overlay-black-light">
        <Image
          src="/bg1.jpg"
          alt="About Banner"
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-80"
          priority
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">About Rishikesh Handmade</h1>
          {/* <nav aria-label="breadcrumb" className="flex justify-center"> */}
            {/* <ul className="flex gap-2 text-lg">
              <li>
                <Link href="/" className="hover:underline">Home</Link>
              </li>
              <li>/</li>
              <li className="text-amber-300">About Me</li>
            </ul> */}
          {/* </nav> */}
        </div>
      </div>

      {/* Main Content */}
      <section className="content-inner py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            {/* Left: Text and Accordion */}
            <div className="lg:w-1/2 flex flex-col justify-center overflow-y-auto">
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">“Rooted in Nature, Crafted by Tradition.”</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Welcome to Rishikesh Handmade Craft — your gateway to the timeless art and culture of Rishikesh. Our platform is dedicated to preserving and promoting the rich heritage of this sacred region by showcasing an exclusive collection of eco-friendly, handcrafted items. From intricate wooden carvings and traditional paintings to artisanal jewelry and elegant home décor, each piece is thoughtfully created by skilled local artisans who carry forward generations of craftsmanship.<br /><br />
                  At Rishikesh Handmade Craft, we believe in more than just selling products — we believe in telling stories. Every item on our platform embodies the soul of Rishikesh, blending natural materials with artistic traditions to create something truly unique and meaningful. By supporting our initiative, you contribute to the empowerment of local communities, the preservation of ancient skills, and the promotion of sustainable living.<br /><br />
                  At Rishikesh Handmade Craft, we are more than just an e-commerce platform — we are a movement to revive, support, and celebrate the timeless heritage of Rishikesh through handcrafted art. Nestled in the foothills of the Himalayas, Rishikesh is a land known not only for its spiritual aura but also for its deeply rooted artistic traditions. Our mission is to bring these soulful creations to a global audience while uplifting the lives of the skilled artisans behind them.<br /><br />
                  We partner directly with local craftsmen and women from Rishikesh and nearby villages who specialize in traditional art forms passed down through generations. These artisans pour their heart and soul into every product — whether it's an intricately carved wooden artifact, a hand-painted canvas, ethically made jewelry, or eco-friendly home décor. Each piece reflects the essence of Indian culture, spirituality, and sustainability.
                </p>
              </div>

              {/* Accordion */}
              <div className="w-full max-w-2xl mx-auto mb-8">
                {accordionData.map((item, idx) => (
                  <div key={idx} className="mb-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <button
                      className={`w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-lg transition focus:outline-none ${openIndex === idx ? 'text-amber-700' : 'text-gray-800'}`}
                      onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                      aria-expanded={openIndex === idx}
                    >
                      <span>{item.title}</span>
                      <span>{openIndex === idx ? '-' : '+'}</span>
                    </button>
                    <div className={`px-6 pb-4 transition-all duration-300 ease-in-out ${openIndex === idx ? 'block' : 'hidden'}`}>                    <p className="text-gray-700 text-base whitespace-pre-line">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Images Grid */}
            <div className="lg:w-1/2 min-h-[600px] h-full flex items-stretch">
              <div className="grid grid-cols-2 gap-4 w-full content-between">
                <div className="col-span-1 row-span-1">
                  <Image src="/A1.jpg" alt="A1" width={500} height={700} className="rounded-lg shadow-lg object-cover w-full h-auto" />
                </div>
                <div className="col-span-1 row-span-1">
                  <Image src="/A2.jpg" alt="A2" width={250} height={200} className="rounded-lg shadow-lg object-cover w-full h-auto" />
                </div>
                <div className="col-span-2 row-span-1">
                  <Image src="/A3.jpg" alt="A3" width={800} height={300} className="rounded-lg shadow-lg object-cover w-full h-auto" />
                </div>
                <div className="col-span-2 row-span-1">
                  <Image src="/A4.jpg" alt="A4" width={800} height={300} className="rounded-lg shadow-lg object-cover w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get In Touch Section */}
      <section className="w-full bg-amber-50 py-12 flex flex-col md:flex-row items-center justify-between px-6 md:px-24 gap-6 border-t">
        <div className="mb-6 md:mb-0">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Questions?
            <span className="block text-lg font-normal text-amber-700">Our experts will help find the gear that’s right for you</span>
          </h3>
        </div>
        <Link href="/contact" className="btn bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition">Get In Touch</Link>
      </section>

         <section className="content-inner py-16">
              <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8 mb-10 items-start">
                  {/* Left: Heading and Paragraph */}
                  <div className="w-full lg:w-[57%]">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 leading-tight">Behind Rishikesh Handmade Craft is a dedicated team of experienced professionals and industry veterans who share a deep passion for traditional Indian craftsmanship.</h2>
                    <p className="text-base text-gray-700 mb-4">
                      Our core team includes expert artisans, designers, curators, and community leaders — many of whom have over 20 years of hands-on experience in the handicraft and cottage industry.
                    </p>
                  </div>
                  {/* Right: Two Images in a row */}
                  <div className="w-full lg:w-[43%] flex flex-row gap-8 items-start justify-center">
                    {/* First Team Member */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-lg bg-[#f6e9da] flex items-center justify-center">
                        <Image src="/pic1_1.jpg" alt="John Doe" width={224} height={224} className="object-cover w-full h-full" />
                        {/* Social Icons Overlay */}
                          {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-white/80 px-4 py-2 rounded-full shadow">
                            <a href="#" className="text-gray-700 hover:text-blue-600"><i className="fab fa-facebook-f" /></a>
                            <a href="#" className="text-gray-700 hover:text-blue-400"><i className="fab fa-twitter" /></a>
                            <a href="#" className="text-gray-700 hover:text-pink-500"><i className="fab fa-instagram" /></a>
                            <a href="#" className="text-gray-700 hover:text-blue-700"><i className="fab fa-linkedin-in" /></a>
                          </div> */}
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-bold text-lg">John Doe</div>
                        <div className="text-xs text-gray-600">CEO & Founder</div>
                      </div>
                    </div>
                    {/* Second Team Member */}
                    <div className="flex flex-col items-center">
                      <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-lg bg-[#d6f0fa] flex items-center justify-center">
                        <Image src="/pic1_1.jpg" alt="Ivan Mathews" width={224} height={224} className="object-cover w-full h-full" />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-bold text-lg">Ivan Mathews</div>
                        <div className="text-xs text-gray-600">iOS Developer</div>
                      </div>
                    </div>
                  </div>
                </div>
      
                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-8 mb-10">
                  {teamMembers.slice(2).map((member, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="flex flex-col items-center">
                      <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-lg bg-[#d6f0fa] flex items-center justify-center">
                        <Image src="/pic1_1.jpg" alt="Ivan Mathews" width={224} height={224} className="object-cover w-full h-full" />
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-bold text-lg">Ivan Mathews</div>
                        <div className="text-xs text-gray-600">iOS Developer</div>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
      
                <div className="mb-10 text-base text-gray-700">
                  These individuals have not only mastered their craft but have also played a pivotal role in shaping the future of local artisans. Through years of dedication, they have created opportunities, launched training initiatives, and set new benchmarks in quality and innovation. Their deep understanding of cultural artistry, sustainable practices, and market trends ensures that every product we offer meets the highest standards while staying true to its roots.
                </div>
      
                {/* Contributions Section */}
                <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Team’s Contributions Include:</h2>
                  <ul className="list-decimal pl-6 text-base text-gray-700 space-y-2">
                    <li><span className="font-bold">Mentoring and Training:</span> Providing skill development and mentorship to hundreds of young and emerging artisans in and around Rishikesh.</li>
                    <li><span className="font-bold">Empowering Communities:</span> Helping local craftspeople access fair markets, increase income, and gain financial independence.</li>
                    <li><span className="font-bold">Innovation with Tradition:</span> Blending ancient techniques with contemporary design to make traditional products appealing to modern audiences.</li>
                    <li><span className="font-bold">Creating Global Milestones:</span> Leading successful exhibitions, collaborations, and export initiatives that brought Rishikesh’s art to global recognition.</li>
                    <li><span className="font-bold">Sustainable Future:</span> Our team is committed to continuing this journey — one that not only preserves heritage but also builds a sustainable future for the artisan community. With their guidance and expertise, Rishikesh Handmade Craft continues to be a trusted bridge between tradition and the global marketplace.</li>
                  </ul>
                </div>
              </div>
            </section>
    </div>
  );
};

export default AboutMe;