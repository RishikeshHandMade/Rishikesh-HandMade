"use client"
import React, { useState } from "react";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Users,
  Settings,
  Bell,
  UserCircle,
  Search,
  Edit,
  Eye,
} from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, url: "#" },
  { name: "Products", icon: <Store size={20} />, url: "#" },
  { name: "Orders", icon: <ShoppingCart size={20} />, url: "#" },
  { name: "Customers", icon: <Users size={20} />, url: "#" },
  { name: "Settings", icon: <Settings size={20} />, url: "#" },
];

const orderStatusOptions = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// Demo data
const demoOrders = [
  {
    id: "ORD123456",
    customer: "Akhil Sharma",
    products: [
      { name: "Handmade Shawl" },
      { name: "Bamboo Basket" },
    ],
    quantity: 2,
    total: 2499,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    orderDate: "2025-06-10",
    address: "12, Ganga Vihar, Rishikesh, Uttarakhand, 249201",
  },
  {
    id: "ORD123457",
    customer: "Priya Singh",
    products: [{ name: "Woolen Cap" }],
    quantity: 1,
    total: 499,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    orderDate: "2025-06-09",
    address: "45, Laxman Jhula, Rishikesh, Uttarakhand, 249302",
  },
  // Add more demo orders as needed
];

const AllOrders = () => {
  const [orders, setOrders] = useState(demoOrders);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    let match = true;
    if (search) {
      match =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());
    }
    if (date && match) {
      match = order.orderDate === date;
    }
    if (day && match) {
      match = new Date(order.orderDate).getDate() === Number(day);
    }
    if (month && match) {
      match = new Date(order.orderDate).getMonth() + 1 === Number(month);
    }
    if (year && match) {
      match = new Date(order.orderDate).getFullYear() === Number(year);
    }
    if (statusFilter && match) {
      match = order.orderStatus === statusFilter;
    }
    return match;
  });
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const handleReset = () => {
    setSearch("");
    setDate("");
    setDay("");
    setMonth("");
    setYear("");
    setStatusFilter("");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
          <div className="text-xl font-bold text-blue-700">All Orders</div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="text-xl text-gray-500" size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <UserCircle className="text-2xl text-blue-700" size={24} />
            </div>
          </div>
        </header>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between px-4 py-3 bg-white border-b">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              className="px-3 py-2 border rounded bg-gray-100 focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              className="px-3 py-2 border rounded bg-gray-100 focus:outline-none"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="">Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded bg-gray-100 focus:outline-none"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Month</option>
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded bg-gray-100 focus:outline-none"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Year</option>
              {[2023, 2024, 2025].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded bg-gray-100 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status</option>
              {orderStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Order ID or Customer"
                className="px-3 py-2 border rounded bg-gray-100 focus:outline-none pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-2 top-3 text-gray-400" size={16} />
            </div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
              onClick={handleReset}
            >
              Reset Filters
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
              // onClick={handleApply}
            >
              Apply Filters
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-x-auto p-4">
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Customer Name</th>
                <th className="p-3 text-left">Product Name(s)</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3 text-center">Price</th>
                <th className="p-3 text-center">Payment</th>
                <th className="p-3 text-center">Order Status</th>
                <th className="p-3 text-center">Order Date</th>
                <th className="p-3 text-left">Delivery Address</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, idx) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-blue-50 transition-colors"
                >
                  <td className="p-3 font-mono text-xs">{order.id}</td>
                  <td className="p-3">{order.customer}</td>
                  <td className="p-3">
                    {order.products.map((p, i) => (
                      <span key={i} className="inline-block mr-1 bg-gray-100 rounded px-2 py-0.5 text-xs">
                        {p.name}
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-center">{order.quantity}</td>
                  <td className="p-3 text-center">₹{order.total}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold
                        ${order.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"}
                      `}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      className="px-2 py-1 border rounded bg-gray-50 text-xs"
                      value={order.orderStatus}
                      onChange={(e) => {
                        const updated = [...orders];
                        updated[idx].orderStatus = e.target.value;
                        setOrders(updated);
                      }}
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">{order.orderDate}</td>
                  <td className="p-3 max-w-xs truncate">{order.address}</td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button
                      className="p-2 rounded hover:bg-blue-100"
                      title="View"
                    >
                      <Eye className="text-blue-600" size={18} />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-green-100"
                      title="Edit"
                    >
                      <Edit className="text-green-600" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} -
            {Math.min(page * rowsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded border ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOrders;