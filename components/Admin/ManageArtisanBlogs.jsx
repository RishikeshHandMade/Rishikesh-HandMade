"use client";
import React, { useRef, useState, useEffect } from 'react';
// import uploadimg from './upload-img.png';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { UploadButton } from '../../utils/uploadthing';

// Placeholder for TiptapEditor. Replace with your actual implementation or import.
const TiptapEditor = ({ value, onChange }) => (
  <textarea className="w-full border rounded p-2" value={value} onChange={e => onChange(e.target.value)} placeholder="Rich text editor coming soon..." />
);

const ManageArtisanBlogs = ({ artisanId, artisanDetails = null }) => {
  // All the state and logic from your provided code, adapted for Next.js and UI kit usage
  const imageInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState(artisanId || '');
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [showBlogsModal, setShowBlogsModal] = useState(false);
  const [selectedArtisanBlogs, setSelectedArtisanBlogs] = useState([]);
  const [selectedArtisanInfo, setSelectedArtisanInfo] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Placeholder fetchers (replace with your API calls)
  const fetchArtisans = async ({ artisanId, artisanDetails = null } = {}) => {
    // Fetch artisans from API
    setArtisans([]);
  };
  const fetchBlogs = async () => {
    try {
      setLoadingReviews(true);
      const res = await fetch('/api/artisanBlog');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (err) {
      toast.error('Failed to fetch blogs');
      setBlogs([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleFileUpload = () => {
    imageInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 10 - selectedImages.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}. Maximum limit is 10 images.`);
      return;
    }
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }));
    setSelectedImages(prevImages => [...prevImages, ...newImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(prevImages => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevImages[index].url);
      return updatedImages;
    });
  };
  // Fetch artisans and reviews
  useEffect(() => {
    async function fetchArtisansAndPromotions() {
      try {
        // Fetch artisans
        const res = await fetch('/api/createArtisan');
        const data = await res.json();
        setArtisans(data);
        // If artisanId is present, set selectedArtisan and prefill
        if (artisanId) {
          const found = data.find(a => a._id === artisanId);
          if (found) {
            setSelectedArtisan(found._id);
            setCreatedBy(`${found.firstName} ${found.lastName}`);
            setTitle(found.title || '');
          }
        }
      } catch (err) {
        toast.error('Failed to fetch artisans');
      }
      // Fetch reviews/promotions
      try {
        setLoadingReviews(true);
        const promoUrl = artisanId ? `/api/promotion?artisanId=${artisanId}` : '/api/promotion';
        const res = await fetch(promoUrl);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        toast.error('Failed to fetch promotions');
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchArtisansAndPromotions();
  }, [artisanId]);

  useEffect(() => {
    fetchBlogs();
    // Optionally, fetchArtisans();
    return () => {
      selectedImages.forEach(image => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [selectedImages]);

  const handleEdit = (blog) => {
    setEditMode(true);
    setEditingBlogId(blog._id);
    setTitle(blog.title || '');
    setYoutubeUrl(blog.youtubeUrl || '');
    setShortDescription(blog.shortDescription || '');
    setLongDescription(blog.longDescription || '');
    setSelectedArtisan(blog.artisan?._id || blog.artisan || '');
    setSelectedImages((Array.isArray(blog.images) ? blog.images : []).map(img => ({ url: img, file: null })));
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    setDeleteBlogId(null);
    toast.success('Blog deleted successfully!');
    fetchBlogs();
  };

  const openDeleteModal = (id) => {
    setDeleteBlogId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteBlogId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        youtubeUrl,
        shortDescription,
        longDescription,
        artisan: selectedArtisan,
        images: selectedImages.map(img => ({ url: img.url, key: img.key })),
      };
      let res, data;
      if (editMode && editingBlogId) {
        res = await fetch('/api/artisanBlog', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBlogId, ...payload }),
        });
      } else {
        res = await fetch('/api/artisanBlog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      data = await res.json();
      if (res.ok) {
        toast.success(editMode ? 'Blog updated successfully!' : 'Blog created successfully!');
        fetchBlogs();
        handleCancelEdit();
      } else {
        toast.error(data?.message || 'Failed to save blog');
      }
    } catch (err) {
      toast.error('Error saving blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
    fetchBlogs();
  }, []);

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingBlogId(null);
    setTitle('');
    setYoutubeUrl('');
    setShortDescription('');
    setLongDescription('');
    setSelectedArtisan('');
    setSelectedImages([]);
  };

  // GROUP BLOGS BY ARTISAN
  const groupedBlogs = blogs.reduce((acc, blog) => {
    const artisanId = blog.artisan?._id;
    if (!artisanId) return acc;
    if (!acc[artisanId]) {
      acc[artisanId] = { artisan: blog.artisan, blogs: [] };
    }
    acc[artisanId].blogs.push(blog);
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row justify-center">
          <div className="w-full max-w-5xl mx-auto">
            <h3 className="my-4 text-center font-bold text-2xl">Create Promotions Video / Image</h3>
            <div className="bg-white rounded shadow p-6 mb-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Title Of Artisan Video</label>
                    <input
                      type="text"
                      placeholder="Enter Your Artisan Title:"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="w-64">
                    <label className="block font-semibold mb-1">Select Artisan</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 bg-gray-100"
                      value={(() => {
                        const found = artisans.find(a => a._id === selectedArtisan);
                        return found ? `${found.title ? found.title + ' ' : ''}${found.firstName} ${found.lastName}` : '';
                      })()}
                      readOnly
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Youtube URL</label>
                  <input
                    type="text"
                    placeholder="You Tube URL:"
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Artisan Images</label>
                  <div className="border rounded p-4 mt-2">
                    <div className="text-center mb-3">
                      {selectedImages.length === 0 ? (
                        <div className="text-gray-400">No images uploaded yet.</div>
                      ) : (
                        <div className="flex flex-wrap gap-3 justify-center">
                          {selectedImages.map((image, index) => (
                            <div key={image.key || image.url || index} className="relative w-40 h-36">
                              <img
                                src={image.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded"
                              />
                              <button
                                type="button"
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div className="mt-2">
                        <small className={selectedImages.length === 10 ? 'text-red-600' : 'text-gray-500'}>
                          {selectedImages.length}/10 images selected
                        </small>
                      </div>
                    </div>
                    {/* Single Upload Button (UploadThing) */}
                    <UploadButton
                      endpoint="imageUploader"
                      multiple
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                          setSelectedImages(prev => [
                            ...prev,
                            ...res.map(img => ({ url: img.url, key: img.key, file: null }))
                          ]);
                          toast.success('Image uploaded successfully!');
                        }
                      }}
                      onUploadError={() => toast.error('Image upload failed!')}
                      className="ut-button:bg-blue-600 after:ut-button:ut-uploading:bg-blue-300 !mt-4"
                    >
                      Upload Images
                    </UploadButton>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Long Description</label>
                  <TiptapEditor value={longDescription} onChange={setLongDescription} />
                </div>
                <div className="text-center">
                  <Button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : (editMode ? 'Update' : 'Save')}
                  </Button>
                  {editMode && (
                    <Button type="button" className="bg-gray-400 text-white px-5 py-2 rounded ml-2" onClick={handleCancelEdit} disabled={isSubmitting}>Cancel</Button>
                  )}
                </div>
              </form>
              {/* Blog Management Table */}
              <div className="bg-white rounded shadow p-6">
                <h4 className="mb-3 font-semibold text-lg">Manage Blogs</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-200 rounded">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-3 border-b">S.no</th>
                        <th className="py-2 px-3 border-b">Images</th>
                        <th className="py-2 px-3 border-b">View</th>
                        <th className="py-2 px-3 border-b">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.length === 0 || Object.keys(groupedBlogs).length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-4">No blogs found.</td></tr>
                      ) : (
                        Object.values(groupedBlogs).map((group, idx) => (
                          <tr key={group.artisan._id}>
                            <td className="py-2 px-3 border-b">{idx + 1}</td>
                            <td className="py-2 px-3 border-b">
                              {/* Show artisan name using original logic */}
                              {group.artisan.title ? `${group.artisan.title} ${group.artisan.firstName} ${group.artisan.lastName}` : `${group.artisan.firstName} ${group.artisan.lastName}`}
                            </td>
                            <td className="py-2 px-3 border-b">
                              <Button
                                size="sm"
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                                onClick={() => {
                                  setSelectedArtisanBlogs(group.blogs);
                                  setSelectedArtisanInfo(group.artisan);
                                  setShowBlogsModal(true);
                                }}
                              >
                                View Blogs
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Blogs Modal: List all blogs for selected artisan */}
              {/* ...Modals can be added here as needed, see your original code for details... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageArtisanBlogs;
