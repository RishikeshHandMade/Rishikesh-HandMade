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


const orderStatusOptions = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];



const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const rowsPerPage = 8;

  // Fetch orders from backend API
  React.useEffect(() => {
    async function fetchOrders() {
      try {
        let res = await fetch("/api/orders/admin");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      }
    }
    fetchOrders();
  }, []);

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

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
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
                <th className="p-3 text-left">S.No</th>
                <th className="p-3 text-left">Customer Name</th>
                <th className="p-3 text-left">Product Name(s)</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3 text-center">Price</th>
                {/* <th className="p-3 text-center">Payment</th> */}
                <th className="p-3 text-center">Order Status</th>
                <th className="p-3 text-center">Order Date</th>
                {/* <th className="p-3 text-left">Delivery Address</th> */}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-blue-50 transition-colors"
                >
                  <td className="p-3 font-mono text-xs">{idx + 1}</td>
                  <td className="p-3">{`${order.firstName || ''} ${order.lastName || ''}`.trim() || order.email || order.phone}</td>
                  <td className="p-3 flex items-center justify-center gap-1">
                    {order.products && order.products.slice(0, 1).map((p, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {p.image && p.image.url && <img src={p.image.url} alt={p.name} className="w-12 h-12 rounded object-cover border" />}
                        <span>{p.name}</span>
                      </span>
                    ))}
                    {order.products && order.products.length > 1 && (
                      <span className="text-xs text-gray-500 ml-2">+{order.products.length - 1} more</span>
                    )}
                  </td>
                  <td className="p-3 text-center">{order.products && order.products.reduce((sum, p) => sum + (Number(p.qty) || 0), 0)}</td>
                  <td className="p-3 text-right font-semibold">₹{order.cartTotal || order.subTotal || 0}</td>
                  <td className="p-3 text-center">
                    <span
                      className={classNames(
                        "px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150",
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : order.status === "Cancelled"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : order.status === "Processing"
                              ? "bg-blue-100 text-blue-700 border border-blue-300"
                              : order.status === "Shipped"
                                ? "bg-purple-100 text-purple-700 border border-purple-300"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                      )}
                      title={order.status}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                  {/* <td className="p-3 text-center">
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
                  </td> */}
                  <td className="p-3 text-center">{order.datePurchased ? new Date(order.datePurchased).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  {/* <td className="p-3 max-w-xs truncate">{order.address}</td> */}
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button className="p-2 rounded hover:bg-blue-100" title="View" onClick={() => setViewOrder(order)}><Eye className="text-blue-600" size={18} /></button>
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
                <span className="font-semibold text-gray-600">Order ID:</span> <span className="font-mono">{viewOrder.orderId}</span>
              </div>
              <div className="mb-3">
                <span className="font-semibold text-gray-600">Customer:</span> {viewOrder.firstName} {viewOrder.lastName}
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
                      <img src={p.image.url} alt={p.name} className="w-12 h-12 rounded border object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold">{p.name}</div>
                        {p.size && <div className="text-xs text-gray-500">Size: {p.size}</div>}
                        {p.weight && <div className="text-xs text-gray-500">Weight: {p.weight}</div>}
                        {p.color && <div className="text-xs text-gray-500">Color: {p.color}</div>}
                        <div className="text-xs text-gray-500">Quantity: {p.qty}</div>
                        <div className="text-xs text-gray-500">Price: ₹{p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;