"use client";
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const ProductGallery = ({ productData, productId }) => {
  console.log('ProductGallery received productId:', productId);
  console.log(productId)
  const imageInputRef = useRef(null);
  const [selectedMainImage, setSelectedMainImage] = useState(null); // { url, key }
  const [selectedSubImages, setSelectedSubImages] = useState([]); // array of { url, key }
  const [imageUploading, setImageUploading] = useState(false);
  const [subImagesUploading, setSubImagesUploading] = useState(false);
  const subImagesInputRef = useRef(null);
  const [selectedImages, setselectedImages] = useState([])

  // Add missing handleFileUpload functions
  const handleFileUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [fetchedTitle, setFetchedTitle] = useState("");
  useEffect(() => {
    if (!productData && productId) {
      fetch(`/api/product/${productId}`)
        .then(async res => {
          if (!res.ok) {
            setFetchedTitle("");
            return;
          }
          const text = await res.text();
          if (!text) {
            setFetchedTitle("");
            return;
          }
          const data = JSON.parse(text);
          setFetchedTitle(data.title || "");
        })
        .catch(() => setFetchedTitle(""));
    }
  }, [productData, productId]);
  const productgalley = productData?.title || "";

  // Gallery Table State
  const [galleries, setGalleries] = useState([]);
  const [loadingGalleries, setLoadingGalleries] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGallery, setEditGallery] = useState(null);
  const [editMainImage, setEditMainImage] = useState("");
  const [editSubImages, setEditSubImages] = useState([]);

  // Fetch galleries for this product
  useEffect(() => {
    if (!productId) return;
    setLoadingGalleries(true);
    fetch(`/api/productGallery?productId=${productId}`)
      .then(async res => {
        if (!res.ok) return setGalleries([]);
        const data = await res.json();
        if (Array.isArray(data)) {
          setGalleries(data.filter(g => g.product && g.product._id === productId));
        } else {
          setGalleries([]);
        }
      })
      .finally(() => setLoadingGalleries(false));
  }, [productId]);

  // Open edit modal
  const openEditModal = (gallery) => {
    setEditGallery(gallery);
    setEditMainImage(gallery.mainImage);
    setEditSubImages(gallery.subImages || []);
    setEditModalOpen(true);
  };

  // Handle edit modal submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editGallery || !editGallery._id || !editMainImage) {
      toast.error("Missing required fields");
      return;
    }
    try {
      const res = await fetch('/api/productGallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId: editGallery._id,
          mainImage: editMainImage,
          subImages: editSubImages
        })
      });
      if (!res.ok) throw new Error('Failed to update gallery');
      toast.success('Gallery updated successfully');
      setEditModalOpen(false);
      setEditGallery(null);
      // Refresh galleries
      setLoadingGalleries(true);
      fetch(`/api/productGallery?productId=${productId}`)
        .then(async res => {
          if (!res.ok) return setGalleries([]);
          const data = await res.json();
          if (Array.isArray(data)) {
            setGalleries(data.filter(g => g.product && g.product._id === productId));
          } else {
            setGalleries([]);
          }
        })
        .finally(() => setLoadingGalleries(false));
    } catch (err) {
      toast.error('Failed to update gallery');
    }
  };

  const handleMainImageUploadClick = () => {
    imageInputRef.current.click();
  };

  const handleMainImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Image upload failed');
      const result = await res.json();
      setSelectedMainImage({ url: result.url, key: result.key });
      toast.success('Main image uploaded successfully');
    } catch (err) {
      toast.error('Main image upload failed');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSubImagesUploadClick = () => {
    if (subImagesInputRef.current) {
      subImagesInputRef.current.value = '';
      subImagesInputRef.current.click();
    }
  };

  const handleSubImagesUpload = async (event) => {
    console.log('DEBUG handleSubImagesUpload called');
    const files = Array.from(event.target.files);
    if (!files.length) return;
    // Check if adding these files would exceed 10 sub images
    if (selectedSubImages.length + files.length > 10) {
      toast.error('You can only add up to 10 sub images.');
      return;
    }
    setSubImagesUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Sub image upload failed');
        const result = await res.json();
        uploaded.push({ url: result.url, key: result.key });
      }
      setSelectedSubImages(prev => [...prev, ...uploaded]);
      toast.success('Sub image(s) uploaded successfully');
    } catch (err) {
      toast.error('Sub image upload failed');
    } finally {
      setSubImagesUploading(false);
      if (subImagesInputRef.current) subImagesInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error('No product selected');
      return;
    }
    // Prepare mainImage and subImages for Gallery model
    if (!selectedMainImage || !selectedMainImage.url) {
      toast.error('Please upload a main image');
      return;
    }
    const mainImage = selectedMainImage.url;
    const subImages = selectedSubImages.map(img => img.url);
    console.log('DEBUG selectedSubImages:', selectedSubImages);
    console.log('DEBUG mainImage:', mainImage);
    console.log('DEBUG subImages:', subImages);
    try {
      // Check if gallery exists for this product
      const resGallery = await fetch(`/api/productGallery?productId=${productId}`);
      let galleryData = null;
      if (resGallery.ok) {
        const galleries = await resGallery.json();
        galleryData = Array.isArray(galleries)
          ? galleries.find(g => g.product && g.product._id === productId)
          : null;
      }
      let apiRes;
      if (galleryData && galleryData._id) {
        // Update existing gallery
        apiRes = await fetch('/api/productGallery', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ galleryId: galleryData._id, mainImage, subImages })
        });
      } else {
        // Before creating new gallery, check if one already exists for this product
        const checkRes = await fetch(`/api/productGallery?productId=${productId}`);
        let exists = false;
        if (checkRes.ok) {
          const galleries = await checkRes.json();
          if (Array.isArray(galleries) && galleries.some(g => g.product && g.product._id === productId)) {
            exists = true;
          }
        }
        if (exists) {
          toast.error('Image data already exists for this product');
          return;
        }
        // Create new gallery
        const payload = { productId, mainImage, subImages };
        console.log('Sending to /api/productGallery:', payload);
        apiRes = await fetch('/api/productGallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (!apiRes.ok) throw new Error('Failed to save gallery');
      toast.success('Product gallery saved successfully');
    } catch (err) {
      toast.error('Failed to save gallery');
    }
  };

  return (
    <div className="flex justify-center items-center py-5 w-full">
      <div className="w-full max-w-2xl">
        <h4 className="font-bold mb-4 text-center">Product Image Gallery</h4>
        <Card className="p-4">
          <form onSubmit={handleSubmit}>
            {/* Product Name Display (like SizeManagement) */}
            <div className="mb-4 flex flex-col items-center justify-center">
              <label className="font-semibold mb-2">Product Name</label>
              <Input
                className="mb-4 w-80 font-black text-center border-gray-300"
                value={productgalley}
                disabled
                readOnly
                placeholder={productgalley ? "Product Name" : "Product Name not found"}
                style={productgalley ? {} : { border: '2px solid red', color: 'red' }}
              />
              {!productgalley && (
                <div style={{ color: 'red', marginTop: '4px', fontWeight: 'bold' }}>
                  Product name not found! Please check if the product was created successfully.
                </div>
              )}
            </div>
            {/* Main Photo */}
            <div className="mb-4">
              <label className="font-semibold">Product Main Photo</label>
              <div className="border rounded p-4 bg-gray-50">
                <div className="text-center">
                  {selectedMainImage && selectedMainImage.url ? (
                    <div className="relative mb-3 inline-block">
                      <img
                        src={selectedMainImage.url}
                        alt="Preview"
                        className="rounded object-contain mx-auto"
                        style={{ maxHeight: '100px', display: 'block' }}
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1"
                        onClick={() => {
                          setSelectedMainImage(null);
                          if (imageInputRef.current) {
                            imageInputRef.current.value = '';
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      className="upload-placeholder border border-dashed border-gray-400 rounded-lg p-6 bg-white cursor-pointer"
                      onClick={handleFileUpload}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl">📷</span>
                        <h5 className="mb-2">Browse Image</h5>
                        <p className="text-muted mb-0">From Drive</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="imageUpload"
                  className="hidden"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleMainImageUpload}
                />
                <div className="text-center mt-3">
                  <Button
                    type="button"
                    className="bg-gray-800 text-white px-4 py-2"
                    onClick={handleFileUpload}
                  >
                    {imageUploading ? 'Uploading...' : (selectedMainImage ? 'Change Image' : 'Choose Image')}
                  </Button>
                </div>
              </div>
            </div>
            {/* Sub Images */}
            <div className="mb-4">
              <label className="font-semibold">Product Sub Images</label>
              <div className="border rounded p-4 bg-gray-50">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSubImages.length > 0 ? (
                    selectedSubImages.map((img, idx) => (
                      <div key={img.key || idx} className="relative inline-block">
                        <img
                          src={img.url}
                          alt={`Sub ${idx + 1}`}
                          className="rounded object-contain"
                          style={{ maxHeight: '60px', maxWidth: '60px', display: 'block' }}
                        />
                        {/* Optionally add remove button for each sub image here */}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">No sub images selected.</span>
                  )}
                </div>
                <input
                  type="file"
                  id="subImagesUpload"
                  className="hidden"
                  accept="image/*"
                  multiple
                  ref={subImagesInputRef}
                  onChange={handleSubImagesUpload}
                />
                <div className="text-center mt-3">
                  <Button
                    type="button"
                    className="bg-gray-800 text-white px-4 py-2"
                    onClick={handleSubImagesUploadClick}
                  >
                    {subImagesUploading ? 'Uploading...' : (selectedSubImages.length > 0 ? 'Add More Images' : 'Choose Images')}
                  </Button>
                  <div className="text-xs text-gray-500 mt-1">Max 10 images. Selected: {selectedSubImages.length}</div>
                </div>
              </div>
              {/* Submit Button */}
              <div className="text-center">
                <Button type="submit" className="bg-red-500 px-5 font-semibold">
                  Save Data
                </Button>
              </div>
            </div>
          </form>
        </Card>
        {/* Gallery Table */}
        <div className="mt-8">
          <h5 className="font-semibold mb-2">Existing Galleries</h5>
          {loadingGalleries ? (
            <div>Loading galleries...</div>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Main Image</th>
                  <th className="border px-2 py-1">Sub Images</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleries.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-2">No galleries found.</td></tr>
                ) : (
                  galleries.map(gallery => (
                    <tr key={gallery._id}>
                      <td className="border px-2 py-1">{gallery._id}</td>
                      <td className="border px-2 py-1">
                        <img src={gallery.mainImage} alt="main" width={50} />
                      </td>
                      <td className="border px-2 py-1">
                        {gallery.subImages && gallery.subImages.length > 0 ? (
                          gallery.subImages.map(url => (
                            <img key={url} src={url} alt="sub" width={30} className="inline-block mr-1" />
                          ))
                        ) : (
                          <span>No sub images</span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        <Button type="button" onClick={() => openEditModal(gallery)} className="bg-blue-500 text-white px-2 py-1">Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Edit Modal (basic, not styled) */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
              <h4 className="font-bold mb-2">Edit Gallery</h4>
              <form onSubmit={handleEditSubmit}>
                <label className="block mb-1 font-semibold">Main Image URL</label>
                <Input
                  className="mb-2"
                  value={editMainImage}
                  onChange={e => setEditMainImage(e.target.value)}
                  required
                />
                <label className="block mb-1 font-semibold">Sub Images (comma separated URLs)</label>
                <Input
                  className="mb-2"
                  value={editSubImages.join(',')}
                  onChange={e => setEditSubImages(e.target.value.split(',').map(url => url.trim()).filter(Boolean))}
                />
                <div className="flex gap-2 mt-4">
                  <Button type="submit" className="bg-green-600 text-white">Save</Button>
                  <Button type="button" onClick={() => setEditModalOpen(false)} className="bg-gray-400 text-white">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
