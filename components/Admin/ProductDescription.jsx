"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
const ProductDescription = ({ productData, productId }) => {
  const [overview, setOverview] = useState("");
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
    editorProps: {
      attributes: {
        class: 'min-h-[200px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00b67a]',
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
    return overview;
  };

  // Save handler for form submission
  const saveDescription = async () => {
    const content = getCurrentContent();
    if (!productId || !content) {
      toast.error('Please provide an overview and valid product.');
      return;
    }
    setLoading(true);
    try {
      if (editMode && editId) {
        // PATCH request for update
        const res = await fetch('/api/productDescription', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: editId, overview: content })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to update product info');
        } else {
          toast.success('Product info updated successfully!');
          setOverview("");
          setEditMode(false);
          setEditId(null);
          fetchProductDescription();
        }
      } else {
        // POST request for create
        const res = await fetch('/api/productDescription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, overview: content })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error || 'Failed to save product info');
        } else {
          toast.success('Product info saved successfully!');
          setOverview("");
          fetchProductDescription();
        }
      }
    } catch (err) {
      toast.error('Error saving product info.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveDescription();
  };

  // Initialize editor content when component mounts or product changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (overview !== editor.getHTML()) {
        editor.commands.setContent(overview || '', false);
      }
    }
    
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);
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

  const [allDescriptions, setAllDescriptions] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewedDesc, setViewedDesc] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const productTitle = productData?.title || "";

  const [loading, setLoading] = useState(false);

  // Fetch only the current product's description
  const fetchProductDescription = async () => {
    if (!productId) return setAllDescriptions([]);
    setTableLoading(true);
    try {
      const res = await fetch(`/api/productDescription?product=${productId}`);
      const data = await res.json();
      if (res.ok && data.description) {
        setAllDescriptions(data.description ? [data.description] : []);
      } else {
        setAllDescriptions([]);
      }
    } catch (err) {
      setAllDescriptions([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDescription();
  }, [productId]);
  // View handler
  const handleView = (desc) => {
    setViewedDesc(desc);
    setViewModal(true);
  };

  // Edit mode handler
  const handleEdit = (desc) => {
    setEditMode(true);
    setEditId(desc.product?._id || desc.product);
    setOverview(desc.overview);
  };

  // Delete handlers
  const openDeleteModal = (desc) => {
    setDeleteTargetId(desc.product?._id || desc.product);
    setShowDeleteModal(true);
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/productDescription', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: deleteTargetId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Description deleted!');
        fetchProductDescription();
        if (editId === deleteTargetId) {
          setEditMode(false);
          setEditId(null);
          setOverview("");
        }
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error deleting description.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(overview, false);
    }
  }, [overview, editor]);

  return (
    <div>
      <form className="page-content" onSubmit={handleSubmit}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-12 col-lg-12">
              <h3 className="my-4 text-center">Product Description</h3>
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
                    <label className="form-label">Product Over View Description</label>
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
                        <button type="button"
                          onClick={() => editor?.chain().focus().toggleUnderline().run()}
                          className={`p-2 rounded-lg hover:bg-gray-100 ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}
                        >
                          <UnderlineIcon className="w-4 h-4" />
                        </button>
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
                    <Button type="submit" className="bg-red-500 px-5" disabled={loading}>
                      {editMode ? (loading ? 'Updating...' : 'Update') : (loading ? 'Saving...' : 'Data Save')}
                    </Button>
                    {editMode && (
                      <Button type="button" className="ml-3 bg-gray-400 px-5" onClick={() => { setEditMode(false); setEditId(null); setOverview(""); }} disabled={loading}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Table of all product descriptions */}
      <div className="mt-6">
        <h5 className="mb-3 font-semibold">All Product Descriptions</h5>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-center">S.No</th>
              <th className="px-4 py-3 text-center">Product Name</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableLoading ? (
              <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
            ) : allDescriptions.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4">No descriptions found.</td></tr>
            ) : (
              allDescriptions.map((desc, idx) => (
                <tr key={desc._id}>
                  <td className="px-4 py-3 text-center">{idx + 1}</td>
                  <td className="px-4 py-3 text-center">{desc.product?.title || '-'}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <Button size="sm" variant="default" className="bg-blue-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleView(desc)}>
                      View
                    </Button>
                    <Button size="sm" variant="default" className="bg-yellow-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleEdit(desc)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => openDeleteModal(desc)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewModal && viewedDesc && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 min-w-[300px] max-w-[50vw]">
            <h4 className="font-bold mb-2">Product Description Details</h4>
            <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2">
              <div className="font-semibold text-gray-800">Product Name</div>
              <div className="text-gray-600">{viewedDesc.product?.title || '-'}</div>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200 shadow-md mb-2 h-32 overflow-y-auto">
              <div className="font-semibold text-gray-800">Description</div>
              <div className='ProseMirror text-gray-700' dangerouslySetInnerHTML={{ __html: viewedDesc.overview }} />
              {/* <div className="text-gray-600" >{viewedDesc.overview || 'N/A'}</div> */}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setViewModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
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
};

export default ProductDescription;