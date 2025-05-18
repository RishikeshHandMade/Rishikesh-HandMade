"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
const VideoManagement = ({ productData, productId }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const productTitle = productData?.title || "";

  const [loading, setLoading] = useState(false);


  // Table and modal/dialog states
  const [videos, setVideos] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl || !productId) {
      toast.error('Please provide a video URL and valid product.');
      return;
    }
    setLoading(true);
    try {
      let res, data;
      if (isEditMode && editTargetUrl) {
        // PATCH request to update video URL (send full array)
        const updatedVideos = videos.map(v => (v === editTargetUrl ? videoUrl : v));
        res = await fetch('/api/productVideo', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, videos: updatedVideos })
        });
        data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to update video');
        } else {
          setVideos(updatedVideos);
          toast.success('Video updated successfully!');
          setIsEditMode(false);
          setEditTargetUrl(null);
          setVideoUrl("");
        }
      } else {
        // POST request to add new video
        res = await fetch('/api/productVideo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, videoUrl })
        });
        data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to save video');
        } else {
          toast.success('Video saved successfully!');
          setVideos([...videos, videoUrl]);
          setVideoUrl("");
        }
      }
    } catch (err) {
      toast.error('Error saving video.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch product list and videos on mount
  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch('/api/product');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    }
    async function fetchVideos() {
      // If productId is available, fetch videos for this product
      if (productId) {
        const res = await fetch(`/api/productVideo?productId=${productId}`);
        const data = await res.json();
        if (data && data.video && Array.isArray(data.video.videos)) {
          setVideos(data.video.videos);
        } else {
          setVideos([]);
        }
      }
    }
    fetchProducts();
    fetchVideos();
  }, [productId]);

  // Helper to get product name by id
  const getProductName = (pid) => {
    if (productData && productData._id === pid) return productData.title;
    const found = products.find(p => p._id === pid);
    return found ? found.title : 'Unknown';
  };

  // View handler
  const handleView = (videoUrl) => {
    setSelectedVideo({ videoUrl, productName: getProductName(productId) });
    setShowViewModal(true);
  };

  // Edit handler
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTargetUrl, setEditTargetUrl] = useState(null);

  const handleEdit = (videoUrl) => {
    setVideoUrl(videoUrl);
    setIsEditMode(true);
    setEditTargetUrl(videoUrl);
  };


  // Delete handler
  const handleDelete = (videoUrl) => {
    setDeleteTarget(videoUrl);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch('/api/productVideo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, videoUrl: deleteTarget })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to delete video');
      } else {
        toast.success('Video deleted successfully!');
        setVideos(videos.filter(url => url !== deleteTarget));
        setShowDeleteDialog(false);
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error('Error deleting video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="page-content" onSubmit={handleSubmit}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-12 col-lg-12">
              <h4 className="my-3 text-center">Video Management</h4>
              <div className="card my-2">
                <div className="card-body px-4 py-2">
                  <div className="mb-4">
                    <label className="font-semibold">Product Name</label>
                    <Input
                      type="text"
                      className="form-control"
                      value={productTitle}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Product Video URL</label>
                    <div className="input-group">
                      <Input type="text" className="form-control" placeholder="Youtube URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                    </div>
                  </div>
                  <div className="text-center">
                    <Button type="submit" className="bg-red-500 px-5" disabled={loading}>{loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Data Save')}</Button>
                    {isEditMode && (
                      <Button type="button" variant="secondary" className="ml-2" onClick={() => { setIsEditMode(false); setEditTargetUrl(null); setVideoUrl(""); }}>Cancel Edit</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Video Table */}
      <div className="container-fluid mt-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-3">Product Videos</h5>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">S.No</TableHead>
                        <TableHead className="text-center">Product Name</TableHead>
                        <TableHead className="text-center">Link</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No videos found.</TableCell>
                        </TableRow>
                      ) : (
                        videos.map((url, idx) => (
                          <TableRow key={url}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{getProductName(productId)}</TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-blue-600 underline cursor-pointer">Link</span>
                                  </TooltipTrigger>
                                  <TooltipContent>{url}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="outline" size="sm" onClick={() => handleView(url)} title="View">View</Button>{' '}
                              <Button variant="outline" size="sm" onClick={() => handleEdit(url)} title="Edit">Edit</Button>{' '}
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(url)} title="Delete">Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Details</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
            <div className="font-semibold text-gray-800">Product Name</div>
            <div className="text-gray-600">{selectedVideo?.productName}</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
            <div className="font-semibold text-gray-800">YouTube URL</div>
            <a href={selectedVideo?.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedVideo?.videoUrl}</a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this video?</div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoManagement;
