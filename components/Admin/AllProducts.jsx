"use client";
import React, { useState } from "react";
import {
  Bell,
  UserCircle,
  Search,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

const demoCategories = ["Shawls", "Baskets", "Caps", "Scarves", "Jewelry"];

const demoProducts = [
  {
    id: "SKU123456",
    name: "Handmade Shawl",
    image: "/shawl.jpg",
    price: 1299,
    stock: 12,
    category: "Shawls",
    status: "In Stock",
    productType: "Category",
    artisan: "Akhil Sharma",
  },
  {
    id: "SKU123457",
    name: "Bamboo Basket",
    image: "/basket.jpg",
    price: 699,
    stock: 0,
    category: "Baskets",
    status: "Out of Stock",
    productType: "Direct",
    artisan: "Priya Singh",
  },
  {
    id: "SKU123458",
    name: "Woolen Cap",
    image: "/cap.jpg",
    price: 399,
    stock: 22,
    category: "Caps",
    status: "In Stock",
    productType: "Category",
    artisan: "Akhil Sharma",
  },
  // Add more demo products as needed
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priceLow", label: "Price Low to High" },
  { value: "priceHigh", label: "Price High to Low" },
];

const AllProducts = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [artisan, setArtisan] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [sort, setSort] = useState("");
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [products, setProducts] = useState(demoProducts);

  // Get unique artisan names from products
  const artisanNames = Array.from(new Set(products.map(p => p.artisan)));

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setProductType("");
    setArtisan("");
    setMinPrice("");
    setMaxPrice("");
    setStockStatus("");
    setSort("");
    setDate("");
    setDay("");
    setMonth("");
    setYear("");
  };

  // Filtering logic
  const filteredProducts = products.filter((p) => {
    let match = true;
    if (search) {
      match =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
    }
    if (category && match) match = p.category === category;
    if (productType && match) match = p.productType === productType;
    if (artisan && match) match = p.artisan === artisan;
    if (stockStatus && match) match = p.status === stockStatus;
    if (minPrice && match) match = p.price >= Number(minPrice);
    if (maxPrice && match) match = p.price <= Number(maxPrice);
    // Date, Day, Month, Year filtering (if products have date field, implement here)
    // Example: if (date && match) match = p.createdAt === date;
    // if (day && match) match = new Date(p.createdAt).getDate() === Number(day);
    // if (month && match) match = new Date(p.createdAt).getMonth() + 1 === Number(month);
    // if (year && match) match = new Date(p.createdAt).getFullYear() === Number(year);
    return match;
  });
  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "newest") return b.id.localeCompare(a.id);
    if (sort === "oldest") return a.id.localeCompare(b.id);
    if (sort === "priceLow") return a.price - b.price;
    if (sort === "priceHigh") return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-blue-700">All Products</span>
        </div>
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
      {/* Filter Bar */}
      <div className="w-full bg-white px-6 py-4 shadow flex flex-wrap gap-3 items-center justify-between border-b">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or SKU"
              className="px-4 py-2 pl-10 border rounded bg-gray-100 focus:outline-none min-w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          <select
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[120px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {demoCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {/* Product Type Filter */}
          <select
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[120px]"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Direct">Direct Product</option>
            <option value="Category">Category Product</option>
          </select>
          {/* Artisan Name Filter */}
          <select
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[140px]"
            value={artisan}
            onChange={(e) => setArtisan(e.target.value)}
          >
            <option value="">All Artisans</option>
            {artisanNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {/* Date, Day, Month, Year Filters */}
          <input
            type="date"
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[150px]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[80px]"
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
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[100px]"
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
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[90px]"
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
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min Price"
              className="px-2 py-2 border rounded bg-gray-100 focus:outline-none w-20"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max Price"
              className="px-2 py-2 border rounded bg-gray-100 focus:outline-none w-20"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[120px]"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option value="">All Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <select
            className="px-3 py-2 border rounded bg-gray-100 focus:outline-none min-w-[160px]"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort By</option>
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
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
      {/* Products Table */}
      <div className="flex-1 overflow-x-auto p-4">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">SKU / ID</th>
              <th className="p-3 text-center">Price</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">Category</th>
              <th className="p-3 text-center">Type</th>
              <th className="p-3 text-center">Artisan</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, idx) => (
              <tr
                key={product.id}
                className="border-b hover:bg-blue-50 transition-colors"
              >
                <td className="p-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded border object-cover shadow-sm bg-white"
                  />
                </td>
                <td className="p-3 font-semibold">{product.name}</td>
                <td className="p-3 font-mono text-xs">{product.id}</td>
                <td className="p-3 text-center">₹{product.price}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold
                      ${product.status === "In Stock"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"}
                    `}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="p-3 text-center">{product.category}</td>
                <td className="p-3 text-center">{product.productType}</td>
                <td className="p-3 text-center">{product.artisan}</td>
                <td className="p-3 text-center flex gap-2 justify-center">
                  <button
                    className="p-2 rounded hover:bg-green-100"
                    title="Edit"
                  >
                    <Edit className="text-green-600" size={18} />
                  </button>
                  <button
                    className="p-2 rounded hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 className="text-red-600" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllProducts;