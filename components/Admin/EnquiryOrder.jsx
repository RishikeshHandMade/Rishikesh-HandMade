"use client";
import React, { useState } from "react";
import { 
  Search, 
  Bell, 
  UserCircle, 
  Edit, 
  Trash2, 
  Eye, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Settings, 
  Store 
} from "lucide-react";

// Demo data
const demoOrders = [
  {
    id: "ORD123456",
    customer: "Akhil Sharma",
    products: [
      { name: "Handmade Shawl", thumbnail: "/shawl.jpg" },
      { name: "Bamboo Basket", thumbnail: "/basket.jpg" }
    ],
    quantity: 2,
    total: 2499,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    orderDate: "2025-06-10",
    address: "12, Ganga Vihar, Rishikesh, Uttarakhand, 249201"
  },
  {
    id: "ORD123457",
    customer: "Priya Singh",
    products: [
      { name: "Woolen Cap", thumbnail: "/cap.jpg" }
    ],
    quantity: 1,
    total: 499,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    orderDate: "2025-06-09",
    address: "45, Laxman Jhula, Rishikesh, Uttarakhand, 249302"
  },
  // Add more demo orders as needed
];

const orderStatusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const paymentStatusColors = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700"
};
const orderStatusColors = {
  Pending: "bg-gray-200 text-gray-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700"
};

const sidebarLinks = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, url: "#" },
  { name: "Products", icon: <Store size={20} />, url: "#" },
  { name: "Orders", icon: <ShoppingCart size={20} />, url: "#" },
  { name: "Customers", icon: <Users size={20} />, url: "#" },
  { name: "Settings", icon: <Settings size={20} />, url: "#" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const EnquiryOrder = () => {
  const [orders, setOrders] = useState(demoOrders);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null); // For modal
  const rowsPerPage = 8;

  // Filtering logic
  const filteredOrders = orders.filter(order =>
    (statusFilter ? order.orderStatus === statusFilter : true) &&
    (search ? (
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.products.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
    ) : true)
  );
  const paginatedOrders = filteredOrders.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search orders, customers, products..."
                className="w-full pl-10 pr-4 py-2 rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>
        </header>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between px-4 py-3 bg-white border-b">
          <div className="flex gap-2 items-center">
            <label className="font-medium text-gray-600">Status:</label>
            <select
              className="px-3 py-2 border rounded bg-gray-100 focus:outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {orderStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          {/* Date filter placeholder (implement as needed) */}
          <div className="flex gap-2 items-center">
            <label className="font-medium text-gray-600">Date:</label>
            <input type="date" className="px-3 py-2 border rounded bg-gray-100 focus:outline-none" />
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-x-auto p-4">
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Products</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Payment</th>
                <th className="p-3 text-center">Order Status</th>
                <th className="p-3 text-center">Order Date</th>
                {/* <th className="p-3 text-left">Delivery Address</th> */}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">No orders found.</td>
                </tr>
              )}
              {paginatedOrders.map((order, idx) => (
                <tr key={order.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 font-mono text-blue-700">{order.id}</td>
                  <td className="p-3">{order.customer}</td>
                  <td className="p-3 flex gap-2 items-center">
                    {order.products.map((p, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {p.thumbnail && <img src={p.thumbnail} alt={p.name} className="w-8 h-8 rounded object-cover border" />}
                        <span>{p.name}</span>
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-center">{order.quantity}</td>
                  <td className="p-3 text-right font-semibold">₹{order.total}</td>
                  <td className="p-3 text-center">
                    <span className={classNames(
                      "px-2 py-1 rounded text-xs font-semibold",
                      paymentStatusColors[order.paymentStatus] || "bg-gray-100 text-gray-700"
                    )}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      className={classNames(
                        "px-2 py-1 rounded text-xs font-semibold border",
                        orderStatusColors[order.orderStatus] || "bg-gray-100 text-gray-700"
                      )}
                      value={order.orderStatus}
                      onChange={e => {
                        const updated = orders.map(o =>
                          o.id === order.id ? { ...o, orderStatus: e.target.value } : o
                        );
                        setOrders(updated);
                      }}
                    >
                      {orderStatusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">{order.orderDate}</td>
                  {/* <td className="p-3 max-w-xs truncate">{order.address}</td> */}
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button className="p-2 rounded hover:bg-blue-100" title="View" onClick={() => setViewOrder(order)}><Eye className="text-blue-600" size={18} /></button>
                    <button className="p-2 rounded hover:bg-green-100" title="Edit"><Edit className="text-green-600" size={18} /></button>
                    <button className="p-2 rounded hover:bg-red-100" title="Delete"><Trash2 className="text-red-600" size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center px-4 pb-4">
          <span className="text-sm text-gray-600">
            Showing {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </span>
          <div className="flex gap-1">
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={classNames(
                  "px-3 py-1 rounded border",
                  page === i + 1 ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white"
                )}
                onClick={() => setPage(i + 1)}
              >{i + 1}</button>
            ))}
            <button
              className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next</button>
          </div>
        </div>
      </div>

      {/* Modal for viewing order details */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setViewOrder(null)}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">Order Details</h2>
            <div className="mb-3">
              <span className="font-semibold text-gray-600">Order ID:</span> <span className="font-mono">{viewOrder.id}</span>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-600">Customer:</span> {viewOrder.customer}
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-600">Delivery Address:</span>
              <div className="text-gray-700 text-sm mt-1">{viewOrder.address}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-600">Products:</span>
              <div className="divide-y divide-gray-200 mt-2">
                {viewOrder.products.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <img src={p.thumbnail} alt={p.name} className="w-12 h-12 rounded border object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      {/* If you have size, show here: */}
                      {/* <div className="text-xs text-gray-500">Size: {p.size}</div> */}
                      <div className="text-xs text-gray-500">Quantity: {viewOrder.quantity}</div>
                      <div className="text-xs text-gray-500">Price: ₹{viewOrder.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryOrder;