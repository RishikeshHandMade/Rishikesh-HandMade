"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { AlignJustify } from 'lucide-react';
const QuantityManagement = ({ productData, productId }) => {
  const [rows, setRows] = useState([
    { size: '', price: '', qty: '', color: '', coupon: '' }
  ]);
  const [sizes, setSizes] = useState([]); // fetched from API
  const [allColors, setAllColors] = useState([]); // fetched from API
  const [coupons, setCoupons] = useState([]); // fetched from API

  useEffect(() => {
    if (!productId) return;
    // Fetch sizes
    fetch(`/api/productSize?product=${productId}`)
      .then(async res => {
        if (!res.ok) { setSizes([]); return; }
        const data = await res.json();
        setSizes(Array.isArray(data?.sizes) ? data.sizes : []);
      })
      .catch(() => setSizes([]));
    // Fetch colors
    fetch(`/api/productColor?product=${productId}`)
      .then(async res => {
        if (!res.ok) { setAllColors([]); return; }
        const data = await res.json();
        setAllColors(Array.isArray(data?.colors) ? data.colors : []);
      })
      .catch(() => setAllColors([]));
    // Fetch coupons
    fetch('/api/discountCoupon')
      .then(async res => {
        if (!res.ok) { setCoupons([]); return; }
        const data = await res.json();
        console.log(data);
        setCoupons(Array.isArray(data) ? data : []);
      })
      .catch(() => setCoupons([]));
  }, [productId]);

  const productName = productData?.title || "";

  const handleRowChange = (idx, field, value) => {
    setRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }; // qty now supported

  const handleAddRow = () => {
    setRows(rows => [...rows, { size: '', price: '', qty: '', color: '', coupon: '' }]);
  };

  const [saving, setSaving] = useState(false);
  const [allQuantities, setAllQuantities] = useState([]);
  const [viewDialog, setViewDialog] = useState({ open: false, data: null });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Fetch all quantity records
  const fetchQuantities = async () => {
    try {
      const res = await fetch('/api/productQuantity');
      const data = await res.json();
      setAllQuantities(Array.isArray(data) ? data : []);
    } catch {
      setAllQuantities([]);
    }
  };

  useEffect(() => { fetchQuantities(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert table rows to variants
      const variants = rows.map(row => {
        let sizeValue = row.size;
        if (Array.isArray(sizes)) {
          const found = sizes.find(s => (typeof s === 'object' ? (s._id === row.size || s.label === row.size) : s === row.size));
          if (found) sizeValue = found.label || found.name || found._id || found;
        }
        return {
          size: sizeValue,
          color: row.color,
          price: Number(row.price),
          qty: Number(row.qty),
          coupon: row.coupon,
          optional: false // Default optional as false (customize as needed)
        };
      });
      const payload = {
        product: productId,
        variants
      };
      const res = await fetch('/api/productQuantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save quantity');
      }
      toast.success(editMode ? 'Quantity data updated successfully' : 'Quantity data saved successfully');
      setRows([{ size: '', price: '', color: '', coupon: '' }]); // clear form
      setEditMode(false);
      setEditId(null);
      fetchQuantities();
    } catch (err) {
      toast.error(err.message || 'Failed to save quantity');
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const handleEdit = (record) => {
    setRows(record.variants.map(v => {
      let sizeValue = v.size;
      if (Array.isArray(sizes)) {
        // Try to find the object whose label or name matches v.size, and use its _id
        const found = sizes.find(s => (typeof s === 'object' ? (s.label === v.size || s.name === v.size) : s === v.size));
        if (found && found._id) sizeValue = found._id;
      }
      return {
        size: sizeValue || '',
        price: v.price || '',
        qty: v.qty || '',
        color: v.color || '',
        coupon: v.coupon || ''
      };
    }));
    setEditMode(true);
    setEditId(record._id);
  };


  // Cancel edit
  const handleCancelEdit = () => {
    setRows([{ size: '', price: '', qty: '', color: '', coupon: '' }]);
    setEditMode(false);
    setEditId(null);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      const res = await fetch(`/api/productQuantity?id=${deleteDialog.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted successfully');
      setDeleteDialog({ open: false, id: null });
      fetchQuantities();
    } catch {
      toast.error('Failed to delete');
    }
  };



  // --- FORM ---
  const form = (
    <form className="flex flex-col items-center" style={{ maxWidth: 1200 }} onSubmit={handleSubmit}>
      <h3 className="font-semibold my-2 text-center text-xl">Product Total Quantity Management</h3>
      <div className="w-full bg-white rounded shadow p-4">
        <div className="mb-6 flex flex-col items-center justify-center">
          <Label className="font-bold mb-2 text-md">Product Name</Label>
          <Input
            className="mb-4 w-80 font-black text-center border-gray-300"
            value={productName}
            disabled
            readOnly
            placeholder={productName ? "Product Name" : "Product Name not found"}
            style={productName ? {} : { border: '2px solid red', color: 'red' }}
          />
          {!productName && (
            <div style={{ color: 'red', marginTop: '4px', fontWeight: 'bold' }}>
              Product name not found! Please check if the product was created successfully.
            </div>
          )}
        </div>
        <h5 className="font-semibold mb-2 text-center text-xl">Product Quantity Table</h5>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-center">Size</th>
                <th className="border px-2 py-1 text-center">Color</th>
                <th className="border px-2 py-1 text-center">Price</th>
                <th className="border px-2 py-1 text-center">Quantity</th>
                <th className="border px-2 py-1 text-center">Discount Coupon</th>
                <th className="border px-2 py-1 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1"><div className="flex justify-center">
                    <Select value={row.size ?? ''} onValueChange={val => handleRowChange(idx, 'size', val)}>
                      <SelectTrigger className="bg-gray-50 rounded border w-32">
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sizes.map((size, i) => {
                            let value = typeof size === 'string' ? size : (size._id || size.label || String(i));
                            let label = typeof size === 'string' ? size : (size.label || size._id || String(value));
                            return (
                              <SelectItem key={value} value={String(value)}>{label}</SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div></td>

                  <td className="border px-2 py-1"><div className="flex justify-center">
                    <Select value={row.color ?? ''} onValueChange={val => handleRowChange(idx, 'color', val)}>
                      <SelectTrigger className="bg-gray-50 rounded border w-32">
                        <SelectValue placeholder="Select Color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {allColors.map((c, i) => {
                            let value = typeof c === 'string' ? c : (c.hex || c.name || String(i));
                            let label = typeof c === 'string' ? c : (c.name || c.hex || String(value));
                            return (
                              <SelectItem key={value} value={String(value)}>{label}</SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div></td>
                  <td className="border px-2 py-1"><div className="flex justify-center">
                    <Input
                      type="number"
                      min={0}
                      className="w-32 bg-gray-100 rounded"
                      placeholder="Set Price"
                      value={row.price ?? ''}
                      onChange={e => handleRowChange(idx, 'price', e.target.value)}
                    />
                  </div></td>
                  <td className="border px-2 py-1"><div className="flex justify-center">
                    <Input
                      type="number"
                      min={0}
                      className="w-24 bg-gray-50 rounded"
                      placeholder="Qty"
                      value={row.qty ?? ''}
                      onChange={e => handleRowChange(idx, 'qty', e.target.value)}
                    />
                  </div></td>
                  <td className="border px-2 py-1"><div className="flex justify-center">
                    <Select value={row.coupon ?? ''} onValueChange={val => handleRowChange(idx, 'coupon', val)}>
                      <SelectTrigger className="bg-gray-50 rounded border w-40">
                        <SelectValue placeholder="Select Coupon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {coupons.map((coupon, i) => (
                            <SelectItem key={coupon._id || coupon.couponCode || i} value={coupon.couponCode}>
                              {coupon.couponCode} {coupon.amount ? `- ₹${coupon.amount}` : coupon.percent ? `- ${coupon.percent}%` : ''}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div></td>
                  <td className="border px-2 py-1 text-center"><div className="flex justify-center">
                    {idx === rows.length - 1 && (
                      <Button type="button" className="bg-green-500 font-bold px-3 py-1" onClick={handleAddRow}>
                        Add More
                      </Button>
                    )}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <Button type="submit" className="bg-red-500 font-bold px-5" disabled={saving}>{editMode ? 'Update' : 'Data Save'}</Button>
          {editMode && (
            <Button type="button" className="bg-gray-400 font-bold px-5" onClick={handleCancelEdit}>Cancel</Button>
          )}
        </div>
      </div>
    </form>
  );

  // --- TABLE ---
  const table = (
    <div className="w-full mt-10">
      <h4 className="font-bold mb-2 text-lg">All Product Quantities</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-center">S.No</th>
              <th className="border px-2 py-1 text-center">Product Name</th>
              <th className="border px-2 py-1 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allQuantities.map((q, i) => (
              <tr key={q._id}>
                <td className="border px-2 py-1 text-center">{i + 1}</td>
                <td className="border px-2 py-1 text-center">{productName || '-'}</td>
                <td className="border px-2 py-1 text-center flex flex-wrap gap-2 justify-center">
                  {/* View Dialog Trigger */}
                  <Dialog open={viewDialog.open && viewDialog.data?._id === q._id} onOpenChange={open => setViewDialog(open ? { open: true, data: q } : { open: false, data: null })}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-500 text-white">View</Button>
                    </DialogTrigger>
                    <DialogContent style={{ maxWidth: 650 }}>
                      <DialogTitle>Product Quantity Details</DialogTitle>
                      <div className="bg-gray-50 rounded p-4 mb-2">
                        <div><b>Product:</b> {productName || '-'}</div>
                        <div className="mt-2">
                          <b className=''>Variants:</b>
                          <div className="flex flex-col gap-2 items-start justify-center mt-2">
                            {q.variants.map((v, idx) => {
                              // Try to find the size label from sizes array
                              let sizeLabel = v.size;
                              if (Array.isArray(sizes)) {
                                const found = sizes.find(s => (typeof s === 'object' ? (s._id === v.size || s.label === v.size) : s === v.size));
                                if (found) sizeLabel = found.label || found.name || found._id || found;
                              }
                              return (
                                <div key={idx} className="flex flex-wrap gap-2 ">
                                  <span className="bg-gray-200 rounded px-2 py-1 font-medium">Size: {sizeLabel}</span>
                                  <span className="bg-blue-100 rounded px-2 py-1 font-medium">Price: ₹{v.price}</span>
                                  <span className="bg-green-100 rounded px-2 py-1 font-medium">Qty: {v.qty}</span>
                                  <span className="bg-yellow-100 rounded px-2 py-1 font-medium">Color: {v.color}</span>
                                  <span className="bg-pink-100 rounded px-2 py-1 font-medium">Coupon: {v.coupon}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* Edit Button */}
                  <Button size="sm" className="bg-yellow-500 text-white" onClick={() => handleEdit(q)}>Edit</Button>
                  {/* Delete Dialog Trigger */}
                  <AlertDialog open={deleteDialog.open && deleteDialog.id === q._id} onOpenChange={open => setDeleteDialog(open ? { open: true, id: q._id } : { open: false, id: null })}>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" className="bg-red-500 text-white">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quantity Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this quantity record? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
                        <Button className="bg-red-500 text-white" onClick={handleDelete}>Delete</Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {form}
      {table}
    </div>
  );
};

export default QuantityManagement;
