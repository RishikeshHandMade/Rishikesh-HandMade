import React from "react";

const addresses = [
  {
    type: "Billing address",
    name: "John Doe",
    city: "London",
    phone: "012-345-6789",
    email: "johndoe@example.com",
  },
  {
    type: "Shipping address",
    name: "John Doe",
    city: "London",
    phone: "012-345-6789",
    email: "johndoe@example.com",
  },
];

const Address = () => {
  return (
    <div className="bg-[#fcf7f1] min-h-[400px] p-6 rounded-2xl">
      <div className="mb-4 flex items-center text-gray-700">
        <span className="w-3 h-3 rounded-full bg-pink-500 mr-2 inline-block"></span>
        <span className="text-sm">The following addresses will be used on the checkout page by default.</span>
      </div>
      <div className="flex flex-wrap gap-6 mb-10">
        {addresses.map((addr, idx) => (
          <div
            key={idx}
            className="flex-1 min-w-[320px] bg-white border rounded-lg shadow p-5 flex flex-col justify-between"
          >
            <div>
              <div className="font-bold mb-2 text-[15px]">{addr.type}</div>
              <div className="text-[15px] mb-1">{addr.name}</div>
              <div className="text-[15px] mb-1">{addr.city}</div>
              <div className="text-[15px] mb-1">Mo. {addr.phone}</div>
              <div className="text-[15px] mb-1">{addr.email}</div>
            </div>
            <div className="flex border-t mt-4 pt-2 gap-4">
              <button className="flex items-center gap-1 text-sm text-gray-800 hover:text-pink-600 font-medium">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 21v-4.586a1 1 0 0 1 .293-.707l9.586-9.586a2 2 0 0 1 2.828 0l1.586 1.586a2 2 0 0 1 0 2.828l-9.586 9.586A1 1 0 0 1 8.586 21H4Z"/><path stroke="currentColor" strokeWidth="2" d="M15 6l3 3"/></svg>
                Edit
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-800 hover:text-red-600 font-medium">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 7V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/><path stroke="currentColor" strokeWidth="2" d="M19 7v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7m5 4v6m4-6v6"/><path stroke="currentColor" strokeWidth="2" d="M9 7h6"/></svg>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Add New Address section */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center bg-white">
        <div className="flex flex-col items-center mb-4">
          <span className="bg-pink-700 text-white rounded-full p-5 mb-2">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" d="M12 3l7 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9l7-6Z"/>
              <path stroke="currentColor" strokeWidth="2" d="M9 21V9h6v12"/>
              <circle cx="16.5" cy="13.5" r="2.5" stroke="white" strokeWidth="2" fill="#d72660"/>
              <path stroke="white" strokeWidth="2" d="M16.5 12v3M15 13.5h3"/>
            </svg>
          </span>
          <div className="font-bold text-lg mb-2 text-center">Add New Address</div>
        </div>
        <button className="bg-pink-700 text-white px-8 py-2 rounded-lg font-semibold text-base hover:bg-pink-800 transition">Add</button>
      </div>
    </div>
  );
};

export default Address;