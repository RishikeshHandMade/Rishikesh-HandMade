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
import Chat from "./Chat";

const sections = [
  { key: "orders", label: "Orders" },
  { key: "return", label: "Return request" },
  { key: "chatbot", label: "Chat Bot" },
];
const settings = [
  { key: "profile", label: "Profile" },
  { key: "address", label: "Address" },
];

function SectionContent({ section, orderId, onViewOrder, onBackHome, showOrderDetail, selectedOrder }) {
   const { data: session } = useSession()
  if (section === "profile") return <Profile />;
  if (section === "orders" && selectedOrder) return <OrderDetail order={selectedOrder} />;
  if (section === "chatbot") {
    // Pass userId from session to Chat
    const userId = session?.user?.id || session?.user?._id;
    // console.log("Rendering Chat with userId:", userId);
    return <Chat userId={userId} />;
  }
  if (section === "orders") return <AllOrders onViewOrder={onViewOrder} />;
  if (section === "address") return <Address />;
  if (section === "return") return <ReturnRequest />;
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

  const user = session?.user || {
    name: "User Name",
    email: "user@example.com",
    image: "/placeholder.jpeg",
  };

  // Sync state when section changes
  useEffect(() => {
    setActiveSection(sectionFromUrl);
  }, [sectionFromUrl]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(false);
    setActiveSection("orders");
    router.push("/dashboard?section=orders");
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
        />
      </main>
    </div>
  );
};

export default Dashboard;
