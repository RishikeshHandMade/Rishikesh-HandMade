import React, { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { X, Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../ui/dialog';
import toast from "react-hot-toast"
const ApplyCoupon = ({ productData, productId }) => {
  const [coupons, setCoupons] = useState([]); // All available coupons
  const [selectedCoupons, setSelectedCoupons] = useState([]); // Selected coupon codes
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allProductCoupons, setAllProductCoupons] = useState([]); // All product-coupon mappings
  const [products, setProducts] = useState([]); // All products
  const [editProductId, setEditProductId] = useState(null); // For editing
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null });
  const productTitle = productData?.title || "";
  // Fetch available coupons and product's applied coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        // Fetch all available coupons
        const res = await fetch('/api/discountCoupon');
        const data = await res.json();
        if (Array.isArray(data)) setCoupons(data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };


    // Fetch all product-coupon mappings for table
    const fetchAllProductCoupons = async () => {
      try {
        const res = await fetch('/api/productCoupon');
        const data = await res.json();
        setAllProductCoupons(Array.isArray(data) ? data : []);
      } catch (err) {
        setAllProductCoupons([]);
      }
    };

    // Fetch all products (for product name lookup)
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/product'); // You may need to implement this endpoint if not present
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setProducts([]);
      }
    };

    fetchAllProductCoupons();

    fetchCoupons();
    fetchProducts();
  }, []);

  // When editing, fetch coupons for that product
  useEffect(() => {
    if (!editProductId) return;
    const fetchProductCoupons = async () => {
      try {
        const res = await fetch(`/api/productCoupon?productId=${editProductId}`);
        const data = await res.json();
        setSelectedCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      } catch (err) {
        setSelectedCoupons([]);
      }
    };
    fetchProductCoupons();
  }, [editProductId]);

  // Always clear selectedCoupons when exiting edit mode
  useEffect(() => {
    if (editProductId === null) {
      setSelectedCoupons([]);
    }
  }, [editProductId]);

  // Add coupon
  const handleSelectCoupon = (couponCode) => {
    if (!selectedCoupons.includes(couponCode)) {
      setSelectedCoupons([...selectedCoupons, couponCode]);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = (couponCode) => {
    setSelectedCoupons(selectedCoupons.filter(code => code !== couponCode));
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      <div className="w-[80%] mx-auto">

        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
            value={productTitle || 'N/A'}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Discount Coupon</label>
          <Select onValueChange={handleSelectCoupon}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loading ? 'Loading...' : 'Select coupon'} />
            </SelectTrigger>
            <SelectContent>
              {coupons.length === 0 && (
                <div className="p-2 text-gray-400">No coupons found</div>
              )}
              {coupons.map(coupon => (
                <SelectItem key={coupon._id} value={coupon.couponCode} disabled={selectedCoupons.includes(coupon.couponCode)}>
                  {coupon.couponCode} {coupon.percent ? `(${coupon.percent}% off)` : coupon.amount ? `(-₹${coupon.amount})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCoupons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCoupons.map(code => (
                <Badge key={code} variant="secondary" className="flex items-center gap-1 pr-1">
                  {code}
                  <button className="ml-1" onClick={() => handleRemoveCoupon(code)}>
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div>
          <button
            className="mt-4 px-4 py-2 rounded bg-primary text-white hover:bg-primary/80 disabled:opacity-60"
            disabled={saving || !(editProductId || productId)}
            onClick={async () => {
              setSaving(true);
              try {
                const payload = { productId: editProductId || productId, coupons: selectedCoupons };
                const res = await fetch('/api/productCoupon', {
                  method: editProductId ? 'PATCH' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                  toast.success('Coupons saved!');
                  setEditProductId(null);
                  setSelectedCoupons([]);
                  // Refresh table
                  const allRes = await fetch('/api/productCoupon');
                  setAllProductCoupons(await allRes.json());
                  
                } else if (res.status === 409) {
                  toast.error(data.error || 'Coupons for this product already exist.');
                  // Do not clear the form
                } else {
                  toast.error(data.error || 'Failed to save coupons');
                }
              } catch (err) {
                toast.error('Failed to save coupons');
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? (editProductId ? 'Updating...' : 'Saving...') : (editProductId ? 'Update Coupons' : 'Save Coupons')}
          </button>
          {editProductId && (
            <button
              className="ml-2 px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => {
                setEditProductId(null);
                setSelectedCoupons([]);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      {/* Table of all product-coupon mappings */}
      <div className="mt-10 w-[80%] mx-auto" >
        <h3 className="font-semibold mb-2">All Product Coupons</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">S.No</th>
                <th className="border p-2">Product Name</th>
                <th className="border p-2">Coupons</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allProductCoupons.length === 0 && (
                <tr><td colSpan={4} className="text-center py-2">No data</td></tr>
              )}
              {allProductCoupons.map((row, idx) => {
                const prod = products.find(p => p._id === row.productId) || {};
                return (
                  <tr key={row.productId}>
                    <td className="border p-2 text-center">{idx + 1}</td>
                    <td className="border p-2 text-center">{row.productId?.title || "N/A"}</td>
                    <td className="border p-2 text-center">
                      <div className="flex flex-wrap gap-1">
                        {row.coupons.map(code => (
                          <Badge key={code} variant="secondary">{code}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="border p-2 text-center">
                      <button className="mr-2 text-blue-600 hover:underline border rounded-2 border-blue-600 p-1 font-semibold" title="Edit" onClick={() => {
                        setEditProductId(row.productId);
                      }}>Edit</button>
                      <Dialog open={deleteDialog.open && deleteDialog.productId === row.productId} onOpenChange={open => setDeleteDialog({ open, productId: open ? row.productId : null })}>
                        <DialogTrigger asChild>
                          <button className="text-red-600 hover:underline border rounded-2 border-red-600 p-1 font-semibold" title="Delete" onClick={() => setDeleteDialog({ open: true, productId: row.productId })}>Delete</button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Coupon Mapping</DialogTitle>
                          </DialogHeader>
                          <div className="my-4">Are you sure you want to delete coupons for <b>{prod.title || prod.name || row.productId}</b>?</div>
                          <DialogFooter>
                            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteDialog({ open: false, productId: null })}>Cancel</button>
                            <button className="ml-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={async () => {
                              try {
                                const res = await fetch('/api/productCoupon', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ productId: row.productId })
                                });
                                if (res.ok) {
                                  toast.success('Deleted!');
                                  setAllProductCoupons(allProductCoupons.filter(r => r.productId !== row.productId));
                                } else {
                                  toast.error('Delete failed');
                                }
                              } catch {
                                toast.error('Delete failed');
                              } finally {
                                setDeleteDialog({ open: false, productId: null });
                              }
                            }}>Delete</button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ApplyCoupon