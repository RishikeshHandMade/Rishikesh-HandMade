"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

const sections = [
  { key: "dashboard", label: "Dashboard" },
  { key: "orders", label: "Orders" },
  { key: "downloads", label: "Downloads" },
  { key: "return", label: "Return request" },
];
const settings = [
  { key: "profile", label: "Profile" },
  { key: "address", label: "Address" },
  { key: "shipping", label: "Shipping methods" },
  { key: "payment", label: "Payment Methods" },
  { key: "review", label: "Review" },
];

function SectionContent({ section }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold capitalize">{section}</h1>
      <p className="mt-4 text-gray-600">This is the <b>{section}</b> section content.</p>
    </div>
  );
}

const Profile = () => {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState("dashboard");
  const user = session?.user || {
    name: "Ronald M. Spino",
    email: "info@example.com",
    image: "/avatar-female.png",
  };

  if (status === "loading") return <div>Loading...</div>;
  // Sidebar + Main content layout
  return (
    <div className="flex min-h-screen px-10 bg-[#fcf7f1]">
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
          <div className="px-6 py-2 text-base text-gray-500 bg-red-100 font-semibold ">DASHBOARD</div>
          {sections.map(({ key, label }) => (
            <button
              key={key}
              className={`w-full text-left px-6 py-2 hover:bg-gray-50 rounded transition ${
                activeSection === key ? "font-bold text-black bg-gray-100" : "text-gray-800"
              }`}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </button>
          ))}
          <div className="px-6 py-2 mt-4 text-base text-gray-500 bg-red-100 font-semibold">ACCOUNT SETTINGS</div>
          {settings.map(({ key, label }) => (
            <button
              key={key}
              className={`w-full text-left px-6 py-2 hover:bg-gray-50 rounded transition ${
                activeSection === key ? "font-bold text-black" : "text-gray-800"
              }`}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-white rounded-2xl shadow-lg m-6 p-8">
        <SectionContent section={activeSection} />
      </main>
    </div>
  );
};

export default Profile;
