"use client";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  Store,
  X
} from "lucide-react";



function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}


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


const EnquiryOrder = () => {
  const [orders, setOrders] = useState([]);
  // console.log(orders)
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null); // For view modal
  const [statusUpdateOrder, setStatusUpdateOrder] = useState(null); // For status update modal
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const rowsPerPage = 8;
  console.log(orders)
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
  useEffect(() => {
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
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
              // onClick={handleReset}
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
                <tr key={order._id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 font-mono text-blue-700">{idx + 1}</td>
                  <td className="p-3">{`${order.firstName || ''} ${order.lastName || ''}`.trim() || order.email || order.phone}</td>
                  <td className="p-3 flex flex-col gap-1 items-start">
                    {order.products && order.products.slice(0, 2).map((p, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {p.image && p.image.url && <img src={p.image.url} alt={p.name} className="w-8 h-8 rounded object-cover border" />}
                        <span>{p.name}</span>
                      </span>
                    ))}
                    {order.products && order.products.length > 2 && (
                      <span className="text-xs text-gray-500 ml-2">+{order.products.length - 2} more</span>
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
                  <td className="p-3 text-center">
                    <div className="relative inline-block w-32">
                      <select
                        className={classNames(
                          "block w-full px-3 py-2 pr-8 rounded border text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer transition-all duration-150",
                          order.status === "Delivered"
                            ? "bg-green-50 border-green-400 text-green-800"
                            : order.status === "Cancelled"
                              ? "bg-red-50 border-red-400 text-red-800"
                              : order.status === "Processing"
                                ? "bg-blue-50 border-blue-400 text-blue-800"
                                : order.status === "Shipped"
                                  ? "bg-purple-50 border-purple-400 text-purple-800"
                                  : "bg-gray-50 border-gray-300 text-gray-700"
                        )}
                        value={order.status}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setStatusUpdateOrder(order);
                          setStatusMessage('');
                          setTrackingNumber('');
                          setTrackingUrl('');
                        }}
                      >
                        {orderStatusOptions.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">{order.datePurchased ? new Date(order.datePurchased).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  {/* <td className="p-3 max-w-xs truncate">{order.address}</td> */}
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button className="py-2 rounded hover:bg-blue-100" title="View" onClick={() => setViewOrder(order)}><Eye className="text-blue-600" size={18} /></button>
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

      {/* Modal for status update */}
      {statusUpdateOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setStatusUpdateOrder(null)}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">Update Order Status</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <div className="relative">
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Message (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Add a message about this status update..."
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
              />
            </div>

            {/* Tracking Information (only shown when status is Shipped) */}
            {selectedStatus === 'Shipped' && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700">Shipping Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/tracking/123"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setStatusUpdateOrder(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={async () => {
                  try {
                    const updateData = {
                      status: selectedStatus,
                      message: statusMessage || `Status updated to ${selectedStatus}`,
                      // Always include these fields to ensure they're updated
                      ...(selectedStatus === 'Shipped' && {
                        trackingNumber: trackingNumber || '',
                        trackingUrl: trackingUrl || ''
                      })
                    };
                    
                    console.log('Sending update data:', updateData);

                    const res = await fetch(`/api/orders/${statusUpdateOrder._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updateData)
                    });
                    
                    const data = await res.json();
                    console.log('Update response:', data);
                    if (!data.success) {
                      throw new Error(data.error || 'Update failed');
                    }
                    
                    // Update local state
                    setOrders(orders => orders.map(o =>
                      o._id === statusUpdateOrder._id 
                        ? { 
                            ...o, 
                            status: selectedStatus,
                            statusHistory: [
                              ...(o.statusHistory || []),
                              {
                                status: selectedStatus,
                                message: statusMessage || `Status updated to ${selectedStatus}`,
                                ...(selectedStatus === 'Shipped' && {
                                  trackingNumber: trackingNumber,
                                  trackingUrl: trackingUrl
                                }),
                                updatedAt: new Date().toISOString()
                              }
                            ]
                          } 
                        : o
                    ));
                    
                    toast.success('Order status updated!');
                    setStatusUpdateOrder(null);
                  } catch (err) {
                    console.error('Error updating status:', err);
                    toast.error('Failed to update order status: ' + err.message);
                  }
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="mb-3">
                <span className="font-semibold text-gray-600">Order Status History:</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(viewOrder.statusHistory || []).length > 0 ? (
                    [...(viewOrder.statusHistory || [])]
                      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
                      .map((history, idx) => (
                        <div key={idx} className="text-sm p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                          <div className="font-medium">{history.status}</div>
                          <div className="text-gray-600">{history.message}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(history.updatedAt || 0).toLocaleString()}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-gray-500">No status history available</div>
                  )}
                </div>
              </div>
              
              <span className="font-semibold text-gray-600">Products:</span>
              <div className="divide-y divide-gray-200 mt-2">
                {viewOrder.products.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <img src={p?.image} alt={p.name} className="w-12 h-12 rounded border object-cover" />
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
  );
};

export default EnquiryOrder;