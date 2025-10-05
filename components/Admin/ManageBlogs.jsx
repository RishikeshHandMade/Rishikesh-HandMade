"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import { Extension } from '@tiptap/core';
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  PilcrowSquare,
  Unlink,
} from 'lucide-react';

// Create a FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ commands }) => {
        return commands.setFontStyle({ fontSize })
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.setFontStyle({ fontSize: undefined })
      },
    }
  },
})
const TiptapEditor = ({ value, onChange }) => {

  const fileInputRef = useRef(null);  // Local ref for file input
  const [isImageUploading, setIsImageUploading] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily,
      Typography,
      Link,
      Color,
      ListItem,
      FontSize,
      Image,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-0',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== '<p></p>') {  // Only update if not empty
        onChange(html);
      }
    },
  });

  const addImage = (url) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  };
  // Update editor content when value changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Function to set a link
  const setLink = (e) => {
    if (e) e.preventDefault();
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url })
      .run();
  };
  const handleImageUploadClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Image upload failed');

      const result = await res.json();
      editor.chain().focus().setImage({ src: result.url }).run();
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setIsImageUploading(false);
      // Reset the input value to allow re-uploading the same file
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50" onClick={(e) => e.preventDefault()}>
        {/* Text Formatting */}
        <div className="flex border-r pr-1 mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleStrike().run();
            }}
            className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleCode().run();
            }}
            className={`p-2 rounded ${editor.isActive('code') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex border-r pr-1 mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setParagraph().run();
            }}
            className={`p-2 rounded ${editor.isActive('paragraph') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Paragraph"
          >
            <PilcrowSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex border-r pr-1 mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('left').run();
            }}
            className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('center').run();
            }}
            className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('right').run();
            }}
            className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex border-r pr-1 mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }}
            className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Links and more */}
        <div className="flex">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setLink();
            }}
            className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().unsetLink().run();
            }}
            disabled={!editor.isActive('link')}
            className={`p-2 rounded ${!editor.isActive('link') ? 'opacity-50' : 'hover:bg-gray-100'}`}
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </button>
          <div className="relative inline-block">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <button
              type="button"
              onClick={handleImageUploadClick}
              disabled={isImageUploading}
              className={`p-2 rounded hover:bg-gray-100 ${isImageUploading ? 'opacity-50' : ''}`}
              title="Insert Image"
            >
              {isImageUploading ? 'Uploading...' : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-[200px] px-2" />
    </div >
  );
};
const Blogs = () => {

  // All the state and logic from your provided code, adapted for Next.js and UI kit usage
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();

  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [fetchedShortDescription, setFetchedShortDescription] = useState('');
  const [fetchedLongDescription, setFetchedLongDescription] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [showBlogsModal, setShowBlogsModal] = useState(false);
  const [selectedArtisanBlogs, setSelectedArtisanBlogs] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState(false)

  // const [editorimageUploading, seteditorImageUploading] = useState(false);
  // const imageInputRef = useRef(null);


  // const handleEditorImageUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
  //   seteditorImageUploading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     const res = await fetch('/api/cloudinary', {
  //       method: 'POST',
  //       body: formData
  //     });
  //     if (!res.ok) throw new Error('Image upload failed');
  //     const result = await res.json();
  //     addImage(result.url);
  //     toast.success('Image uploaded successfully');
  //   } catch (err) {
  //     toast.error('Image upload failed');
  //     console.error(err);
  //   } finally {
  //     seteditorImageUploading(false);
  //     if (file && imageInputRef.current) imageInputRef.current.value = '';
  //   }
  // };

  // Fetch all blogs from /api/blogs
  const fetchBlogs = async () => {
    try {
      setLoadingReviews(true);
      const res = await fetch('/api/blogs');
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

  // Handler for file input change
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (selectedImages.length + files.length > 10) {
      toast.error('You can only upload up to 10 images.');
      return;
    }
    setImageUploading(true);
    setUploadProgress(0);
    try {
      let newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        // Progress not natively supported by fetch; for demo, just set 100% after upload
        const res = await fetch('/api/cloudinary', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Image upload failed');
        const result = await res.json();
        newImages.push({ url: result.url, key: result.key });
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 10));
      toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded!`);
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (selectedImages.length >= 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async (index) => {
    const img = selectedImages[index];
    let deletedFromCloudinary = false;
    // Show loading toast before any UI update
    if (img.key) {
      toast.loading('Deleting image from Cloudinary...', { id: 'cloud-delete-blog' });
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: img.key })
        });
        const data = await res.json();
        if (res.ok) {
          deletedFromCloudinary = true;
          toast.success('Image deleted from Cloudinary!', { id: 'cloud-delete-blog' });
        } else {
          toast.error('Cloudinary error: ' + (data.error || 'Failed to delete image from Cloudinary'), { id: 'cloud-delete-blog' });
        }
      } catch (err) {
        toast.error('Failed to delete image from Cloudinary (network or server error)', { id: 'cloud-delete-blog' });
      }
    } else {
      toast.error('No valid Cloudinary key found for this image. It may be a legacy or local-only image.', { id: 'cloud-delete-blog' });
    }
    // Remove from UI only after toast and Cloudinary attempt
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  // Fetch artisans and reviews
  // On mount, fetch all blogs from /api/blogs
  useEffect(() => {
    fetchBlogs();
  }, []);



  const handleEdit = (blog) => {
    setEditMode(true);
    setEditingBlogId(blog._id);
    setTitle(blog.title || '');
    setYoutubeUrl(blog.youtubeUrl || '');
    // Set both the current and fetched descriptions to ensure editor gets the value
    const shortDesc = blog.shortDescription || '';
    const longDesc = blog.longDescription || '';
    setShortDescription(shortDesc);
    setFetchedShortDescription(shortDesc);
    setLongDescription(longDesc);
    setFetchedLongDescription(longDesc);
    setSelectedImages(
      (Array.isArray(blog.images) ? blog.images : []).map((img, idx) => {
        // Support both {url, key} objects and plain url strings
        if (typeof img === 'string') {
          return { url: img, key: `img-string-${idx}`, file: null };
        } else if (typeof img === 'object' && img !== null) {
          return {
            url: img.url || '',
            key: img.key || `img-obj-${idx}`,
            file: null
          };
        }
        return { url: '', key: `img-unknown-${idx}`, file: null };
      })
    );
  };

  // Delete a blog using /api/blogs
  const handleDelete = async () => {
    if (!deleteBlogId) return;
    try {
      const res = await fetch('/api/blogs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteBlogId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Blog deleted successfully!');
        fetchBlogs();
      } else {
        toast.error(data?.message || data?.error || 'Failed to delete blog');
      }
    } catch (err) {
      toast.error('Error deleting blog');
    } finally {
      setShowDeleteModal(false);
      setDeleteBlogId(null);
    }
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
      // Trim and validate required fields
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        toast.error('Please enter a title for the blog');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: trimmedTitle,
        youtubeUrl: youtubeUrl.trim(),
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim(),
        images: selectedImages.map(img => ({ url: img.url, key: img.key })),
      };
      let res, data;
      if (editMode && editingBlogId) {
        res = await fetch('/api/blogs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBlogId, ...payload })
        });
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      data = await res.json();
      if (res.ok) {
        toast.success(editMode ? 'Blog updated successfully!' : 'Blog created successfully!');
        fetchBlogs();
        // Reset form after successful submission
        setTitle('');
        setYoutubeUrl('');
        setShortDescription('');
        setFetchedShortDescription('');
        setLongDescription('');
        setFetchedLongDescription('');
        setSelectedImages([]);
        setEditMode(false);
        setEditingBlogId(null);
      } else {
        throw new Error(data?.message || data?.error || 'Failed to save blog');
      }
    } catch (err) {
      toast.error('Error saving blog');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingBlogId(null);
    setTitle('');
    setYoutubeUrl('');
    setShortDescription('');
    setFetchedShortDescription('');
    setLongDescription('');
    setFetchedLongDescription('');
    setSelectedImages([]);
    // Reset any other related states if needed
  };

  const [mediaTab, setMediaTab] = useState('image'); // 'image' or 'youtube'

  const handleTabChange = (tab) => {
    setMediaTab(tab);
    if (tab === 'image') {
      setYoutubeUrl('');
    } else {
      setSelectedImages([]);
    }
  };


  return (

    <div className="page-content">
      {/* <TiptapEditor
        value={longDescription}
        onChange={setLongDescription}
        onImageUpload={handleEditorImageUpload}
        imageInputRef={imageInputRef}
        isUploading={editorimageUploading}
      /> */}
      <div className="container-fluid">
        <div className="row justify-center">
          <div className="w-full max-w-5xl mx-auto">
            <h3 className="my-4 text-center font-bold text-2xl">Create Blog Video / Image</h3>
            <div className="bg-white rounded shadow p-6 mb-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Title Of Blog Video</label>
                    <input
                      type="text"
                      placeholder="Enter Your Artisan Title:"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                </div>
                {/* Media Tab Section */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-t ${mediaTab === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => handleTabChange('image')}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-t ${mediaTab === 'youtube' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => handleTabChange('youtube')}
                    >
                      YouTube URL
                    </button>
                  </div>
                  {mediaTab === 'youtube' ? (
                    <div>
                      <label className="block font-semibold mb-1">YouTube URL</label>
                      <input
                        type="text"
                        placeholder="YouTube URL:"
                        value={youtubeUrl}
                        onChange={e => setYoutubeUrl(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  ) : (
                    <div>
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
                                    onClick={() => handleRemoveImage(index)}
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
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          ref={fileInputRef}
                          onChange={handleImageChange}
                        />
                        <Button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                          onClick={handleBrowseClick}
                          disabled={imageUploading || selectedImages.length >= 10}
                        >
                          {imageUploading ? 'Uploading...' : 'Browse Image(s)'}
                        </Button>
                        {imageUploading && (
                          <div className="w-full mt-2">
                            <div className="bg-gray-200 rounded h-2 overflow-hidden">
                              <div
                                className="bg-blue-500 h-2 rounded"
                                style={{ width: `${uploadProgress}%`, transition: 'width 0.3s' }}
                              />
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                    <TiptapEditor
                      value={shortDescription}
                      onChange={setShortDescription}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
                    <TiptapEditor
                      value={longDescription}
                      onChange={setLongDescription}
                    />
                  </div>
                </div>
                <div className="text-center py-4">
                  <Button type="submit" className="bg-blue-600 text-white text-lg px-10 py-2 rounded" disabled={isSubmitting}>
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
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="px-4 py-3 text-center">S.No</TableHead>
                        <TableHead className="px-4 py-3 text-center">Image</TableHead>
                        <TableHead className="px-4 py-3 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">No blogs found.</TableCell>
                        </TableRow>
                      ) : (
                        blogs.map((blog, idx) => (
                          <TableRow key={blog._id}>
                            <TableCell className="px-4 py-3 text-center font-medium">{idx + 1}</TableCell>
                            <TableCell className="px-4 py-3 text-center ">
                              {Array.isArray(blog.images) && blog.images.length > 0 ? (() => {
                                let imgObj = blog.images[0];
                                let url = typeof imgObj === 'object' && imgObj !== null ? imgObj.url : imgObj;
                                if (typeof url === 'string' && url.trim() && url !== 'undefined') {
                                  return (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border flex items-center justify-center bg-white mx-auto">
                                      <img
                                        src={url}
                                        alt="Blog Preview"
                                        className="w-full h-full object-cover mx-auto"
                                        onError={e => { e.target.style.display = 'none'; }}
                                      />
                                    </div>
                                  );
                                } else {
                                  return <span className="text-gray-400">No image</span>;
                                }
                              })() : (
                                <span className="text-gray-400">No image</span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-500 text-white px-3 py-1 rounded"
                                  onClick={() => {
                                    setSelectedArtisanBlogs([blog]);
                                    // setSelectedArtisanInfo(blog.artisan);
                                    setShowBlogsModal(true);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                                  onClick={() => handleEdit(blog)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-500 text-white px-3 py-1 rounded"
                                  onClick={() => openDeleteModal(blog._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {/* Delete Modal */}
              {showDeleteModal && (
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Blog</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this blog?</p>
                    <DialogFooter>
                      <Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* View Modal */}
              {showBlogsModal && selectedArtisanBlogs.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded shadow-lg max-w-lg w-full p-8 relative">
                    <h4 className="font-bold text-lg mb-4">Blog Details</h4>
                    <div className="grid grid-cols-1 gap-4 mb-2">
                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
                        <div className="font-semibold text-gray-800">Blog Title</div>
                        <div className="text-gray-600">{selectedArtisanBlogs[0].title}</div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 ">
                        <div className="font-semibold text-gray-800">YouTube URL</div>
                        <div className="text-gray-600 break-all">
                          {selectedArtisanBlogs[0].youtubeUrl ? (
                            <a
                              href={selectedArtisanBlogs[0].youtubeUrl.startsWith('http') ? selectedArtisanBlogs[0].youtubeUrl : `https://${selectedArtisanBlogs[0].youtubeUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {selectedArtisanBlogs[0].youtubeUrl}
                            </a>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-3 max-h-60 overflow-y-auto rounded border border-gray-200 shadow-md mb-2">
                        <div className="font-semibold text-gray-800 mb-2">Short Description</div>
                        <div
                          className="text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: selectedArtisanBlogs[0].shortDescription || '<span class="text-gray-400">-</span>'
                          }}
                        />
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 max-h-60 overflow-y-auto">
                        <div className="font-semibold text-gray-800 mb-2">Long Description</div>
                        <div
                          className="text-gray-600 prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: selectedArtisanBlogs[0].longDescription || '<span class="text-gray-400">-</span>'
                          }}
                        />
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 max-h-32 overflow-y-auto">
                        <div className="font-semibold text-gray-800">Images</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(selectedArtisanBlogs[0].images) && selectedArtisanBlogs[0].images.length > 0 ? (
                            selectedArtisanBlogs[0].images.map((img, idx) => {
                              let url = typeof img === 'object' && img !== null ? img.url : img;
                              const key = (typeof img === 'object' && img !== null && img.key) ? img.key : (url ? url : idx);
                              // Only render if url is valid
                              if (typeof url !== 'string' || !url.trim() || url === 'undefined') {
                                return null;
                              }
                              return (
                                <img
                                  key={key}
                                  src={url}
                                  alt={`Blog Image ${idx + 1}`}
                                  className="w-28 h-20 object-cover rounded"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              );
                            })
                          ) : (
                            <span className="text-gray-400">No images</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="absolute w-8 h-8 top-2 right-2 text-gray-700 hover:text-red-600" onClick={() => setShowBlogsModal(false)}>
                      X
                    </button>
                    <button className="absolute px-4 py-1 bottom-2 right-2 border border-gray-200 rounded bg-red-500 text-white" onClick={() => setShowBlogsModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
