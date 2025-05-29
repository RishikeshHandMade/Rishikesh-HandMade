import Image from "next/image"

const CategoryBanner = ({ title, bannerImage }) => {
  return (
    <div className="relative h-[200px] md:h-[200px] overflow-hidden w-full">
      <Image src={bannerImage} alt={title} quality={100} width={1280} height={720} className="w-full h-full object-cover" priority />
    </div>
  )
}

export default CategoryBanner