"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import Profile from "./Profile";
import OrderConfirm from "./OrderConfirm";
import OrderDetail from "./OrderDetail";
import AllOrders from "./AllOrders";
import Address from "./Address";
import ReturnRequest from "./ReturnRequest";
import CancelOrder from "./CancelOrder";
import Chat from "./Chat";

const sections = [
  { key: "orders", label: "Order Overview" },
  { key: "return", label: "Return Request" },
  { key: "cancel", label: "Cancel Order" },
  { key: "chatbot", label: "Chat With Admin" },
  { key: "track", label: "Track Order" },
];
const settings = [
  { key: "profile", label: "Profile" },
  { key: "address", label: "Address" },
];

import ChatOrder from "./ChatOrder";
import TrackOrder from "./TrackOrder";
function SectionContent({ section, orderId, onViewOrder, onBackHome, showOrderDetail, selectedOrder, orderChatMode, onChatOrder, onBack, returnOrder }) {
   const { data: session } = useSession()
  if (section === "profile") return <Profile />;
  if (section === "orders" && selectedOrder && orderChatMode) return <ChatOrder order={selectedOrder} onBack={onBack} onViewOrder={onViewOrder} />;
  if (section === "orders" && selectedOrder) return <OrderDetail order={selectedOrder} onBack={onBack} />;
  if (section === "chatbot") {
    // Get orderId from URL if present
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('orderId');
    // Pass userId from session to Chat
    const userId = session?.user?.id || session?.user?._id;
    
    // If we have an orderId, initialize chat with order context
    if (orderId) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Return Assistance</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>You're chatting about Order #{orderId}. Our team is here to help with your return request.</p>
                </div>
              </div>
            </div>
          </div>
          <Chat userId={userId} context={{ orderId }} />
        </div>
      );
    }
    return <Chat userId={userId} />;
  }
  if (section === "orders") return <AllOrders onViewOrder={onViewOrder} onChatOrder={onChatOrder} />;
  if (section === "track") return <TrackOrder orderId={orderId} />;
  if (section === "address") return <Address />;
  if (section === "return") return <ReturnRequest order={returnOrder} orderId={orderId} />;
  if (section === "cancel") return <CancelOrder orderId={orderId} />;
  if (section === "dashboard" && orderId && !showOrderDetail) {
    return <OrderConfirm orderId={orderId} onViewOrder={onViewOrder} onBackHome={onBackHome} />;
  }
  if (section === "dashboard" && orderId && showOrderDetail) {
    return <OrderDetail orderId={orderId} />;
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold capitalize">{section}</h1>
      <p className="mt-4 text-gray-600">This is the <b>{section}</b> section content.</p>
    </div>
  );
}

const Dashboard = () => {
  const [ordersCache, setOrdersCache] = useState([]); // Cache for orders

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const pathParts = pathname.split("/");
  const sectionFromUrl = searchParams.get("section") || "dashboard";

  const [activeSection, setActiveSection] = useState(sectionFromUrl);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderChatMode, setOrderChatMode] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);

  const user = session?.user || {
    name: "User Name",
    email: "user@example.com",
    image: "/placeholder.jpeg",
  };

  // Sync state when section changes
  useEffect(() => {
    setActiveSection(sectionFromUrl);
  }, [sectionFromUrl]);

  // Expose handleReturnOrder to window for OrderDetail
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleReturnOrder = handleReturnOrder;
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.handleReturnOrder = null;
      }
    };
  }, []);

  // Sync chat order from URL
  useEffect(() => {
    const chatOrderId = searchParams.get("chatOrderId");
    if (activeSection === "orders" && chatOrderId) {
      // If already set, do nothing
      if (selectedOrder && selectedOrder._id === chatOrderId && orderChatMode) return;
      // Try to find in cache first
      let order = ordersCache.find(o => o._id === chatOrderId);
      if (order) {
        setSelectedOrder(order);
        setOrderChatMode(true);
      } else {
        // Fallback: fetch from API
        fetch(`/api/orders/${chatOrderId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.order) {
              setSelectedOrder(data.order);
              setOrderChatMode(true);
            }
          });
      }
    }
  }, [activeSection, searchParams, selectedOrder, orderChatMode, ordersCache]);

  // Cache orders from AllOrders
  const handleOrdersFetched = (orders) => {
    setOrdersCache(orders || []);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderChatMode(false);
    setShowOrderDetail(false);
    setActiveSection("orders");
    router.push("/dashboard?section=orders");
  };

  const handleReturnOrder = (order) => {
    setReturnOrder(order);
    setActiveSection("return");
    router.push(`/dashboard?section=return&orderId=${order._id}`);
  };

  const handleChatOrder = (order) => {
    setSelectedOrder(order);
    setOrderChatMode(true);
    setActiveSection("orders");
    // Add chatOrderId to URL for persistence
    router.push(`/dashboard?section=orders&chatOrderId=${order._id}`);
  };
  const handleBackToOrders = () => {
    setOrderChatMode(false); // or whatever logic returns to the orders list
    setSelectedOrder(null);  // optionally clear the selected order
  };
  

  const handleBackHome = () => {
    setShowOrderDetail(false);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("orderId");
    router.replace(`/dashboard${params.size ? "?" + params.toString() : ""}`);
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen px-15 bg-[#fcf7f1]">
      {/* Sidebar */}
      <aside className="w-[300px] bg-white rounded-2xl shadow-lg m-6 flex-shrink-0">
        <div className="flex flex-col items-center py-8 border-b">
          <div className="w-24 h-24 mb-2 rounded-full border-4 border-white shadow-lg overflow-hidden">
            <Image src={user.image} alt="avatar" width={96} height={96} className="object-cover w-full h-full" />
          </div>
          <div className="font-bold text-lg mt-2">{user.name}</div>
          <div className="text-red-500 text-sm">{user.email}</div>
        </div>

        <nav className="mt-2 items-center justify-center">
          <div className="px-6 py-2 text-base text-gray-500 bg-red-100 font-semibold">DASHBOARD</div>
          {sections.map(({ key, label }) => (
            <button
              key={key}
              className={`w-full text-left px-6 py-2 hover:bg-gray-50 rounded transition ${activeSection === key ? "font-bold text-black bg-gray-100" : "text-gray-800"
                }`}
              onClick={() => {
                setShowOrderDetail(false);
                router.push(`/dashboard?section=${key}`);
              }}
            >
              {label}
            </button>
          ))}

          <div className="px-6 py-2 mt-4 text-base text-gray-500 bg-red-100 font-semibold">ACCOUNT SETTINGS</div>
          {settings.map(({ key, label }) => (
            <button
              key={key}
              className={`w-full text-left px-6 py-2 hover:bg-gray-50 rounded transition ${activeSection === key ? "font-bold text-black" : "text-gray-800"
                }`}
              onClick={() => {
                setShowOrderDetail(false);
                router.push(`/dashboard?section=${key}`);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#fdf6ee] rounded-2xl shadow-lg m-6 p-8">
        <SectionContent
          section={activeSection}
          orderId={orderId}
          onViewOrder={handleViewOrder}
          onBackHome={handleBackHome}
          showOrderDetail={showOrderDetail}
          selectedOrder={selectedOrder}
          orderChatMode={orderChatMode}
          onChatOrder={handleChatOrder}
          onReturnOrder={handleReturnOrder}
          onOrdersFetched={handleOrdersFetched}
          onBack={handleBackToOrders}
          returnOrder={returnOrder}
        />
      </main>
    </div>
  );
};

export default Dashboard;
