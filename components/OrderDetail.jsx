import React, { useState } from "react";
import ReturnRequest from "./ReturnRequest";
import CancelRequest from "./CancelRequest";

const mockOrder = {
  id: "17493",
  status: "IN PROGRESS",
  product: {
    name: "casual shirt",
    image: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
  },
  courier: "casual shirt",
  address: "451 Wall Street UK, London",
  startTime: "2024-04-05T15:43:23",
  history: [
    {
      label: "Product Shiped",
      date: "2024-04-08T17:23:00",
      details: [
        { label: "Courier Service", value: "UPS, R. Gosling" },
        { label: "Estimated Delivery Date", value: "09/04/2024" },
      ],
      status: "success",
    },
    {
      label: "Product Shiped",
      date: "2024-04-08T17:23:00",
      details: [
        { label: "Tracking Number", value: "3409-4216-8759" },
        { label: "Warehouse", value: "Top Shirt 12b" },
      ],
      status: "fail",
    },
    {
      label: "Product Packaging",
      date: "2024-04-09T16:34:00",
      details: [],
      status: "pending",
    },
    {
      label: "Order Placed",
      date: "2024-04-10T14:36:00",
      details: [],
      status: "pending",
    },
  ],
};

const statusBadge = {
  "IN PROGRESS": "bg-pink-600 text-white",
  CANCELED: "bg-red-500 text-white",
  DELIVERED: "bg-green-500 text-white",
  DELAYED: "bg-yellow-500 text-white",
};

const tabList = [
  { key: "history", label: "Order History" },
  { key: "items", label: "Item Details" },
  { key: "courier", label: "Courier" },
  { key: "receiver", label: "Receiver" },
];

function formatDateTime(dt) {
  const d = new Date(dt);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) +
    ", " + d.toLocaleTimeString("en-GB");
}

const OrderDetail = ({ order }) => {
  const [activeTab, setActiveTab] = useState("history");
  const [showCancelRequest, setShowCancelRequest] = useState(false);
  const [showReturnRequest, setShowReturnRequest] = useState(false);
  const orderData = order || mockOrder;

  if (showCancelRequest) {
    return (
      <div>
        <button
          className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
          onClick={() => setShowCancelRequest(false)}
        >
          ← Back to Order Details
        </button>
        <CancelRequest />
      </div>
    );
  }
  if (showReturnRequest) {
    return (
      <div>
        <button
          className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
          onClick={() => setShowReturnRequest(false)}
        >
          ← Back to Order Details
        </button>
        <ReturnRequest />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-8 max-w-4xl mx-auto mt-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <img
            src={mockOrder.product.image}
            alt="product"
            className="w-16 h-16 rounded-lg border mb-2"
          />
          <span className="w-4 h-4 bg-pink-500 rounded-full border-2 border-white mt-1"></span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${statusBadge[mockOrder.status]}`}>{mockOrder.status}</span>
            <span className="text-lg font-bold">Order #{mockOrder.id}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
            <div>
              <div className="text-xs text-gray-500">Item</div>
              <div className="font-semibold">{mockOrder.product.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Courier</div>
              <div className="font-semibold">{mockOrder.courier}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Start Time</div>
              <div className="font-semibold">{formatDateTime(mockOrder.startTime)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Address</div>
              <div className="font-semibold">Address {mockOrder.address}</div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 mb-2 flex-wrap">
            <button
              className="border border-black text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            //   onClick={() => setShowReturnRequest(true)}
            >
              Request Confirmation
            </button>
            <button
              className="border border-red-400 text-red-600 px-5 py-2 rounded-lg font-semibold hover:bg-red-50 transition"
              onClick={() => setShowCancelRequest(true)}
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>
      <hr className="my-6" />
      {/* Tabs */}
      <div className="flex gap-7 border-b">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-[15px] font-semibold transition border-b-2 ${activeTab === tab.key ? "border-pink-500 text-pink-600" : "border-transparent text-gray-600"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === "history" && (
        <div className="mt-6">
          {/* Timeline */}
          <ol className="relative border-l-2 border-gray-200 ml-4">
            {mockOrder.history.map((step, idx) => (
              <li key={idx} className="mb-10 ml-4">
                <span
                  className={`absolute -left-6 top-1 flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                    step.status === "success"
                      ? "bg-green-100 border-green-500"
                      : step.status === "fail"
                      ? "bg-pink-100 border-pink-500"
                      : "bg-gray-100 border-gray-400"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full block ${
                      step.status === "success"
                        ? "bg-green-500"
                        : step.status === "fail"
                        ? "bg-pink-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                </span>
                <div className="font-bold text-[16px] mb-1">{step.label}</div>
                <div className="text-xs text-gray-500 mb-1">{formatDateTime(step.date)}</div>
                <div className="text-sm text-gray-700">
                  {step.details.map((d, i) => (
                    <div key={i}>
                      <span className="font-semibold">{d.label}:</span> {d.value}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      {activeTab === "items" && (
        <div className="mt-6 text-gray-700 text-[15px]">Item details section (implement as needed)</div>
      )}
      {activeTab === "courier" && (
        <div className="mt-6 text-gray-700 text-[15px]">Courier section (implement as needed)</div>
      )}
      {activeTab === "receiver" && (
        <div className="mt-6 text-gray-700 text-[15px]">Receiver section (implement as needed)</div>
      )}
    </div>
  );
};

export default OrderDetail;