"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const accordionData = [
  {
    title: "What Sets Us Apart:",
    content: "Specialization in Natural Fiber Products: Expertly handcrafted eco-products made from jute, hemp, bamboo, and other sustainable materials. "
  },
  {
    title: "100% Handmade & Authentic:",
    content: "No factory replicas. Every item carries the uniqueness and imperfection of a true handmade creation. "
  },
  {
    title: "Eco-Friendly Commitment:",
    content: "We embrace slow fashion and sustainable living, minimizing waste and avoiding plastic in our packaging and production."
  },
  {
    title: "Fair Trade & Artisan Empowerment:",
    content: "Ethical partnerships that support and uplift local communities, not just profit from them."
  },
  {
    title: "Cultural Soul in Every Product:",
    content: "Each item tells a story — of Rishikesh, its people, and its rich cultural legacy."
  },
];


const WhatWeDo = () => {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="w-full min-h-screen bg-[#fcf7f1]">
      {/* Banner */}
      <div className="relative w-full h-[320px] flex items-center justify-center">
        <Image src="/bg7.jpg" alt="Banner" layout="fill" objectFit="cover" className="z-0 opacity-80" priority />
        <div className="absolute left-[10%] top-10 z-10 container w-fit mx-auto px-4 flex flex-col justify-center h-full bg-white rounded-xl">
          <div className="max-w-2xl flex flex-col items-center justify-center px-10">
            <h1 className="text-3xl  font-semibold text-black mb-2 drop-shadow-lg">The Impact of What We Do How <br /> We Make a Difference</h1>
            {/* <nav aria-label="breadcrumb" className="mb-4">
              <ul className="flex gap-2 text-lg text-white">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li>/</li>
                <li className="text-amber-300">What We Do</li>
              </ul>
            </nav> */}
            <div className="w-96 rounded-lg overflow-hidden shadow-lg">
              <Image src="/pic7.jpg" alt="Intro" width={300} height={300} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="content-inner about-style3 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Side */}
            <div className="lg:w-7/12 w-full">
              <div className=" p-8  mb-8">
                <h4 className="text-2xl md:text-3xl font-bold mb-4 text-amber-700">Bringing you soulful, sustainable art — one handmade piece at a time.</h4>
                <p className="text-base text-gray-700 mb-4">
                  At Rishikesh Handmade Craft, we don’t just sell handmade products — we offer a piece of nature, culture, and community. While many marketplaces source mass-produced or factory-replicated goods, we stay firmly committed to authentic, eco-conscious craftsmanship, with a strong specialization in natural fiber products. <br /><br />
                  Our collections are made using locally sourced, biodegradable materials such as jute, hemp, cotton, bamboo, and banana fiber — all chosen for their minimal environmental impact and natural beauty. These fibers are not only sustainable but also deeply embedded in India’s artisanal traditions, making each product a harmonious blend of heritage and environmental responsibility.<br /><br />
                  Unlike others, we work directly with artisans, ensuring they receive fair wages and continued support. This hands-on, ethical approach allows us to maintain quality, authenticity, and transparency in every step — from sourcing raw materials to the final handcrafted piece you receive.
                </p>

                {/* Accordion */}
                <div className="mt-6">
                  {accordionData.map((item, idx) => (
                    <div key={idx} className="mb-2 border border-gray-200 rounded-lg bg-[#fcf7f1]">
                      <button
                        className={`w-full flex items-center justify-between px-4 py-3 font-semibold text-left text-gray-800 focus:outline-none transition ${openIdx === idx ? 'bg-amber-100' : ''}`}
                        onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                        aria-expanded={openIdx === idx}
                      >
                        <span>{item.title}</span>
                        <span className="ml-2">{openIdx === idx ? '-' : '+'}</span>
                      </button>
                      {openIdx === idx && (
                        <div className="px-4 pb-3 text-gray-700 animate-fade-in">
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center mt-8">
                  <div>
                    <h2 className="text-3xl font-bold text-amber-700">40k+</h2>
                    <span className="block text-gray-700">Happy Customer</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-amber-700">35+</h2>
                    <span className="block text-gray-700">Years in Business</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-amber-700">98%</h2>
                    <span className="block text-gray-700">Return Clients</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Side - keep width fixed and separated */}
            <div className="lg:w-5/12 w-full flex items-center justify-center">
              <div className="w-[100%] min-w-[260px] h-[95%] rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                <Image src="/Rishikesh.jpg" alt="Rishikesh" width={400} height={500} className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Get in Touch Section */}
      <section className="get-in-touch bg-black py-10 flex flex-col md:flex-row items-center justify-between px-4 md:px-24">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold text-white mb-2">Questions ? <span className="block text-lg font-normal">Our experts will help find the gear that’s right for you</span></h3>
        </div>
        <Link href="/contact" className="btn btn-light bg-white text-amber-700 font-bold py-3 px-8 rounded shadow hover:bg-amber-100 transition-all">Get In Touch</Link>
      </section>
    </div>
  );
};

export default WhatWeDo;