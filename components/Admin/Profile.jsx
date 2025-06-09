"use client"
import React, { useState } from "react";

import { useSession } from "next-auth/react";

const Profile = () => {
  const { data: session } = useSession();
  const [newsletter, setNewsletter] = useState(false);

  // Use session user if available, fallback to mock
  const user = session?.user || {
    name: "John Doe",
    email: "johndoe@example.com",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  };

  return (
    <div className="bg-[#fcf7f1] min-h-[600px] p-6 rounded-2xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-5 mb-6 border-b pb-6">
        <div className="relative">
          <img
            src={user.image}
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <button className="absolute -top-2 -left-2 bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#fcf7f1] shadow"><svg xmlns='http://www.w3.org/2000/svg' className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg></button>
        </div>
        <div>
          <div className="text-2xl font-bold mb-1">{user.name}</div>
          <div className="text-pink-600 text-[15px] font-medium">{user.email}</div>
        </div>
      </div>
      {/* Form */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-4">
        <div>
          <label className="block mb-1 font-medium text-[15px]">First Name</label>
          <input className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-pink-600" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[15px]">Last Name</label>
          <input className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-pink-600" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[15px]">Email address</label>
          <input className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-pink-600" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[15px]">Phone</label>
          <input className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-pink-600" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[15px]">New password (leave blank to leave unchanged)</label>
          <input type="password" className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-pink-600" />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[15px]">Confirm new password</label>
          <input type="password" className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-pink-600" />
        </div>
        <div className="col-span-2 flex items-center mt-2">
          <input
            type="checkbox"
            id="newsletter"
            checked={newsletter}
            onChange={() => setNewsletter((v) => !v)}
            className="mr-2 accent-pink-600 w-4 h-4"
          />
          <label htmlFor="newsletter" className="text-[15px]">Subscribe me to Newsletter</label>
        </div>
        <div className="col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="bg-pink-600 text-white px-8 py-2 rounded-lg font-semibold text-base hover:bg-pink-700 transition"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
