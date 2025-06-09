import React, { useState } from "react";

// Mock order data
const mockOrders = [
    {
        id: "34VB5540K83",
        date: "2025-01-21",
        total: 358.75,
        status: "IN PROGRESS",
    },
    {
        id: "78A643CD409",
        date: "2025-02-09",
        total: 760.5,
        status: "CANCELED",
    },
    {
        id: "112P45A9QV2",
        date: "2025-01-15",
        total: 1264.0,
        status: "DELAYED",
    },
    {
        id: "28BA67UO981",
        date: "2025-01-19",
        total: 198.35,
        status: "DELIVERED",
    },
    {
        id: "502TR872W2",
        date: "2025-01-04",
        total: 2133.9,
        status: "DELIVERED",
    },
    {
        id: "47H76G09F33",
        date: "2025-01-30",
        total: 886.4,
        status: "DELIVERED",
    },
    {
        id: "53U76G09E38",
        date: "2025-01-21",
        total: 886.4,
        status: "DELIVERED",
    },
    {
        id: "31M76G09G76",
        date: "2025-01-07",
        total: 812.4,
        status: "DELIVERED",
    },
    // Add more orders to test pagination
    ...Array.from({ length: 18 }, (_, i) => ({
        id: `MOCKORDER${i + 1}`,
        date: `2025-01-${(i % 28) + 1}`,
        total: (Math.random() * 2000 + 100).toFixed(2),
        status: ["IN PROGRESS", "CANCELED", "DELIVERED", "DELAYED"][i % 4],
    })),
];

const PAGE_SIZE = 10;

const statusStyles = {
    "IN PROGRESS": "bg-blue-500 text-white",
    CANCELED: "bg-red-500 text-white",
    DELIVERED: "bg-green-500 text-white",
    DELAYED: "bg-yellow-500 text-white",
};

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

/**
 * AllOrders component
 * @param {Object} props
 * @param {function} props.onViewOrder - Called with order object when 'View' is clicked. Optional.
 */
const AllOrders = ({ onViewOrder = () => {} }) => {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(mockOrders.length / PAGE_SIZE);
    const paginatedOrders = mockOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-3 px-2 font-semibold text-sm text-[#333]">ORDER #</th>
                            <th className="py-3 px-2 font-semibold text-sm text-[#333]">DATE PURCHASED</th>
                            <th className="py-3 px-2 font-semibold text-sm text-[#333]">STATUS</th>
                            <th className="py-3 px-2 font-semibold text-sm text-[#333]">TOTAL</th>
                            <th className="py-3 px-2 font-semibold text-sm text-[#333]">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order, idx) => (
                            <tr
                                key={order.id}
                                className={
                                    "border-b hover:bg-[#f8f4ef] transition " +
                                    (idx % 2 === 1 ? "bg-[#fcf7f1]" : "bg-white")
                                }
                            >
                                <td className="py-3 px-2 font-mono text-[15px] text-[#222]">#{order.id}</td>
                                <td className="py-3 px-2 text-[15px] text-gray-700">{formatDate(order.date)}</td>
                                <td className="py-3 px-2">
                                    <span className={`inline-block px-3 py-1 rounded font-semibold text-xs ${statusStyles[order.status]}`}>{order.status}</span>
                                </td>
                                <td className="py-3 px-2 text-[15px] text-gray-800 font-semibold">
                                    ${parseFloat(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-2">
                                    <button
                                        className="text-[#d72660] font-semibold hover:underline text-[15px]"
                                        onClick={() => onViewOrder(order)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
                <button
                    className="border px-4 py-1.5 rounded-full text-[15px] disabled:opacity-50"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                    PREV
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={`border px-4 py-1.5 rounded-full text-[15px] ${page === i + 1 ? "bg-black text-white" : "bg-white text-black"}`}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    className="border px-4 py-1.5 rounded-full text-[15px] disabled:opacity-50"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                    NEXT
                </button>
            </div>
        </div>
    );
};

export default AllOrders;