
"use client"
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// CategoryCarousel: displays categories in a row carousel (5 per row)
export const CategoryCarousel = ({ categories = [] }) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return <div>No categories found.</div>;
  }
  return (
    <Carousel className={`w-full md:w-[95%] mx-auto my-4 ${categories.length > 0 ? "block" : "hidden"}`}>
      <CarouselContent className="w-full gap-2">
        {categories.map((category, index) => (
          <CarouselItem
            key={index}
            className="pl-5 basis-1/2 md:basis-1/2 lg:basis-1/6 min-w-0 snap-start"
          >
            <CategoryCard category={category} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 p-5" />
      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 p-5" />
    </Carousel>
  );
};


const CategoryCard = ({ category }) => {
  // console.log(category)
  return (

    <div className="group w-40 md:w-52 max-h-72 transition-transform mx-2 my-2 flex flex-col">
      <div className="relative w-full h-60 overflow-hidden rounded-xl mb-2">
        <Image
          src={category.profileImage?.url || "/placeholder.jpeg"}
          alt={category.title}
          fill
          className="object-cover object-top h-full w-full rounded-xl group-hover:-translate-y-3 transition-transform duration-200"
          sizes="176px"
        />
        <Link
          href={category.url || `/category/${category.url}`}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <span className="bg-white text-black font-medium px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Details
          </span>
        </Link>
      </div>
      <Link href={category.url || `/category/${category.url}`}>
        <span className="font-semibold text-start text-gray-800 text-base hover:underline truncate w-full mt-5 px-2">
          {category.title}
        </span>
      </Link>
    </div>
  );
};

export default CategoryCard;