"use client"

import { useState, useEffect } from "react"
import { Trash2, ScanSearch, Star, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReviewDetails from "./ReviewDetails"
import toast from "react-hot-toast"

const ManageReviews = ({ reviews }) => {
    const [allReviews, setAllReviews] = useState([])
    const [selectedReview, setSelectedReview] = useState(null)
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0)


    useEffect(() => {
        setAllReviews(reviews.filter((review) => review.approved === false))

        const handleResize = () => {
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const handleApprove = async (id) => {
        const response = await fetch(`/api/saveReviews`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ approved: true, _id: id })
        })
        const data = await response.json()

        if (response.ok) {
            toast.success(data.message, { style: { borderRadius: "10px", border: "2px solid green" } });
            setAllReviews(allReviews.filter((review) => review._id !== id))
        } else {
            toast.error(data.message, { style: { borderRadius: "10px", border: "2px solid red" } });
        }
    }

    const handleReject = async(id) => {
        const response = await fetch(`/api/saveReviews`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id })
        })
        const data = await response.json()

        if (response.ok) {
            toast.success(data.message, { style: { borderRadius: "10px", border: "2px solid green" } });
            setAllReviews(allReviews.filter((review) => review._id !== id))
        } else {
            toast.error(data.message, { style: { borderRadius: "10px", border: "2px solid red" } });
        }

    }

    const handleView = (review) => {
        setSelectedReview(review)
    }

    const handleCloseDialog = () => {
        setSelectedReview(null)
    }


    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)
        }

        if (hasHalfStar) {
            stars.push(
                <div key="half" className="relative">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                </div>,
            )
        }

        return stars
    }

    const renderCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allReviews.length > 0 ? allReviews.map((review, index) => (
                <Card key={review._id} className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="bg-blue-600 p-3 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div>
                                    <p className="font-medium text-sm">{review.user.name}</p>
                                    <div className="flex items-center text-xs text-blue-100">
                                        <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge className="bg-blue-700 hover:bg-blue-700 text-xs">{review.packageName}</Badge>
                        </div>

                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                    {renderStars(review.rating)}
                                    <span className="text-xs text-gray-600 ml-1">({review.rating}.0)</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{review.user.email}</p>
                            </div>

                            <p className="text-sm text-gray-700 line-clamp-2 mb-3">{review.message}</p>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Button onClick={() => handleView(review)} variant="outline" size="sm" className="h-8 flex-1">
                                        <ScanSearch className="w-3 h-3 mr-1" /> View
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleApprove(review._id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-600 border-2 border-green-600 hover:text-green-700 hover:bg-green-600/10 h-8 flex-1"
                                    >
                                        <Check className="w-3 h-3 mr-1" /> Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleReject(review._id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 border-2 border-red-600 hover:text-red-700 hover:bg-red-600/10 h-8 flex-1"
                                    >
                                        <X className="w-3 h-3 mr-1" /> Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )) : "No reviews found."}
        </div>
    )

    return (
        <>
            <div className="my-4 sm:my-8 md:my-20 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[95vw] lg:max-w-full mx-auto bg-blue-100 p-3 sm:p-4 rounded-lg text-center">
                {(reviews.length > 0) ? renderCards() : "No reviews found."}
            </div>

            <ReviewDetails review={selectedReview} onClose={handleCloseDialog} />
        </>
    )
}

export default ManageReviews