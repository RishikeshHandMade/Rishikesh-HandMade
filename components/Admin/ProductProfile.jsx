"use client"
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import toast from 'react-hot-toast';
import { Copy, QrCode } from "lucide-react";
import ProductQrModal from "./ProductQrModal";


const ProductProfile = () => {
    const [title, setTitle] = useState("");
    const [code, setCode] = useState(""); // Will be auto-generated
    const [artisan, setArtisan] = useState("");
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshTable, setRefreshTable] = useState(false);
    // For inline editing
    const [editingId, setEditingId] = useState(null);

    // QR Modal state
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrModalUrl, setQrModalUrl] = useState("");
    const [qrModalTitle, setQrModalTitle] = useState("");

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
    // Slugify utility
    function slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
    }
    // Copy to clipboard helper
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        toast.success('URL copied!');
    }
    return (
        <>
        <form className="flex flex-col items-center justify-center gap-8 my-20 bg-gray-200 w-full max-w-xl md:max-w-3xl mx-auto p-4 rounded-lg" onSubmit={async e => {
            e.preventDefault();
            if (!title.trim()) return toast.error('Title cannot be empty');
            if (!artisan) return toast.error('Select an artisan');
            if (editingId) {
                // Update mode
                const res = await fetch(`/api/product/${encodeURIComponent(title)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, artisan })
                });
                if (res.ok) {
                    const updated = await res.json();
                    setProducts(ps => ps.map(p => p._id === editingId ? { ...p, title: updated.title, artisan: updated.artisan } : p));
                    setEditingId(null);
                    setTitle("");
                    setArtisan("");
                    toast.success('Product updated!');
                } else {
                    let err;
                    try {
                        err = await res.json();
                    } catch {
                        err = { error: 'Failed to update' };
                    }
                    toast.error(err.error || 'Failed to update');
                }
            } else {
                // Create mode
                await handleSubmit(e);
            }
        }}>
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
            {editingId ? (
                <div className="flex gap-4 mt-4">
                    <Button type="submit" className="bg-green-600">Update</Button>
                    <Button type="button" className="bg-gray-400" onClick={() => { setEditingId(null); setTitle(""); setArtisan(""); }}>Cancel</Button>
                </div>
            ) : (
                <Button type="submit" className="bg-red-500">Save Product</Button>
            )}
        </form>
        {/* Product Table copied inline */}
        <div className="mt-10 flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Product List</h3>
            <table className="border border-gray-300 rounded-lg overflow-hidden" style={{ width: '60%' }}>
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4">S.No.</th>
                        <th className="py-2 px-4">Product Name</th>
                        <th className="py-2 px-4">Product URL</th>
                        <th className="py-2 px-4">Product QR</th>
                        <th className="py-2 px-4">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((prod, idx) => (
                        <tr key={prod._id} className="border-t">
                            <td className="py-2 px-4 text-center">{idx + 1}</td>
                            <td className="py-2 px-4 text-center">
                                <div className="flex flex-col items-center">
                                    <span>{prod.title}</span>
                                </div>
                            </td>
                            <td className="py-2 px-4 text-center">
                                {/* Product URL Copy Button Only */}
                                {prod.title && (() => {
                                    const url = `${window.location.origin}/product/${slugify(prod._id)}`;
                                    return (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(url)}
                                            disabled={!url}
                                            title="Copy Product URL"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    );
                                })()}
                            </td>
                            <td className="py-2 px-4 text-center">
                                {/* Product QR Copy/View Button */}
                                {prod.title && (() => {
                                    const qr = `${window.location.origin}/product/${slugify(prod._id)}`;
                                    return (
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setQrModalUrl(qr);
                                                    setQrModalTitle(prod.title);
                                                    setQrModalOpen(true);
                                                }}
                                                title="View QR & Download"
                                            >
                                                <QrCode className="w-6 h-6" />
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </td>
                            <td className="py-2 px-4">
                                <div className="flex gap-2 justify-center">
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800"
                                        onClick={() => window.location.href = `/admin/add_direct_product/${prod._id}`}
                                    >
                                        Add Info
                                    </button>
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800"
                                        onClick={() => {
                                            setEditingId(prod._id);
                                            setTitle(prod.title);
                                            setArtisan(prod.artisan || "");
                                        }}
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
        {/* QR Modal for viewing/downloading QR code */}
        <ProductQrModal
            open={qrModalOpen}
            onOpenChange={setQrModalOpen}
            qrUrl={qrModalUrl}
            productTitle={qrModalTitle}
        />
        </>
    );
}

export default ProductProfile;
