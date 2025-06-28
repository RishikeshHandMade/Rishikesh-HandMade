"use client"
import React, { useState } from "react";
import ReturnRequest from "./ReturnRequest";
import CancelRequest from "./CancelRequest";


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

const OrderDetail = ({ order, onBack }) => {

  if (!order) {
    return (
      <div className="text-center text-red-500 mt-10">
        No order data found. Please access this page from your order list or dashboard.
      </div>
    );
  }
  console.log(order)
  const [activeTab, setActiveTab] = useState("history");
  const [showCancelRequest, setShowCancelRequest] = useState(false);
  const orderData = order;
  orderData.history = [
    {
      label: "Product Shipped",
      date: "2024-04-08T17:23:00Z",
      status: "success",
      details: [
        { label: "Courier Service", value: "UPS, R. Gosling" },
        { label: "Estimated Delivery Date", value: "09/04/2024" }
      ]
    },
    {
      label: "Product Shipped",
      date: "2024-04-08T17:23:00Z",
      status: "success",
      details: [
        { label: "Tracking Number", value: "3409–4216–8759" },
        { label: "Warehouse", value: "Top Shirt 12b" }
      ]
    },
    {
      label: "Product Packaging",
      date: "2024-04-09T16:34:00Z",
      status: "pending",
      details: []
    },
    {
      label: "Order Placed",
      date: "2024-04-10T14:36:00Z",
      status: "pending",
      details: []
    }
  ];
  
  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-md font-medium"
        >
          ← Back to Order Details
        </button>
      )}

      <div className="bg-white rounded-2xl shadow p-8 max-w-4xl mx-auto mt-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            {(orderData.product?.image || (orderData.products && orderData.products[0]?.image?.url)) ? (
              <img
                src={orderData.product?.image || (orderData.products && orderData.products[0]?.image?.url)}
                alt="product"
                className="w-16 h-16 rounded-lg border mb-2"
              />
            ) : null}
            <span className="w-4 h-4 bg-pink-500 rounded-full border-2 border-white mt-1"></span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* <span className={`px-2 py-1 rounded text-xs font-bold ${statusBadge[orderData.status]}`}>{orderData.status}</span> */}
              <span className="text-lg font-bold">Order #{orderData.orderId || orderData.transactionId || orderData._id}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
              <div>
                <div className="text-xs text-gray-500">Item</div>
                <div className="font-semibold">{orderData.product?.name || (orderData.products && orderData.products[0]?.name) || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Courier</div>
                <div className="font-semibold">{orderData.courier || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Start Time</div>
                <div className="font-semibold">{orderData.startTime ? formatDateTime(orderData.startTime) : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div className="font-semibold">{orderData.address || '-'}</div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 mb-2 flex-wrap">
              {/* <button
                className="border border-black text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              //   onClick={() => setShowReturnRequest(true)}
              >
                Request Confirmation
              </button> */}
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
            <ol className="relative border-l-2 border-gray-200 ml-4 space-y-10">
              {orderData.history?.map((step, idx) => (
                <li key={idx} className="ml-6 relative">
                  {/* Timeline Circle */}
                  <span className={`absolute -left-7 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center 
            ${step.status === "success" ? "border-green-600 bg-green-100" :
                      step.status === "fail" ? "border-red-600 bg-red-100" :
                        "border-gray-400 bg-gray-100"}`}>
                    <span className={`w-3 h-3 rounded-full block 
              ${step.status === "success" ? "bg-green-600" :
                        step.status === "fail" ? "bg-red-600" :
                          "bg-gray-400"}`} />
                  </span>

                  {/* Timeline Content */}
                  <h3 className="font-bold text-md text-black mb-1">{step.label}</h3>
                  <p className="text-sm text-gray-600 mb-1">{formatDateTime(step.date)}</p>

                  <div className="text-sm space-y-1">
                    {step.details.map((d, i) => (
                      <p key={i}>
                        <span className="font-semibold">{d.label} :</span> {d.value}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {activeTab === "items" && (
          <div className="mt-6 text-gray-800 text-[15px] space-y-6 bg-[#fefaf6] p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4">Item Details</h2>

            {/* Product Card */}
            {orderData.products.map((product, index) => (
              <div key={index} className="flex gap-4 items-start">
                <img
                  src={product.image?.url}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-700"><span className="font-medium">Price :</span> ₹{product.price}</p>
                  <p className="text-gray-700"><span className="font-medium">Size :</span> {product.size || "N/A"}</p>
                </div>
              </div>
            ))}

            {/* Divider */}
            <hr className="my-6 border-gray-300" />

            {/* Summary */}
            {/* Summary Section */}
            <div className="mt-6 w-full border-t pt-4">
              <div className="space-y-2 text-[15px] max-w-md">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Price</span>
                  <span className="text-black font-semibold">+ ₹{orderData.subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Total Discounts</span>
                  <span className="text-green-700 font-semibold">- ₹{orderData.totalDiscount}</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="font-bold text-gray-800">Order Total</span>
                  <span className="font-bold text-lg text-black">₹{orderData.cartTotal}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "courier" && (
          <div className="mt-6 text-gray-700 text-[15px]">Courier section (implement as needed)</div>
        )}
        {activeTab === "receiver" && (
          <div className="mt-6 text-gray-700 text-[15px]">Receiver section (implement as needed)</div>
        )}
      </div>
    </>
  );
};

export default OrderDetail;