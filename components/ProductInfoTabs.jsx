"use client";
import { useState } from "react";

import React from "react";

function TabContentWithTableWidth({ content }) {
    // If content is a string, render as HTML and style tables
    if (typeof content === "string") {
        return (
            <div
                className="w-full"
                dangerouslySetInnerHTML={{
                    __html: content.replace(
                        /<table(.*?)>/g,
                        '<table$1 style="width:80%;margin-left:auto;margin-right:auto;">'
                    ),
                }}
            />
        );
    }
    // If content is JSX, clone and add class to tables
    return React.Children.map(content, (child) => {
        if (child?.type === "table") {
            return React.cloneElement(child, {
                className: (child.props.className || "") + " w-4/5 mx-auto",
            });
        }
        return child;
    });
}

export default function ProductInfoTabs({ product }) {
    // Example: dynamic tab data from API/product object
    let tabs = [];
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
