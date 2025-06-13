"use client";
import { useState } from "react";

import React from "react";

export default function ProductInfoTabs({ product }) {
    // Example: dynamic tab data from API/product object
    let tabs = [];
    // Collect reviews from product.reviews (array of objects)
    const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

    // Static Reviews Tab with dynamic data
    // State for expanded reviews (array of booleans)
    const [expandedReviews, setExpandedReviews] = useState([]);
    const MAX_HEIGHT = 60; // px, adjust as needed

    const handleReadMore = (idx) => {
        setExpandedReviews(prev => {
            const next = [...prev];
            next[idx] = true;
            return next;
        });
    };

    // Add Review Button and Form State
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [localReviews, setLocalReviews] = useState(reviews);
    const [form, setForm] = useState({
        rating: 0,
        title: '',
        createdBy: '',
        date: '',
        review: ''
    });
    const [formError, setFormError] = useState('');

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleStarClick = (num) => {
        setForm(prev => ({ ...prev, rating: num }));
    };
    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!form.rating || !form.title || !form.createdBy || !form.review) {
            setFormError('Please fill all required fields and rating.');
            return;
        }
        setLocalReviews(prev => [
            { ...form, date: form.date || new Date().toISOString() },
            ...prev
        ]);
        setShowReviewForm(false);
        setForm({ rating: 0, title: '', createdBy: '', date: '', review: '' });
        setFormError('');
    };

    const reviewsTab = {
        label: "Reviews",
        content: (
            <div className="w-full max-w-3xl mx-auto text-left">
                <div className="flex justify-end mb-4">
                    <button
                        className="bg-[#00b67a] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#009e60] transition"
                        onClick={() => setShowReviewForm(v => !v)}
                    >
                        {showReviewForm ? 'Cancel' : 'Add Review'}
                    </button>
                </div>
                {showReviewForm && (
                    <form className="bg-[#fafbfc] border border-[#e6e7e9] rounded-xl px-6 py-6 shadow-sm mb-8 flex flex-col gap-4" onSubmit={handleSubmitReview}>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="font-semibold mb-1">Your Name *</label>
                                <input
                                    name="createdBy"
                                    value={form.createdBy}
                                    onChange={handleFormChange}
                                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b67a]"
                                    required
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="font-semibold mb-1">Review Title *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b67a]"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="font-semibold mb-1">Date</label>
                                <input
                                    name="date"
                                    type="date"
                                    value={form.date}
                                    onChange={handleFormChange}
                                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b67a]"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="font-semibold mb-1">Rating *</label>
                                <div className="flex items-center gap-1 mt-1">
                                    {[1,2,3,4,5].map(num => (
                                        <span
                                            key={num}
                                            className={num <= form.rating ? 'text-[#00b67a] text-2xl cursor-pointer' : 'text-gray-300 text-2xl cursor-pointer'}
                                            onClick={() => handleStarClick(num)}
                                            role="button"
                                            aria-label={`Rate ${num} star${num > 1 ? 's' : ''}`}
                                        >★</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold mb-1">Your Review *</label>
                            <textarea
                                name="review"
                                value={form.review}
                                onChange={handleFormChange}
                                rows={4}
                                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00b67a]"
                                required
                            />
                        </div>
                        {formError && <div className="text-red-600 font-semibold">{formError}</div>}
                        <button
                            type="submit"
                            className="bg-[#00b67a] text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-[#009e60] transition self-end"
                        >
                            Submit Review
                        </button>
                    </form>
                )}
                {localReviews.length === 0 ? (
                    <div className="text-gray-500">No reviews yet.</div>
                ) : (
                    <div className="space-y-6">
                        {localReviews.map((review, idx) => {
                            const isExpanded = expandedReviews[idx];
                            return (
                                <div key={idx} className="bg-[#fafbfc] border border-[#e6e7e9] rounded-xl px-6 py-6 shadow-sm flex flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        {/* Trustpilot/Star icons */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < (review.rating || 0) ? 'text-[#00b67a] text-xl' : 'text-gray-300 text-xl'}>★</span>
                                            ))}
                                        </div>
                                        <span className="ml-1 text-[#00b67a] font-bold text-xs flex items-center gap-1">
                                            <svg className="inline-block" width="16" height="16" viewBox="0 0 24 24" fill="#00b67a"><circle cx="12" cy="12" r="12"/><path fill="#fff" d="M10.5 16.5l-4-4 1.41-1.41L10.5 13.67l5.59-5.59L17.5 9.5z"/></svg>
                                            Verified
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <span className="font-bold text-base">{review.createdBy || 'Anonymous'}</span>
                                        <span className="text-xs">{review.date ? `${Math.round((Date.now() - new Date(review.date)) / (1000*60*60*24))} days ago` : ''}</span>
                                    </div>
                                    <div className="font-bold text-lg text-black mb-1">
                                        {review.title || 'Untitled Review'}
                                    </div>
                                    {/* Review content with Read more */}
                                    <div className="relative">
                                        <div
                                            className={`text-gray-900 transition-all duration-300 mb-2 ${isExpanded ? '' : 'max-h-[65px] overflow-hidden'}`}
                                            style={!isExpanded ? { WebkitMaskImage: 'linear-gradient(180deg, #000 65%, transparent 100%)' } : {}}
                                        >
                                            {review.review}
                                        </div>
                                        {!isExpanded && review.review && review.review.length > 150 && (
                                            <div className="absolute bottom-0 left-0 w-full flex justify-center bg-gradient-to-t from-[#fafbfc] to-transparent pt-6">
                                                <button
                                                    className="text-[#00b67a] font-semibold text-base px-2 py-1 focus:outline-none hover:underline"
                                                    onClick={() => handleReadMore(idx)}
                                                >
                                                    Read more
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )
    };

    if (
        product &&
        product.info &&
        Array.isArray(product.info.info) &&
        product.info.info.length > 0
    ) {
        tabs = product.info.info.map(section => ({
            label: section.title,
            content: section.description
        }));
        tabs.push(reviewsTab);
    } else {
        tabs = [
            {
                label: "Product Details",
                content: product?.description || "No product details available.",
            },
            {
                label: "Additional Information",
                content: product?.additionalInfo || "No additional information.",
            },
            {
                label: "Shipping & Return",
                content: product?.shippingReturn || "Shipping and return policy not provided.",
            },
            {
                label: "Custom Tab",
                content: product?.customTab || "Custom tab contenadsfasdft.",
            },
            {
                label: "Custom Review",
                content: product?.customReview || "No reviews yet.",
            },
        ];
    }
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div className="w-full mt-10">
            <div className="border-b flex space-x-8 justify-center">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.label}
                        className={`py-3 px-2 text-lg font-semibold focus:outline-none transition relative ${
                            activeTab === idx
                                ? "text-black border-b-2 border-black"
                                : "text-gray-900"
                        }`}
                        onClick={() => setActiveTab(idx)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="py-4 px-2 text-sm text-gray-700 min-h-[64px] w-[80%] mx-auto text-center">
                {tabs[activeTab].content}
            </div>
        </div>
    );
}