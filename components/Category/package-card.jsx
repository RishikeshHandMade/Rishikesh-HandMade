import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getReviewsById } from "@/actions/GetReviewsById"

const PackageCard = async ({ pkg }) => {
  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number)
  }

  const reviews = await getReviewsById(pkg?._id)
// console.log(reviews)
  const rating = reviews.filter(review => review.approved).reduce((acc, review) => acc + review.rating, 0);
  const averageRating = rating / reviews.length;

  const totalReviews = reviews.filter(review => review.approved).length

  return (
    <div className="bg-white shadow-xl border-2 rounded-xl transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 font-barlow flex flex-col h-full justify-between p-4 relative overflow-hidden group">
      <div className="relative w-full h-48 md:h-42 mb-3  rounded-lg overflow-hidden">
        {pkg?.basicDetails?.thumbnail?.url ? (
          <Image
            src={pkg?.basicDetails?.thumbnail?.url}
            alt={pkg?.packageName}
            width={800}
            height={600}
            quality={50}
            priority
            className="object-cover w-full h-full rounded-lg"
          />
        ) : (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-blue-100 border-2 border-blue-600 text-black px-3 py-1 rounded-full font-semibold z-10">
          ₹<span className="font-bold text-lg">{formatNumber(pkg?.price)}*</span>
        </div>
      </div>
      <div className="p-2 flex flex-col gap-2 flex-1">
        <h3 className="font-bold md:text-lg text-xl line-clamp-2 font-gilda mb-1">{pkg?.packageName}</h3>
        <div className="flex xl:flex-row flex-col xl:items-center justify-between gap-2 font-barlow mb-2">
          <p className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
            <MapPin size={20} /> {pkg?.basicDetails?.location}
          </p>
          <p className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
            <Calendar size={20} /> {pkg?.basicDetails?.duration} Days {pkg?.basicDetails?.duration - 1} Nights
          </p>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="text-gray-700 text-sm mb-2 h-16 overflow-y-auto line-clamp-2"><span dangerouslySetInnerHTML={{ __html: pkg?.basicDetails?.smallDesc }} /></div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="ml-1 text-base font-medium">{averageRating || 0}</span>
            <span className="ml-1 text-sm font-medium text-blue-600">({totalReviews || 0} reviews)</span>
          </div>
          <Link href={`/package/${pkg?._id}`}>
            <Button size="lg" className="bg-blue-600 text-lg uppercase hover:bg-blue-500 rounded-sm">Learn More</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PackageCard