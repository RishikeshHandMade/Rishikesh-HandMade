"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import { Extension } from '@tiptap/core'
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
} from 'lucide-react'

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
const VideoManagement = ({ productData, productId }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const productTitle = productData?.title || "";

  const [loading, setLoading] = useState(false);


  // Table and modal/dialog states
  const [videos, setVideos] = useState([]); // [{ url, description }]
  const [products, setProducts] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = React.useRef(null);


  const handleImageUpload = async (event) => {
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
      addImage(result.url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
      console.error(err);
    } finally {
      setImageUploading(false);
      if (file && imageInputRef.current) imageInputRef.current.value = '';
    }
  };
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Typography,
      TextAlign,
      Underline,
      Link,
      Color,
      ListItem,
      FontSize,
      Image,
    ],
    content: videoDescription,
    editorProps: {
      attributes: {
        class: 'min-h-[300px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00b67a]',
        spellcheck: 'true'
      }
    },
    autofocus: true,
    editable: true,
    injectCSS: true
  });

  // Function to get current editor content
  const getCurrentContent = () => {
    if (editor) {
      return editor.getHTML();
    }
    return videoDescription;
  };

  // Function to get current editor content
  const unescapeHtml = (html) => {
    if (!html || typeof html !== 'string') return '';

    // First, unescape all HTML entities
    const temp = document.createElement('div');
    temp.innerHTML = html.replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");

    // Get the HTML content after unescaping
    let processedHtml = temp.innerHTML;

    // Fix product links and ensure all links have proper protocol
    processedHtml = processedHtml
      // Fix product links
      .replace(/href="\/product\/([^"]+)"/g, 'href="$1"')
      // Ensure links have http:// if they don't have any protocol
      .replace(/href="(?!https?:\\\/\\\/|mailto:|tel:|#)([^"]+)"/g, 'href="https://$1"');

    return processedHtml;
  };

  const addImage = (url) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  };
  const setLink = React.useCallback(() => {
    if (!editor) return;
    let previousUrl = editor.getAttributes('link').href;

    // If the URL starts with /product/, remove it for editing
    if (previousUrl && previousUrl.startsWith('/product/')) {
      previousUrl = previousUrl.replace(/^\/product\//, '');
    }

    const url = window.prompt('Enter URL (without /product/ prefix):', previousUrl);
    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Don't modify the URL here, let the server or display component handle the prefix
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);
  // Update editor content when description state changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(videoDescription, false);
    }
  }, [videoDescription, editor]);

  const handleSubmit = async (e) => {
    // Helper for edit mode
    const content = getCurrentContent();
    const isSameVideo = (v, url) => typeof v === 'object' ? v.url === url : v === url;
    e.preventDefault();
    // console.log(productId);
    if (!videoUrl || !productId) {
      toast.error('Please provide a video URL and valid product.');
      return;
    }
    setLoading(true);
    try {
      let res, data;
      if (isEditMode && editTargetUrl) {
        // PATCH request to update video (name/url/description)
        const updatedVideos = videos.map(v =>
          isSameVideo(v, editTargetUrl)
            ? {
              name: videoName || 'Untitled Video',
              url: videoUrl,
              description: content || ''
            }
            : v
        );

        res = await fetch('/api/productVideo', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            videos: updatedVideos,
            updatedVideo: {
              oldUrl: editTargetUrl,
              newUrl: videoUrl,
              name: videoName || 'Untitled Video',
              description: content || ''
            }
          })
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
          setVideoDescription("");
          setVideoName("");
          if (editor) {
            editor.commands.clearContent();
          }
        }
      } else {    // POST request to add new video
        res = await fetch('/api/productVideo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            videoName: videoName || 'Untitled Video',
            videoUrl,
            videoDescription: content || ''
          })
        });
        data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to save video');
        } else {
          toast.success('Video saved successfully!');
          setVideos([...videos, {
            name: videoName || 'Untitled Video',
            url: videoUrl,
            description: content || ''
          }]);
          setVideoUrl("");
          setVideoDescription("");
          setVideoName("");
          setIsEditMode(false);
          setEditTargetUrl(null);
          if (editor) {
            editor.commands.clearContent();
          }
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
          setVideos(data.video.videos.map(v => typeof v === 'string' ? { url: v, description: '' } : v));
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
  const handleView = (videoObj) => {
    setSelectedVideo({ ...videoObj, productName: getProductName(productId) });
    setShowViewModal(true);
  };

  // Edit handler
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTargetUrl, setEditTargetUrl] = useState(null);

  const handleEdit = (videoObj) => {
    setVideoName(videoObj.name || '');
    setVideoUrl(videoObj.url);
    setVideoDescription(videoObj.description || '');
    setIsEditMode(true);
    setEditTargetUrl(videoObj.url);
  };


  // Delete handler
  const handleDelete = (videoObj) => {
    setDeleteTarget(videoObj.url);
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
        setVideos(videos.filter(v => v.url !== deleteTarget));
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
                    <label className="form-label">Product Video Name</label>
                    <div className="input-group">
                      <Input type="text" className="form-control" placeholder="Video Name" value={videoName} onChange={e => setVideoName(e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Product Video URL</label>
                    <div className="input-group">
                      <Input type="text" className="form-control" placeholder="Youtube URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Product Video Description</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'bg-gray-200' : ''}>
                          <UnderlineIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={setLink}
                          className={editor?.isActive('link') ? 'bg-gray-200' : ''}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                        <input
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById('image-upload').click()}
                          disabled={imageUploading}
                        >
                          {imageUploading ? 'Uploading...' : 'Image'}
                        </Button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setParagraph().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('paragraph') ? 'bg-gray-200' : ''}`}
                        >
                          <PilcrowSquare className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                        >
                          <Heading1 className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                        >
                          <Heading3 className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('blockquote') ? 'bg-gray-200' : ''}`}
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                        >
                          <Code className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleStrike().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('strike') ? 'bg-gray-200' : ''}`}
                        >
                          <Strikethrough className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().undo().run()}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().redo().run()}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Redo className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'left') ? 'bg-gray-200' : ''}`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'center') ? 'bg-gray-200' : ''}`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('textAlign', 'right') ? 'bg-gray-200' : ''}`}
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                  <div className="text-center">
                    <Button type="submit" className="bg-red-500 px-5" disabled={loading}>{loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Data Save')}</Button>
                    {isEditMode && (
                      <Button type="button" variant="secondary" className="ml-2" onClick={() => { setIsEditMode(false); setEditTargetUrl(null); setVideoUrl(""); setVideoDescription(""); }}>Cancel Edit</Button>
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
                        videos.map((video, idx) => (
                          <TableRow key={video.url}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{video.name}</TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-blue-600 underline cursor-pointer">Link</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div>{video.url}</div>
                                    {/* <div className="text-xs text-gray-500 mt-1">{video.description}</div> */}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {/* <div className="text-xs text-gray-500 mt-1">{video.description}</div> */}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="outline" size="sm" onClick={() => handleView(video)} title="View">View</Button>{' '}
                              <Button variant="outline" size="sm" onClick={() => handleEdit(video)} title="Edit">Edit</Button>{' '}
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(video)} title="Delete">Delete</Button>
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
            <div className="text-gray-600">{selectedVideo?.name}</div>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
            <div className="font-semibold text-gray-800">YouTube URL</div>
            <a href={selectedVideo?.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedVideo?.url}</a>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
            <div className="font-semibold text-gray-800">Description</div>
            <div dangerouslySetInnerHTML={{ __html: unescapeHtml(selectedVideo?.description) }} />
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
