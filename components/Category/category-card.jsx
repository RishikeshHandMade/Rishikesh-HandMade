import Image from "next/image";
import Link from "next/link";

const CategoryCard = ({ category }) => {
  return (
    
      <div className="bg-[#fcf7f1] group w-44 h-52 rounded-xl transition-transform mx-2 my-2 flex flex-col">
        <div className="relative w-full h-52 overflow-hidden rounded-xl mb-2">
          <Image
            src={category.profileImage?.url || "/placeholder.jpeg"}
            alt={category.title}
            fill
            className="object-cover object-top h-full w-full rounded-xl group-hover:-translate-y-3 transition-transform duration-200"
            sizes="176px"
          />
        </div>
        <Link href={category.url || `/category/${category.url || category._id}` }>
        <span className="font-semibold text-start text-gray-800 text-base hover:underline truncate w-full mt-5 px-2">
          {category.title}
        </span>
        </Link>
      </div>
  );
};

export default CategoryCard;