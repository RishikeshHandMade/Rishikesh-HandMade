"use client";
import { useState } from "react";

import React from "react";

export default function ProductInfoTabs({ product }) {
    // Example: dynamic tab data from API/product object
    let tabs = [];
    // Collect reviews from product.reviews (array of objects)
    const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

    // Static Reviews Tab with dynamic data
    const reviewsTab = {
        label: "Reviews",
        content: (
            <div className="w-full max-w-3xl mx-auto text-left">
                <h3 className="font-bold text-lg mb-2">Product: {product?.title}</h3>
                {reviews.length === 0 ? (
                    <div className="text-gray-500">No reviews yet.</div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review, idx) => (
                            <div key={idx} className="border-2 border-black rounded-xl px-4 py-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-yellow-500 text-xl items-center">
                                        {[...Array(review.rating || 0)].map((_, i) => (
                                            <span className="text-2xl" key={i}>★</span>
                                        ))}
                                    </span>
                                    <span className="font-semibold">{review.title || 'Untitled Review'}</span>
                                </div>
                                <div className="text-md  text-gray-900 mb-2">
                                    {review.createdBy || 'Anonymous'}
                                    {review.date && (
                                        <> on {new Date(review.date).toLocaleDateString()}</>
                                    )}
                                </div>
                                <div className="text-gray-900 mb-2 h-24 overflow-y-auto">{review.review}</div>
                            </div>
                        ))}
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
            <div className="py-4 px-2 text-sm text-gray-700 min-h-[64px] text-center">
                {tabs[activeTab].content}
            </div>
        </div>
    );
}
