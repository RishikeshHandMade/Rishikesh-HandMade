"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import toast from "react-hot-toast";

import { PencilIcon, Star, Trash2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef } from "react";
import { UploadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";

const ConsultancyBanner = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState(null);
    const [banners, setBanners] = useState([]);
    const [editBanner, setEditBanner] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({
        title: "",
        buttonLink: "",
        rating: 0,
        shortDescription: "",
        image: { url: "", key: "" },
        order: 1,
    });
    const [wordCount, setWordCount] = useState(0);
    const maxWords = 80;

    // Fetch banners and determine the next order number
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch("/api/addConsultancyBanner");
                const data = await response.json();
                setBanners(data);

                // Auto-set next order number
                if (data.length > 0) {
                    const highestOrder = Math.max(...data.map((b) => b.order));
                    setFormData((prev) => ({ ...prev, order: highestOrder + 1 }));
                }
            } catch (error) {
                toast.error("Failed to fetch consultancy banners");
            }
        };
        fetchBanners();
    }, []);

    const handleInputChange = (e) => {
        if (e.target.name === 'shortDescription') {
            const words = e.target.value.trim().split(/\s+/);
            if (words.length > maxWords) {
                // If word count exceeds limit, trim the input
                const trimmedText = words.slice(0, maxWords).join(' ');
                setFormData({ ...formData, [e.target.name]: trimmedText });
                setWordCount(maxWords);
                return;
            }
            setWordCount(words.length);
        }
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check word count before submission
        const currentWordCount = formData.shortDescription.trim() ? 
            formData.shortDescription.trim().split(/\s+/).length : 0;
            
        if (currentWordCount > maxWords) {
            return toast.error(`Short description cannot exceed ${maxWords} words`);
        }
        
        if (!formData.image.url || !formData.image.key) {
            return toast.error("Please upload an image");
        }
        
        try {
            const method = editBanner ? "PATCH" : "POST";
            const payload = {
                ...formData,
                id: editBanner,
            };
            const response = await fetch("/api/addConsultancyBanner", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Consultancy banner ${editBanner ? "updated" : "added"} successfully`);
                setEditBanner(null);

                // Refresh banner list
                const updatedBanners = await fetch("/api/addConsultancyBanner").then((res) => res.json());
                setBanners(updatedBanners);

                // Reset form
                setRating(0);
                setHoverRating(0); // Reset the rating state
                setFormData({
                    title: "",
                    buttonLink: "",
                    rating: 0,
                    shortDescription: "",
                    order: updatedBanners.length + 1,
                    image: { url: "", key: "" },
                });

            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (banner) => {
        setEditBanner(banner._id);
        // Set both formData.rating and the rating state
        setRating(banner.rating || 0);
        setHoverRating(banner.rating || 0);
        const description = banner.shortDescription || '';
        setWordCount(description.trim() ? description.trim().split(/\s+/).length : 0);
        setFormData({
            title: banner.title,
            buttonLink: banner.buttonLink,
            rating: Number(banner.rating) || 0,
            order: banner.order,
            image: banner.image,
            shortDescription: description,
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch("/api/addConsultancyBanner", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("consultancy banners deleted successfully");

                setBanners((prev) => prev.filter((banner) => banner._id !== id));

                // Update order numbers
                const updatedBanners = await fetch("/api/addConsultancyBanner").then((res) => res.json());
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
            <h2 className="text-2xl font-bold mb-6">{editBanner ? "Edit Consultancy Banner" : "Add New Consultancy Banner"}</h2>
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                {/* Banner Image Upload */}
                <div className="mb-4">
                    <Label className="block mb-2 font-bold">Promotional Image</Label>
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
                        <span>Select Consultancy Banner Image</span>
                        <UploadIcon className="w-4 h-4" />
                    </Button>
                    {uploading && <div className="text-blue-600 font-semibold">Uploading...</div>}
                    {formData.image.url && (
                        <div className="relative w-48 h-28 border rounded overflow-hidden mb-2">
                            <Image
                                src={formData.image.url}
                                alt="Consultancy Image Preview"
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
                    <div className="flex justify-between items-center mb-1">
                        <Label>Short Description</Label>
                        <span className={`text-xs ${wordCount > maxWords ? 'text-red-500' : 'text-gray-500'}`}>
                            {wordCount}/{maxWords} words
                        </span>
                    </div>
                    <Textarea 
                        rows={5} 
                        name="shortDescription" 
                        placeholder="Enter Short Description (max 80 words)" 
                        value={formData.shortDescription} 
                        onChange={handleInputChange} 
                        className={`${wordCount > maxWords ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                    {wordCount > maxWords && (
                        <p className="mt-1 text-sm text-red-600">
                            Please reduce the description to {maxWords} words or less
                        </p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="font-semibold">Rating</label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={28}
                                className={
                                    (hoverRating || formData.rating) >= star
                                        ? 'text-yellow-500 cursor-pointer'
                                        : 'text-gray-400 cursor-pointer'
                                }
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        rating: star
                                    }));
                                }}
                                fill={(hoverRating || formData.rating) >= star ? '#FBBF24' : 'none'}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <Label>Button Link</Label>
                    <Input name="buttonLink" placeholder="Enter button link" type="url" value={formData.buttonLink} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>Order</Label>
                    <Input name="order" placeholder="Enter order" type="number" value={formData.order} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>

                <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                        {editBanner ? "Update Consultancy Banner" : "Add Consultancy Banner"}
                    </Button>
                    {editBanner && (
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-gray-300 hover:bg-gray-200 text-black"
                            onClick={() => {
                                setEditBanner(null);
                                setRating(0);
                                setHoverRating(0);
                                setFormData({
                                    title: "",
                                    buttonLink: "",
                                    rating: 0,
                                    shortDescription: "",
                                    order: banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1,
                                    image: { url: "", key: "" },
                                });
                            }}
                        >
                            Cancel Edit
                        </Button>
                    )}
                </div>
            </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">Existing Consultancy Image</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Button Link</TableHead>
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
                                <TableCell>{banner.rating}</TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-pointer">Hover to view</span>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-white text-blue-600 font-medium text-base font-barlow shadow-2xl">
                                                <p>{banner.buttonLink}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                    <Image src={banner.image.url} alt="Promotinal Image" width={100} height={50} className="rounded-xl" />
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(banner)} className="mr-2 "><PencilIcon /></Button>
                                    <Button size="icon" onClick={() => { setShowDeleteModal(true); setBannerToDelete(banner._id); }} variant="destructive"><Trash2Icon /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="6" className="text-center py-4">No banners found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Banner</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this banner?</p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ConsultancyBanner