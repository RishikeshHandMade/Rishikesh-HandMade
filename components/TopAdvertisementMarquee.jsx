"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function TopAdvertisementMarquee() {
  const [banners, setBanners] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/topAdvertismentBanner");
        const data = await response.json();
        const activeBanners = data.filter((b) => b.isActive !== false);
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching top advertisements:", error);
      }
    };
    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="bg-orange-500 overflow-hidden w-[70%] py-[6px]">
      <div
        className="relative flex h-10 md:h-8 items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Marquee container */}
        <div
          className="flex whitespace-nowrap animate-marquee"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            padding: "0 1rem",
          }}
        >
          {/* Original banners */}
          {banners.map((b) => (
            <span
              key={b._id}
              className="inline-flex items-center px-2 md:px-6 text-white whitespace-nowrap"
            >
              <Link
                href={b.buttonLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm md:text-base hover:underline"
              >
                {b.title}
              </Link>
            </span>
          ))}

          {/* Duplicate banners for smooth looping (works on all screens now) */}
          {banners.map((b) => (
            <span
              key={`dup-${b._id}`}
              className="inline-flex items-center px-2 md:px-6 text-white whitespace-nowrap"
            >
              <Link
                href={b.buttonLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm md:text-base hover:underline"
              >
                {b.title}
              </Link>
            </span>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
          display: flex;
          align-items: center;
          min-width: max-content;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .animate-marquee {
            animation-duration: 40s;
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
