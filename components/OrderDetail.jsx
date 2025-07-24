"use client"
import React, { useState, useEffect } from "react";
import ReturnRequest from "./ReturnRequest";
import CancelOrder from "./CancelOrder";


const statusBadge = {
  "IN PROGRESS": "bg-pink-600 text-white",
  CANCELED: "bg-red-500 text-white",
  DELIVERED: "bg-green-500 text-white",
  DELAYED: "bg-yellow-500 text-white",
};

const tabList = [
  { key: "history", label: "Order History" },
  { key: "items", label: "Item Details" },
  // { key: "courier", label: "Courier" },
  // { key: "receiver", label: "Receiver" },
];

function formatDateTime(dt) {
  const d = new Date(dt);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) +
    ", " + d.toLocaleTimeString("en-GB");
}

const OrderDetail = ({ order, onBack }) => {
  const [activeTab, setActiveTab] = useState("history");
  const [showCancelRequest, setShowCancelRequest] = useState(false);
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const [showMessage, setShowMessage] = useState(null);
  const [showReturnRequest, setShowReturnRequest] = useState(false);
  const [showCancelOrder, setShowCancelOrder] = useState(false);

  // Debug function to check modal state
  useEffect(() => {
    console.log('Modal state - showCancelOrder:', showCancelOrder);
  }, [showCancelOrder]);

  if (!order) {
    return (
      <div className="text-center text-red-500 mt-10">
        No order data found. Please access this page from your order list or dashboard.
      </div>
    );
  }
  console.log(order)
  const orderData = order;
  const isShipped = orderData.status === 'Shipped' || orderData.status === 'Delivered';
  const hasTracking = orderData.trackingNumber && orderData.trackingUrl;

  // Debug status history
  // console.log('Status History:', orderData.statusHistory);

  // Check if order is cancellable (not shipped or delivered)
  const isOrderShippedOrDelivered = orderData.statusHistory?.some(
    status => status.status === 'Shipped' || status.status === 'Delivered'
  );

  // console.log('Is Order Shipped or Delivered:', isOrderShippedOrDelivered);

  // For testing: Force the cancel button to be visible
  const isCancellable = true; // Temporarily force to true for testing

  // console.log('Order Status:', orderData.status);
  // console.log('Is Cancellable (after override):', isCancellable);

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
            {(orderData.product?.image || (orderData.products && orderData.products[0]?.image)) ? (
              <img
                src={orderData.product?.image || (orderData.products && orderData.products[0]?.image)}
                alt="product"
                className="w-24 h-24 rounded-lg border mb-2"
              />
            ) : null}
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
                <div className="text-xs text-gray-500">Price</div>
                <div className="font-semibold">{orderData.product?.price || (orderData.products && orderData.products[0]?.price) || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Quantity</div>
                <div className="font-semibold">{orderData.product?.qty || (orderData.products && orderData.products[0]?.qty) || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Size</div>
                <div className="font-semibold">{orderData.product?.size || (orderData.products && orderData.products[0]?.size) || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Color</div>
                <div
                  className="font-semibold w-6 h-6 border-2 border-black rounded-full flex items-center justify-center"
                  style={{ backgroundColor: orderData.product?.color || (orderData.products?.[0]?.color) || '#ccc' }}
                ></div>
              </div>

            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 mb-2 flex-wrap">
              {orderData.statusHistory?.some(status => status.status.toLowerCase() === 'cancelled') ? (
                <button
                  disabled
                  className="border border-gray-300 text-gray-500 px-5 py-2 rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Order Cancelled
                </button>
              ) : isCancellable ? (
                <button
                  onClick={() => {
                    console.log('Cancel button clicked');
                    console.log('Setting showCancelOrder to true');
                    setShowCancelOrder(true);
                  }}
                  className="border border-red-400 text-red-600 px-5 py-2 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </button>
              ) : null}
              {isShipped && hasTracking && (
                <button
                  onClick={() => setShowTrackingInfo(!showTrackingInfo)}
                  className="border border-blue-400 text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {showTrackingInfo ? 'Hide Tracking' : 'Track Order'}
                </button>
              )}
              {orderData.statusHistory?.some(status => status.status === 'Delivered') && (
                <button
                  className="border border-green-600 text-green-700 px-5 py-2 rounded-lg font-semibold hover:bg-green-50 transition flex items-center gap-2"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.handleReturnOrder) {
                      window.handleReturnOrder(orderData);
                    } else if (onBack) {
                      // If not in dashboard, navigate directly
                      window.location.href = `/dashboard?section=return&orderId=${orderData._id}`;
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.555.832L10 14.202l-4.445 2.63A1 1 0 014 16V4z" clipRule="evenodd" />
                  </svg>
                  Request Return
                </button>
              )}
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
            {orderData.statusHistory?.length > 0 ? (
              <ol className="relative border-l-2 border-gray-200 ml-8 pl-5 space-y-6">
                {orderData.statusHistory.map((status, idx) => (
                  <li key={idx} className="relative pb-6">
                    {/* Timeline Circle */}
                    <span className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center 
                      ${status.status === 'Delivered' ? 'border-green-600 bg-green-100' :
                        status.status === 'Cancelled' ? 'border-red-600 bg-red-100' :
                          'border-blue-600 bg-blue-100'}`}>
                      <span className={`w-3 h-3 rounded-full block 
                        ${status.status === 'Delivered' ? 'bg-green-600' :
                          status.status === 'Cancelled' ? 'bg-red-600' :
                            'bg-blue-600'}`} />
                    </span>

                    {/* Timeline Content */}
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-md text-black">{status.status}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(status.updatedAt).toLocaleString()}
                        </span>
                      </div>

                      {status.message && (
                        <>
                          <button
                            onClick={() => setShowMessage(showMessage === idx ? null : idx)}
                            className="text-sm text-blue-600 hover:underline mt-1 text-left"
                          >
                            {showMessage === idx ? 'Hide Details' : 'View Details'}
                          </button>

                          {showMessage === idx && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                              {status.message}
                              {status.status === 'Shipped' && status.trackingNumber && (
                                <div className="mt-3 bg-green-50 rounded-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium">Tracking Number:</span>
                                    <span className="font-mono text-sm bg-white px-2 rounded border">
                                      {status.trackingNumber}
                                      {showTrackingInfo && status.trackingUrl && (
                                        <div className="">
                                          <a
                                            href={status.trackingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                          >
                                            Track Your Package
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                          </a>
                                        </div>
                                      )}
                                    </span>

                                  </div>
                                </div>
                              )}

                            </div>
                          )}
                        </>
                      )}

                      {/* Show tracking info if available and status is Shipped */}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No status history available for this order.
              </div>
            )}
          </div>
        )}

        {activeTab === "items" && (
          <div className="mt-6 text-gray-800 text-[15px] space-y-6 bg-[#fefaf6] p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4">Item Details</h2>

            {/* Product Card */}
            {orderData.products.map((product, index) => (
              <div key={index} className="flex gap-4 items-start">
                <img
                  src={product.image}
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

      {/* Return Request Modal */}
      {showReturnRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Return Request</h2>
              <button
                onClick={() => setShowReturnRequest(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ReturnRequest orderId={orderData.orderId} onClose={() => setShowReturnRequest(false)} />
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Cancel Order</h2>
              <button
                onClick={() => setShowCancelOrder(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CancelOrder
              order={orderData}
              orderId={orderData.orderId || orderData._id}
              onClose={() => setShowCancelOrder(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetail;