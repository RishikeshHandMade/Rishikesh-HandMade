"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ARTISAN_DETAIL_LABELS = [
  "Brand",
  "Material",
  "Bottle Type",
  "Colour",
  "Capacity",
  "Special Feature"
];

const getTableRows = (artisan) => [
  artisan.brand || "Speedex",
  artisan.material || "Stainless Steel",
  artisan.bottleType || "Sipper Bottle",
  artisan.colour || "Black",
  artisan.capacity || "1000 Milliliters",
  artisan.specialFeature || "Shatter Proof, Leak Proof"
];

const BannerSection = () => (
  <div className="w-full bg-[#ff4f00] py-10 flex flex-col items-center justify-center">
    <h1 className="text-5xl md:text-6xl font-extrabold text-center text-[#662100] tracking-wider mb-2">BANNER IMAGE</h1>
    <div className="text-xl md:text-2xl text-black font-semibold">Tag Line</div>
  </div>
);

const LeftTextBlock = () => (
  <div className="bg-black text-white flex flex-col justify-center items-start p-8 h-96 w-full md:w-[30%] mt-4">
    <h2 className="text-4xl font-extrabold mb-4">ARTISAN</h2>
    <div className="text-md font-medium mb-2">Celebrating the Art of Craftsmanship.<br/>Honoring the Hands That Shape Beauty</div>
  </div>
);

const ArtisanCard = ({ card }) => {
  return (
    <div key={card.id} className="relative rounded-2xl shadow-md group transition-all h-full w-[340px] flex flex-col bg-[#fbeff2] overflow-hidden">
      {/* Date Badge */}
      <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
        <span className="bg-white rounded px-3 py-1 text-md font-bold shadow text-gray-800">{card.subtitle}</span>
      </div>
      {/* Card Image */}
      <div className="relative w-full h-96">
        <img
          src={card.image}
          alt={card.name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          style={{ objectFit: 'cover' }}
        />
      </div>
      {/* Card Content Overlay */}
      <div className="absolute left-0 bottom-0 w-full flex justify-between items-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div>
          <Link
            href={`/artisan/${card.id}`}
            className="font-bold text-2xl text-white mb-3 leading-tight drop-shadow-md hover:underline hover:decoration-2 hover:underline-offset-4 transition cursor-pointer"
            title={card.name}
          >
            {card.name}
          </Link>
          <div className="text-md text-white drop-shadow-md">{card.title}</div>
        </div>
        {/* Arrow Button with Socials on Hover */}
        <div className="relative group/arrow">
          <button className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center shadow transition group-hover/arrow:bg-[#e84393] group-hover/arrow:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {/* Social Icons: show on arrow hover */}
          <div className="absolute bottom-12 right-0 flex flex-col gap-4 opacity-0 group-hover/arrow:opacity-100 transition-opacity duration-300 z-30 items-center">
            {card.socials.slice(0, 6).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  `bg-white rounded-full w-12 h-12 flex items-center justify-center shadow hover:bg-gray-100 transition transform translate-y-5 group-hover/arrow:translate-y-0`
                }
                style={{
                  transitionProperty: 'transform, opacity, background-color, box-shadow',
                  transitionDuration: '0.6s',
                  transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
                  transitionDelay: `${i * 60}ms`
                }}
              >
                <img src={s.icon} alt="social" className="w-7 h-7 object-contain" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ArtisanList = () => {
  const [artisan, setArtisan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(4);

  // Fetch Artisan (copied from RandomTourPackageSection)
  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const res = await fetch("/api/createArtisan");
        const data = await res.json();
        if (Array.isArray(data)) {
          setArtisan(data);
        } else if (Array.isArray(data.artisans)) {
          setArtisan(data.artisans);
        } else {
          setArtisan([]);
        }
      } catch (error) {
        setArtisan([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtisan();
  }, []);

  // Prepare visible artisans for carousel
  const visibleArtisans = artisan.slice(0, visible);

  return (
    <div className="w-full min-h-screen bg-white">
      <BannerSection />
      {/* Below banner: left text, right carousel */}
      <div className="w-full max-w-[1500px] mx-auto">
        {/* Row 1: LeftTextBlock + Carousel */}
        <div className="flex flex-col md:flex-row w-full">
          <LeftTextBlock />
          <div className="flex-1 w-full px-2 flex flex-col">
            {/* <h2 className="text-2xl md:text-3xl font-bold mb-8 uppercase text-center md:text-left">Meet Our Artisans</h2> */}
            {isLoading ? (
              <div className="text-center py-16 text-lg">Loading artisans...</div>
            ) : (
              <>
                {/* Desktop Carousel: 4 per row */}
                <div className="hidden md:flex mt-4">
                  <Carousel className="w-full">
                    <CarouselContent className="flex gap-4">
                      {visibleArtisans.map((item, idx) => {
                        const card = {
                          id: item._id || idx,
                          name: `${item.title ? item.title + " " : ""}${item.firstName || ''} ${item.lastName || ''}`.trim() || "Unknown Artisan",
                          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "N/A",
                          image: item.profileImage?.url || item.image || "/bg-custom-1.jpg",
                          title: item.specializations && item.specializations.length > 0 ? item.specializations.join(", ") : "Artisan",
                          subtitle: item.shgName || "",
                          experience: item.yearsOfExperience ? `${item.yearsOfExperience} years experience` : "",
                          location: item.address ? `${item.address.city}, ${item.address.state}` : "",
                          socials: [
                            { icon: "/fb.png", url: item.socialPlugin?.facebook || "#" },
                            { icon: "/insta-Tranparent.webp", url: item.socialPlugin?.instagram || "#" },
                            { icon: "/youtube.webp", url: item.socialPlugin?.youtube || "#" },
                            { icon: "/google.png", url: item.socialPlugin?.google || "#" },
                            { icon: "/website.png", url: item.socialPlugin?.website || "#" }
                          ],
                        };
                        return (
                          <CarouselItem key={card.id} className="pl-5 md:basis-1/2 lg:basis-1/4 min-w-0 snap-start">
                            <ArtisanCard card={card} />
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <div className="flex items-center gap-3 mt-4 justify-center">
                    <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 z-10" />
                    <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
                    </div>
                  </Carousel>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Row 2: Feature Table (full width) */}
        <div className="w-full overflow-x-auto mt-10">
          <table className="w-full max-w-6xl mx-auto border-separate border-spacing-0">
            <tbody>
              {/* Table rows: one per label */}
              {ARTISAN_DETAIL_LABELS.map((label, i) => (
                <tr key={label}>
                  {/* Label column */}
                  <td className="bg-[#f8f5ef] font-semibold text-gray-800 py-2 px-4 text-left min-w-[140px] border-r border-gray-200 whitespace-nowrap" style={{borderTopLeftRadius: i === 0 ? '12px' : '', borderBottomLeftRadius: i === ARTISAN_DETAIL_LABELS.length-1 ? '12px' : ''}}>
                    {label}
                  </td>
                  {/* One column per visible artisan */}
                  {visibleArtisans.map((item, idx) => {
                    // Compose the value for this row
                    const values = getTableRows(item);
                    return (
                      <td key={idx} className="py-2 px-4 text-gray-900 text-left border-r border-gray-200 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2"><span className="inline-block w-4 h-4 text-black align-middle">✔️</span> <span className={i === 4 ? 'font-bold' : ''}>{values[i]}</span></span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Row 3: Load More Button (full width) */}
        {visible < artisan.length && (
          <div className="flex justify-center mt-8">
            <button
              className="bg-black text-white px-16 py-3 rounded font-bold text-lg hover:bg-gray-900 transition"
              onClick={() => setVisible(v => Math.min(v + 4, artisan.length))}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanList;