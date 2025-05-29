import Image from "next/image";
import Link from "next/link";

const CategoryCard = ({ category }) => {
  return (
    <Link href={category.url || `/category/${category.url || category._id}` }>
      <div className="flex flex-col items-center justify-center w-40 h-44 bg-white rounded-2xl shadow hover:scale-105 transition-transform cursor-pointer mx-2 my-2">
        <div className="relative w-24 h-24 mb-2">
          <Image
            src={category.banner?.url || "/placeholder.jpg"}
            alt={category.title}
            fill
            className="object-cover rounded-xl"
            sizes="96px"
          />
        </div>
        <span className="font-semibold text-center text-gray-800 text-base truncate w-32">
          {category.title}
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
