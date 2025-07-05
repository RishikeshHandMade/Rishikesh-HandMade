"use client";
import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from "next/link";
import { Eye, Loader, MessagesSquare } from "lucide-react";

const statusOptions = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
];

const columns = [
  "Date",
  "Order ID",
  "Customer Name",
  "Amount",
  "Status",
  "Chat",
  "View Order"
];
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.firstName} {order.lastName}</p>
                <p><span className="font-medium">Email:</span> {order.email}</p>
                <p><span className="font-medium">Phone:</span> {order.phone}</p>
                <p><span className="font-medium">Alternate Phone:</span> {order.altPhone || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              <div className="space-y-2">
                <p>{order.address || `${order.street}, ${order.city}, ${order.state} - ${order.pincode}`}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.products?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {item.image?.url && (
                            <img
                              src={item.image.url}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded mr-3"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">₹{item.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{item.qty}</td>
                      <td className="px-4 py-3 text-right">₹{(item.price * item.qty)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-end space-x-4">
              <div className="text-right space-y-2">
                <p><span className="font-medium">Subtotal:</span> ₹{order.subTotal?.toFixed(2)}</p>
                {order.totalDiscount > 0 && (
                  <p><span className="font-medium">Discount:</span> -₹{order.totalDiscount?.toFixed(2)}</p>
                )}
                <p><span className="font-medium">Total:</span> ₹{order.cartTotal?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CodOrderLog = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [filters, setFilters] = useState({
    orderId: '',
    startDate: '',
    endDate: ''
  });

  // Apply filters
  useEffect(() => {
    let result = [...orders];
    
    if (filters.orderId) {
      result = result.filter(order => 
        order.orderId.toLowerCase().includes(filters.orderId.toLowerCase())
      );
    }
    
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      result = result.filter(order => new Date(order.createdAt) >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(order => new Date(order.createdAt) <= end);
    }
    
    setFilteredOrders(result);
  }, [filters, orders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      orderId: '',
      startDate: '',
      endDate: ''
    });
  };

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/admin?type=cod&page=${page}&limit=${pagination.limit}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        setPagination({
          ...pagination,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.total,
          hasNextPage: data.pagination.hasNextPage,
          hasPreviousPage: data.pagination.hasPreviousPage
        });
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching COD orders:', error);
      toast.error('Failed to load COD orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] p-6 flex items-center justify-center">
        <div className="text-lg"><Loader className="animate-spin text-gray-600" /> Loading COD orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">COD Orders</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex-1">
              <input
                type="text"
                name="orderId"
                placeholder="Search by Order ID"
                value={filters.orderId}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="flex items-center">to</span>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {(filters.orderId || filters.startDate || filters.endDate) && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.orderId}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{order.firstName} {order.lastName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">₹{order.cartTotal?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {order.status || 'Pending'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={{
                          pathname: '/admin/chat',
                          query: {
                            userId: order.userId,  // The ID of the user who placed the order
                            orderId: order._id,    // The order ID
                            orderNumber: order.orderId // Human-readable order number
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <MessagesSquare />
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                    {orders.length === 0 ? 'No COD orders found' : 'No orders match your filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            
            {/* Pagination */}
            <div className="flex flex-col items-center justify-center gap-4 mt-6">
              <span className="text-lg font-semibold">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                {pagination.currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Previous
                  </button>
                )}
                {pagination.currentPage < pagination.totalPages && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
        </div>
      </div>

      {
        selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )
      }
    </div >
  );
};

export default CodOrderLog;