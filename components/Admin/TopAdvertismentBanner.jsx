"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import toast from "react-hot-toast";

import { PencilIcon, SwitchCamera, Trash2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef } from "react";
import { UploadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "../ui/switch";

const TopAdvertismentBanner = () => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState(null);
    const [banners, setBanners] = useState([]);
    const [editBanner, setEditBanner] = useState(null);
    const [formData, setFormData] = useState({
        title:"",
        buttonLink: "",
        order: 1,
    });

    // Fetch banners and determine the next order number
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch("/api/topAdvertismentBanner");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editBanner ? "PATCH" : "POST";          
            // Compose payload with coupon details
            const payload = {
                ...formData,
                id: editBanner,
            };
            const response = await fetch("/api/topAdvertismentBanner", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Advertisment ${editBanner ? "updated" : "added"} successfully`);
                setEditBanner(null);

                // Refresh banner list
                const updatedBanners = await fetch("/api/topAdvertismentBanner").then((res) => res.json());
                setBanners(updatedBanners);

                // Reset form
                setFormData({
                    title:"",
                    buttonLink: "",
                    order: updatedBanners.length + 1,
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
        // console.log(banner)
        setFormData({
            title:banner.title,
            buttonLink: banner.buttonLink,
            order: banner.order,
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch("/api/topAdvertismentBanner", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Banner deleted successfully");

                setBanners((prev) => prev.filter((banner) => banner._id !== id));

                // Update order numbers
                const updatedBanners = await fetch("/api/topAdvertismentBanner").then((res) => res.json());
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

    const handleToggleActive = async (id, isActive) => {
        try {
            const response = await fetch("/api/topAdvertismentBanner", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update banner status");
            }

            // Update local state to reflect the change
            setBanners(prevBanners =>
                prevBanners.map(banner =>
                    banner._id === id ? { ...banner, isActive } : banner
                )
            );
            toast.success("Banner status updated successfully");
        } catch (error) {
            console.error("Error updating banner status:", error);
            toast.error(error.message || "Failed to update banner status");
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 w-full">
            <h2 className="text-2xl font-bold mb-6">{editBanner ? "Edit Advertisment Banner" : "Add New Advertisment Banner"}</h2>
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-4">
            <div>
                    <Label>Title </Label>
                    <Input name="title" placeholder="Enter Title Line" type="text" value={formData.title} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>URL Link</Label>
                    <Input name="buttonLink" placeholder="Enter url link" type="url" value={formData.buttonLink} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>Order</Label>
                    <Input name="order" placeholder="Enter order" type="number" value={formData.order} readOnly className="bg-gray-100 cursor-not-allowed" />
                </div>

                <div className="flex gap-3">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                        {editBanner ? "Update Advertisment Banner" : "Add Advertisment Banner"}
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
                                    buttonLink: "",
                                    order: banners.length > 0 ? Math.max(...banners.map(b => b.order)) + 1 : 1,
                                });
                            }}
                        >
                            Cancel Edit
                        </Button>
                    )}
                </div>
            </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">Existing Advertisment Image</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Button Link</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {banners.length > 0 ? (
                        banners.map((banner) => (
                            <TableRow key={banner._id}>
                                <TableCell>{banner.order}</TableCell>
                                <TableCell className=" w-64 text-wrap">{banner.title}</TableCell>
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
                                    <Switch
                                        checked={banner.isActive}
                                        onCheckedChange={(checked) => handleToggleActive(banner._id, checked)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(banner)} className="mr-2 "><PencilIcon /></Button>
                                    <Button size="icon" onClick={() => { setShowDeleteModal(true); setBannerToDelete(banner._id); }} variant="destructive"><Trash2Icon /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="5" className="text-center py-4">No banners found</TableCell>
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

export default TopAdvertismentBanner