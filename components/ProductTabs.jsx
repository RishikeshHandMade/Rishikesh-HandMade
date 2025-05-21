"use client";
import { useState } from "react";

// Example dynamic data structure for tabs (replace with backend data as needed)
// tabsData = [
//   { label: "Product Details", content: "..." },
//   { label: "Additional Information", content: "..." },
//   ...
// ]

export default function ProductTabs({ tabsData }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-4 justify-center">
        {tabsData.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-6 py-3 text-md font-semibold focus:outline-none transition-all border-b-2 ${
              activeTab === idx
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="px-2 py-4 text-sm text-gray-700 min-h-[80px] max-w-3xl mx-auto text-center">
        {tabsData[activeTab]?.content || "No content available."}
      </div>
    </div>
  );
}
