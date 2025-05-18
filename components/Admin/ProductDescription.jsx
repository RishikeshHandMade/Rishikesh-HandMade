"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
const ProductDescription = ({ productData, productId }) => {
  const [descriptionDoc, setDescriptionDoc] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewedDesc, setViewedDesc] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fetch description for the current product
  const fetchDescription = async () => {
    setTableLoading(true);
    try {
      const res = await fetch(`/api/productDescription?productId=${productId}`);
      const data = await res.json();
      if (res.ok && data.description) {
        setDescriptionDoc(data.description);

        setTitleTag(data.description.titleTag || "");
        setDescription(data.description.description || "");
      } else {
        setDescriptionDoc(null);
        setTitleTag("");
        setDescription("");
        if (data.error) toast.error(data.error);
      }
    } catch (err) {
      setDescriptionDoc(null);
      setTitleTag("");
      setDescription("");
      toast.error('Error fetching description.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchDescription();
  }, [productId]);
  const [titleTag, setTitleTag] = useState("");
  const [description, setDescription] = useState("");
  const productTitle = productData?.title || "";

  const [loading, setLoading] = useState(false);

  // Handlers for view, edit, delete
  const handleView = (desc) => {
    setViewedDesc(desc);
    setViewModal(true);
  };

  const handleEdit = (desc) => {
    setEditMode(true);
    setEditId(desc._id);
    setTitleTag(desc.titleTag || "");
    setDescription(desc.description || "");
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };
  const confirmDelete = async () => {
    if (!productId) return;
    try {
      const res = await fetch('/api/productDescription', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Description deleted!');
        fetchDescription();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error deleting description.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !description || !titleTag) {
      toast.error('Please provide both a title tag and description for this product.');
      return;
    }
    setLoading(true);
    try {
      const postBody = { productId, description: description.trim(), titleTag: titleTag.trim() };
      const res = await fetch('/api/productDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to save description');
      } else {
        toast.success('Description saved successfully!');
        setDescription("");
        setTitleTag("");
        fetchDescription();
      }
    } catch (err) {
      toast.error('Error saving description.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <form className="page-content" onSubmit={handleSubmit}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-12 col-lg-12">
              <div className="card">
                <div className="card-body px-4 py-2">
                  <div className="mb-3">
                    <div className="mb-4">
                      <label className="font-semibold">Product Name</label>
                      <Input
                        type="text"
                        className="form-control w-1/2"
                        value={productTitle}
                        disabled
                        readOnly
                      />
                    </div>
                    <label className="form-label">Title Tag</label>
                    <Input value={titleTag} onChange={e => setTitleTag(e.target.value)} className="mb-2" />
                    <label className="form-label">Description</label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mb-2" />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" disabled={loading}>{loading ? (editMode ? 'Updating...' : 'Saving...') : (editMode ? 'Update' : 'Save')}</Button>
                      {editMode && (
                        <Button type="button" variant="secondary" onClick={() => {
                          setEditMode(false);
                          setTitleTag("");
                          setDescription("");
                        }}>Cancel</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Product Description Actions */}
      <div className="mt-6">
        <h5 className="mb-3 font-semibold">Product Description Details</h5>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-4 py-3 text-center">S.No</TableHead>
              <TableHead className="px-4 py-3 text-center">Title Tag</TableHead>
              <TableHead className="px-4 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            ) : descriptionDoc ? (
              <TableRow>
                <TableCell className="px-4 py-3 text-center font-medium">1</TableCell>
                <TableCell className="px-4 py-3 text-center whitespace-nowrap">{descriptionDoc.titleTag || '-'}</TableCell>
                <TableCell className="px-4 py-3 flex gap-2 justify-center">
                  <Button size="sm" variant="default" className="bg-blue-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleView(descriptionDoc)}>
                    View
                  </Button>
                  <Button size="sm" variant="default" className="bg-yellow-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEdit(descriptionDoc)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => openDeleteModal(descriptionDoc._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">No description found for this product.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Modal */}
      <Dialog open={viewModal} onOpenChange={setViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Description Details</DialogTitle>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setViewModal(false)}
              aria-label="Close"
            >
              ×
            </button>
          </DialogHeader>
          {viewedDesc && (
            <div className="mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Product Title</div>
                <div className="text-gray-600">{productTitle}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Title Tag</div>
                <div className="text-gray-600">{viewedDesc.titleTag}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Description</div>
                <div className="text-gray-600">{viewedDesc.description}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Description</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this description?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductDescription;

