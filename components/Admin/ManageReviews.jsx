"use client";
import React, { useState, useEffect } from "react";
import ReviewDetails from "./ReviewDetails";
import toast from "react-hot-toast";
import { Switch } from "../ui/switch";


const actionOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Delete", value: "delete" },
];

const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Deleted", value: "deleted" },
    { label: "All", value: "all" },
];

const columns = [
    "Date",
    "Title",
    "Name",
    "Type",
    "Rating",
    "Thumb",
    "Approved",
    "Action",
    "View",
];

function EyeIcon() {
    return (
        <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2 12C4.5 7 12 7 12 7s7.5 0 10 5c-2.5 5-10 5-10 5s-7.5 0-10-5z" /></svg>
    );
}


const ManageReviews = () => {
    const [allReviews, setAllReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedReview, setSelectedReview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [reviewsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    // console.log(allReviews)

    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        filterReviews();
    }, [allReviews, statusFilter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/saveReviews');
            const data = await response.json();
            if (response.ok && data.success) {
                // Ensure all data is properly serialized
                const processedReviews = data.reviews.map(review => ({
                    ...review,
                    // Ensure all object IDs are strings
                    _id: review._id?.toString(),
                    product: review.product?._id ? {
                        _id: review.product._id.toString(),
                        title: review.product.title
                    } : null,
                    artisan: review.artisan?._id ? {
                        _id: review.artisan._id.toString(),
                        name: review.artisan.name
                    } : null,
                    // Ensure thumb is properly formatted
                    thumb: review.thumb?.url ? {
                        url: review.thumb.url,
                        key: review.thumb.key || ''
                    } : null,
                    // Ensure dates are properly formatted
                    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString(),
                    updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : new Date().toISOString()
                }));
                
                setAllReviews(processedReviews);
                setFilteredReviews(processedReviews);
            } else {
                console.error('Failed to fetch reviews:', data.message);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterReviews = () => {
        setFilteredReviews(allReviews);
        setCurrentPage(1);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    useEffect(() => {
        fetchReviews();
    }, [statusFilter]);

    const handleAction = async (id, action) => {
        let method = "PUT";
        let body = { _id: id };
        if (action === "active") {
            body.active = true;
            body.deleted = false;
        }
        if (action === "inactive") {
            body.active = false;
            body.deleted = false;
        }
        if (action === "delete") {
            method = "DELETE";
            body = { _id: id };
        }
        try {
            const res = await fetch(`/api/saveReviews`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                fetchReviews();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Action failed!");
        }
    };

    // Toggle handlers for Switches
    const handleToggleApproved = async (review) => {
        try {
            const isApproving = !review.approved;
            const res = await fetch(`/api/saveReviews`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    _id: review._id, 
                    approved: isApproving,
                    // Only create promotion when approving an artisan review
                    createPromotion: isApproving && review.type === 'artisan' && review.artisan?._id
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                if (isApproving && review.type === 'artisan') {
                    toast.success('Promotion created for this review');
                }
                fetchReviews();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Approval error:', error);
            toast.error("Action failed!");
        }
    };
    // Pagination logic
    const indexOfLast = currentPage * reviewsPerPage;
    const indexOfFirst = indexOfLast - reviewsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
    // console.log(currentReviews)
    return (
        <div className="w-full max-w-[1100px] mx-auto rounded-[14px] shadow-md px-4 py-6 md:py-8">
            {/* Filter Row */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
                <div className="flex-1">
                    <div className="my-4 flex items-center">
                        <label htmlFor="status-select" className="font-medium mr-2">Show:</label>
                        <select
                            id="status-select"
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* <option value="pending">Pending Reviews</option>
                            <option value="approved">Approved Reviews</option>
                            <option value="all">All Reviews</option> */}

                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col} className="py-3 px-4 border border-black  font-semibold text-left text-base">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-6">Loading...</td>
                            </tr>
                        ) : currentReviews.length > 0 ? (
                            currentReviews.map((review) => (
                                <tr key={review._id} className="hover:bg-gray-100 transition">
                                    {/* Date */}
                                    <td className="align-middle min-w-[150px] px-5">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : "-"}</td>
                                    {/* Title */}
                                    <td className="align-middle truncate max-w-[180px] px-5">{review.title || '-'}</td>
                                    {/* Name */}
                                    <td className="align-middle min-w-[120px] px-5">{review.name || '-'}</td>
                                    {/* Type */}
                                    <td className="align-middle px-5">{review.type || '-'}</td>
                                    {/* Rating */}
                                    <td className="align-middle px-5">{review.rating || '-'}</td>
                                    {/* Thumb */}
                                    <td className="align-middle px-5">
                                        {review.thumb && review.thumb.url ? (
                                            <img
                                                src={review.thumb.url}
                                                alt="thumb"
                                                className="w-10 h-10 object-cover rounded border shadow"
                                            />
                                        ) : '-'}
                                    </td>
                                    {/* Approved */}
                                    <td className="align-middle px-5">
                                        <Switch
                                            checked={!!review.approved}
                                            onCheckedChange={() => handleToggleApproved(review)}
                                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                        />
                                    </td>
                                    {/* Active
                                    <td className="align-middle px-5">
                                        <Switch
                                            checked={review.active !== false}
                                            onCheckedChange={() => handleToggleActive(review)}
                                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                        />
                                    </td> */}
                                    {/* Action Dropdown */}
                                    <td className="align-middle px-5">
                                        <div className="relative">
                                            <select
                                                onChange={e => handleAction(review._id, e.target.value)}
                                                defaultValue=""
                                                className="px-2 py-1 rounded border focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="" disabled>Action</option>
                                                {actionOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    {/* View */}
                                    <td className="align-middle px-5">
                                        <button className="icon-btn hover:bg-gray-200 rounded p-1" onClick={() => setSelectedReview(review)}>
                                            <EyeIcon size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-6">No reviews found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="reviewlog-pagination-row">
                    <div className="pagination">
                        <button className="icon-btn" aria-label="Prev" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                className={`page-btn${num === currentPage ? " active" : ""}`}
                                onClick={() => setCurrentPage(num)}
                            >
                                {num}
                            </button>
                        ))}
                        <button className="icon-btn" aria-label="Next" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                        </button>
                    </div>
        </div>
        )}

        {/* Modal for review details */}
        {selectedReview && (
            <ReviewDetails
                review={selectedReview}
                onClose={() => setSelectedReview(null)}
                onUpdate={fetchReviews}
                onAction={handleAction}
            />
        )}

        {/* Styles (copied from ManageReviewLog for consistency) */}

    </div>
);
    
};

export default ManageReviews;