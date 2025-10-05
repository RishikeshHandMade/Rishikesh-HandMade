"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import toast from "react-hot-toast";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Image as TiptapImage } from '@tiptap/extension-image';
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
const News = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState(null);
    const [banners, setBanners] = useState([]);
    const [editBanner, setEditBanner] = useState(null);
    const [description, setDescription] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        description: "",
        image: { url: "", key: "" },
        order: 1,
    });
    const [imageUploading, setImageUploading] = useState(false);
    const imageInputRef = useRef(null);


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
            Bold,
            Italic,
            Underline,
            Link,
            Color,
            ListItem,
            FontSize,
            TiptapImage,
        ],
        content: description,
        editorProps: {
            attributes: {
                class: 'min-h-[300px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00b67a]'
            }
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Update the form data when editor content changes
            setFormData(prev => ({
                ...prev,
                description: html
            }));
        }
    });

    // Fetch banners and determine the next order number
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch("/api/addNews");
                const data = await response.json();
                setBanners(data);

                // Auto-set next order number
                if (data.length > 0) {
                    const highestOrder = Math.max(...data.map((b) => b.order));
                    setFormData((prev) => ({ ...prev, order: highestOrder + 1 }));
                }
            } catch (error) {
                toast.error("Failed to fetch banners");
            }
        };
        fetchBanners();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Cloudinary-style image upload (like AddGallery.jsx)
    const [uploading, setUploading] = useState(false);
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        try {
            const res = await fetch('/api/cloudinary', {
                method: 'POST',
                body: formDataUpload
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setFormData(prev => ({ ...prev, image: { url: data.url, key: data.key || '' } }));
                toast.success('Image uploaded!');
            } else {
                toast.error('Cloudinary upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            toast.error('Cloudinary upload error: ' + err.message);
        }
        setUploading(false);
    };
    const addImage = (url) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: url }).run();
    };
    const setLink = useCallback(() => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image.url || !formData.image.key) return toast.error("Please upload an image");
        try {
            const method = editBanner ? "PATCH" : "POST";
            const response = await fetch("/api/addNews", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, id: editBanner }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Banner ${editBanner ? "updated" : "added"} successfully`);
                setEditBanner(null);

                // Refresh banner list
                const updatedBanners = await fetch("/api/addNews").then((res) => res.json());
                setBanners(updatedBanners);

                // Reset form
                setFormData({
                    title: "",
                    date: "",
                    description: editor.getHTML()||"",
                    order: updatedBanners.length + 1,
                    image: { url: "", key: "" },
                });
                // Clear the editor
                if (editor) {
                    editor.commands.clearContent();
                }

            } else {
                toast.error(data.error);
            }
        }  catch (error) {
            console.error('Submission error:', error);
            toast.error(error.message || "Something went wrong");
        }
    };

    const handleEdit = (banner) => {
        setEditBanner(banner._id);
        // console.log(banner)
        setFormData({
            title: banner.title,
            date: banner.date,
            description: banner.description,
            order: banner.order,
            image: banner.image,
        });
        if (editor) {
            editor.commands.setContent(banner.description || '');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch("/api/addNews", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Banner deleted successfully");

                setBanners((prev) => prev.filter((banner) => banner._id !== id));

                // Update order numbers
                const updatedBanners = await fetch("/api/addNews").then((res) => res.json());
                setBanners(updatedBanners);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const confirmDelete = async () => {
        if (bannerToDelete) {
            await handleDelete(bannerToDelete);
            setBannerToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBannerToDelete(null);
    };

    // Remove image from formData only
    const handleDeleteImage = () => {
        setFormData(prev => ({ ...prev, image: { url: '', key: '' } }));
    };


    // Ref for file input
    const fileInputRef = useRef(null);

    return (
        <div className="max-w-5xl mx-auto py-10 w-full">
            <h2 className="text-2xl font-bold mb-6">{editBanner ? "Edit News" : "Add New News"}</h2>
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                {/* Banner Image Upload */}
                <div className="mb-4">
                    <Label className="block mb-2 font-bold">News Image</Label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="banner-image-input"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="mb-2 flex items-center gap-2 bg-blue-500 text-white"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                        <span>Select News Image</span>
                        <UploadIcon className="w-4 h-4" />
                    </Button>
                    {uploading && <div className="text-blue-600 font-semibold">Uploading...</div>}
                    {formData.image.url && (
                        <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
                            <Image
                                src={formData.image.url}
                                alt="News Image Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-200"
                                title="Remove image"
                            >
                                <Trash2Icon className="w-5 h-5 text-red-600" />
                            </button>
                        </div>
                    )}
                </div>
                <div>
                    <Label>Title</Label>
                    <Input name="title" placeholder="Enter title" value={formData.title} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>Date </Label>
                    <Input name="date" type="date" placeholder="Enter Date" value={formData.date} onChange={handleInputChange} />
                </div>
                <div className="mb-4">
                    <label className="form-label">Description</label>
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
                <div>
                    <Label>Order</Label>
                    <Input name="order" placeholder="Enter order" type="number" value={formData.order} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>

                <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                        {editBanner ? "Update News" : "Add News"}
                    </Button>
                    {editBanner && (
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-gray-300 hover:bg-gray-200 text-black"
                            onClick={() => {
                                setEditBanner(null);
                                setFormData({
                                    title: "",
                                    date: "",
                                    description: "",
                                    order: banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1,
                                    image: { url: "", key: "" },
                                });
                                if (editor) {
                                    editor.commands.clearContent();
                                }
                            }}
                        >
                            Cancel Edit
                        </Button>
                    )}
                </div>
            </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">Existing News</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        {/* <TableHead>Description</TableHead> */}
                        <TableHead>Image</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {banners.length > 0 ? (
                        banners.map((banner) => (
                            <TableRow key={banner._id}>
                                <TableCell>{banner.order}</TableCell>
                                <TableCell>{banner.title}</TableCell>
                                <TableCell>{banner.date}</TableCell>
                                {/* <TableCell style={{ wordBreak: "break-all", maxWidth: 200 }}>
                                    {(() => {
                                        const desc = banner.description ?? "";
                                        const words = desc.trim().split(/\s+/);
                                        if (words.length === 1 && desc.length > 30) {
                                            // Single long word, truncate by chars
                                            return desc.slice(0, 30) + " ...";
                                        }
                                        // Normal: show up to 10 words
                                        return words.slice(0, 10).join(" ") + (words.length > 10 ? " ..." : "");
                                    })()}
                                </TableCell> */}
                                <TableCell>
                                    <Image src={banner.image.url} alt="News Image" width={100} height={50} className="rounded-xl" />
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(banner)} className="mr-2 "><PencilIcon /></Button>
                                    <Button size="icon" onClick={() => { setShowDeleteModal(true); setBannerToDelete(banner._id); }} variant="destructive"><Trash2Icon /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="6" className="text-center py-4">No News found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete News</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this news?</p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default News