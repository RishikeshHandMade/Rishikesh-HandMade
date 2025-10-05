import Image from "next/image"
import Link from "next/link"

const CategoryBanner = ({ title, bannerImage, mainCategory, subCategory }) => {
  return (
    <div className="relative w-full h-[100px] md:h-[400px]">
      {/* Background image */}
      <Image
        src={bannerImage}
        alt={title || mainCategory ||"Category Banner"}
        fill
        className="object-cover w-full h-full"
        quality={100}
        priority
      />
    </div>
  )
}

export default CategoryBanner
