"use client"
import React from "react";

const mockReturns = [
  {
    id: "1374845",
    status: "Return Made",
    statusColor: "text-green-600",
    product: {
      name: "Collar Casual Shirt",
      image: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
      date: "2025-01-30",
      quantity: 1,
      price: 105,
    },
  },
  {
    id: "2374237",
    status: "Request Submitted",
    statusColor: "text-pink-600",
    product: {
      name: "Collar Casual Shirt",
      image: "https://cdn-icons-png.flaticon.com/512/892/892460.png",
      date: "2025-01-30",
      quantity: 1,
      price: 304,
    },
  },
  {
    id: "4374528",
    status: "Request Submitted",
    statusColor: "text-pink-600",
    product: {
      name: "Classic Denim Skinny Shirt",
      image: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
      date: "2025-01-30",
      quantity: 1,
      price: 657,
    },
  },
  {
    id: "5374619",
    status: "Request Submitted",
    statusColor: "text-pink-600",
    product: {
      name: "Classic Denim Skinny Shirt",
      image: "https://cdn-icons-png.flaticon.com/512/892/892460.png",
      date: "2025-01-30",
      quantity: 1,
      price: 245,
    },
  },
];

const ReturnRequest = () => {
  return (
    <div className="bg-[#fcf7f1] min-h-[400px] p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">REQUEST FOR PRODUCT RETURN <span className="text-lg">({mockReturns.length})</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReturns.map((item, idx) => (
          <div key={item.id} className="bg-white border border-dashed rounded-xl p-5 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">Request No: <span className="text-pink-600 font-bold">#{item.id}</span></span>
              <span className={`text-sm font-semibold underline cursor-pointer ${item.statusColor}`}>{item.status}</span>
            </div>
            <div className="flex gap-5 items-center">
              <img src={item.product.image} alt="product" className="w-24 h-24 rounded-lg border" />
              <div>
                <div className="text-[15px] text-gray-700 mb-1">{new Date(item.product.date).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}</div>
                <div className="font-bold text-[17px] mb-1">{item.product.name}</div>
                <div className="text-[15px] mb-1">Quantity: <span className="font-semibold">{item.product.quantity}</span></div>
                <div className="font-bold text-[15px]">${item.product.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReturnRequest;