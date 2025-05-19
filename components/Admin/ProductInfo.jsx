"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
const productInfo = ({ productData, productId }) => {
  const [sections, setSections] = useState([]); // Array of {title, description}
  const [tableLoading, setTableLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewedSection, setViewedSection] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);

  // Fetch all sections for the current product
  const fetchSections = async () => {
    setTableLoading(true);
    try {
      const res = await fetch(`/api/productInfo?productId=${productId}`);
      const data = await res.json();
      if (res.ok && data.info && Array.isArray(data.info.info)) {
        setSections(data.info.info);
      } else {
        setSections([]);
        if (data.error) toast.error(data.error);
      }
    } catch (err) {
      setSections([]);
      toast.error('Error fetching product info sections.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchSections();
  }, [productId]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const productTitle = productData?.title || "";
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleView = (section) => {
    setViewedSection(section);
    setViewModal(true);
  };

  const handleEdit = (section, idx) => {
    setEditMode(true);
    setEditIndex(idx);
    setTitle(section.title);
    setDescription(section.description);
  };

  const openDeleteModal = (idx) => {
    setDeleteTargetIndex(idx);
    setShowDeleteModal(true);
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetIndex(null);
  };
  const confirmDelete = async () => {
    if (!productId || deleteTargetIndex === null) return;
    setLoading(true);
    try {
      const res = await fetch('/api/productInfo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sectionIndex: Number(deleteTargetIndex) })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Section deleted!');
        fetchSections();
        if (editIndex === deleteTargetIndex) {
          setEditMode(false);
          setEditIndex(null);
          setTitle("");
          setDescription("");
        }
      } else {
        toast.error(data.error || 'Failed to delete section');
      }
    } catch (err) {
      toast.error('Error deleting section.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetIndex(null);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !title.trim() || !description.trim()) {
      toast.error('Please provide both a heading and description for this section.');
      return;
    }
    setLoading(true);
    try {
      if (editMode && editIndex !== null) {
        // PATCH to update section
        const res = await fetch('/api/productInfo', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, sectionIndex: editIndex, title: title.trim(), description: description.trim() })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to update section');
        } else {
          toast.success('Section updated successfully!');
          setTitle("");
          setDescription("");
          setEditMode(false);
          setEditIndex(null);
          fetchSections();
        }
      } else {
        // POST to add section
        const res = await fetch('/api/productInfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, title: title.trim(), description: description.trim() })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to add section');
        } else {
          toast.success('Section added successfully!');
          setTitle("");
          setDescription("");
          fetchSections();
        }
      }
    } catch (err) {
      toast.error('Error saving section.');
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
                    <label className="form-label">Section Heading</label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} className="mb-2" placeholder="Enter heading (e.g. Product Details, Shipping & Return, etc.)" />
                    <label className="form-label">Section Description</label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mb-2" placeholder="Enter description for this section" />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" disabled={loading}>{loading ? (editMode ? 'Updating...' : 'Saving...') : (editMode ? 'Update' : 'Add Section')}</Button>
                      {editMode && (
                        <Button type="button" variant="secondary" onClick={() => {
                          setEditMode(false);
                          setEditIndex(null);
                          setTitle("");
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

      {/* Product Info Sections Table */}
      <div className="mt-6">
        <h5 className="mb-3 font-semibold">Product Info Sections</h5>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-4 py-3 text-center">S.No</TableHead>
              <TableHead className="px-4 py-3 text-center">Heading</TableHead>
              <TableHead className="px-4 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            ) : sections.length > 0 ? (
              sections.map((section, idx) => (
                <TableRow key={idx}>
                  <TableCell className="px-4 py-3 text-center font-medium">{idx + 1}</TableCell>
                  <TableCell className="px-4 py-3 text-center whitespace-nowrap">{section.title}</TableCell>
                  <TableCell className="px-4 py-3 flex gap-2 justify-center">
                    <Button size="sm" variant="default" className="bg-blue-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleView(section)}>
                      View
                    </Button>
                    <Button size="sm" variant="default" className="bg-yellow-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEdit(section, idx)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => openDeleteModal(idx)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">No sections found for this product.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Modal */}
      <Dialog open={viewModal} onOpenChange={setViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Section Details</DialogTitle>
          </DialogHeader>
          {viewedSection && (
            <div className="mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Heading</div>
                <div className="text-gray-600">{viewedSection.title}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                <div className="font-semibold text-gray-800">Description</div>
                <div className="text-gray-600">{viewedSection.description}</div>
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
            <DialogTitle>Delete Section</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this section?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default productInfo;

