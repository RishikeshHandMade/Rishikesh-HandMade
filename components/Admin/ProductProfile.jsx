"use client"
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import toast from 'react-hot-toast';


const ProductProfile = () => {
    const [title, setTitle] = useState("");
    const [code, setCode] = useState(""); // Will be auto-generated
    const [price, setPrice] = useState("");
    const [artisan, setArtisan] = useState("");
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshTable, setRefreshTable] = useState(false);

    // Generate product code on mount
    useEffect(() => {
        const generateCode = () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code = "";
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            return code;
        };
        setCode(generateCode());
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch('/api/createArtisan')
            .then(res => res.json())
            .then(data => {
                setArtisans(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, code, artisan })
        });
        if (res.ok) {
            const newProduct = await res.json();
            setTitle(""); setCode(""); setArtisan("");
            // Show new product at the top of the table
            setProducts(prev => [newProduct, ...prev]);
            toast.success('Product saved!');
        } else {
            const err = await res.json();
            toast.error('Failed to save product: ' + (err.error || 'Unknown error'));
        }
    };


    const [products, setProducts] = useState([]);
    useEffect(() => {
        fetch('/api/product')
            .then(res => res.json())
            .then(data => setProducts(Array.isArray(data) ? data : []));
    }, [refreshTable]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        await fetch(`/api/product/${id}`, { method: 'DELETE' });
        setProducts(products => products.filter(p => p._id !== id));
    };
    return (
        <>
        <form className="flex flex-col items-center justify-center gap-8 my-20 bg-gray-200 w-full max-w-xl md:max-w-3xl mx-auto p-4 rounded-lg" onSubmit={handleSubmit}>
            <div className="flex md:flex-row flex-col items-center md:items-end gap-6 w-full">
                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="productCode" className="font-semibold">Product Code</label>
                    <Input name="productCode" className="w-full border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 bg-gray-100" placeholder="Pre Fix" value={code} readOnly />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="productTitle" className="font-semibold">Product Title</label>
                    <Input name="productTitle" className="w-full border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0" placeholder="Type Here:" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="artisan" className="font-semibold">Artisan Name</label>
                    <Select value={artisan} onValueChange={setArtisan} name="artisan" disabled={loading}>
                        <SelectTrigger className="w-full border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0">
                            <SelectValue placeholder={loading ? 'Loading artisans...' : 'Select Artisan'} />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-blue-600 bg-gray-200">
                            <SelectGroup>
                                {artisans.length > 0 ? (
                                    artisans.map(a => (
                                        <SelectItem key={a._id} value={a._id} className="focus:bg-blue-300 font-bold">
                                            {a.title ? `${a.title} ` : ''}{a.firstName} {a.lastName}
                                        </SelectItem>
                                    ))
                                ) : null}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button type="submit" className="bg-red-500">Save Product</Button>
        </form>
        {/* Product Table copied inline */}
        <div className="mt-10 flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Product List</h3>
            <table className="border border-gray-300 rounded-lg overflow-hidden" style={{ width: '60%' }}>
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4">S.No.</th>
                        <th className="py-2 px-4">Product Name</th>
                        <th className="py-2 px-4">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((prod, idx) => (
                        <tr key={prod._id} className="border-t">
                            <td className="py-2 px-4 text-center">{idx + 1}</td>
                            <td className="py-2 px-4 text-center">{prod.title}</td>
                            <td className="py-2 px-4">
                                <div className="flex gap-2 justify-center">
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800"
                                        onClick={() => window.location.href = `/admin/add_direct_product/${prod._id}`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800"
                                        onClick={() => handleDelete(prod._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
}

export default ProductProfile;
