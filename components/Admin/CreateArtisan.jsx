"use client";

import React, { useState, useEffect } from "react";


// DetailBox helper for view modal
const DetailBox = ({ label, value }) => (
    <div className="mb-2">
        <div className="font-semibold text-gray-700">{label}</div>
        <div className="text-gray-600">{value}</div>
    </div>
);

import { UploadButton } from "../../utils/uploadthing";
import { Switch } from "../ui/switch";

import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import toast from 'react-hot-toast';
import { Plus } from "lucide-react";

const CreateArtisan = () => {
    const [fatherHusbandType, setFatherHusbandType] = useState('Father');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null); // { url, key }
    const [showModal, setShowModal] = useState(false);
    const [newSpecialization, setNewSpecialization] = useState("");
    const [loading, setLoading] = useState(false);
    const [allSpecializations, setAllSpecializations] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const INDIAN_STATES = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];

    const handleView = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const closeModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
    };

    // UploadThing image upload handler
    const handleUploadComplete = (res) => {
        if (res && res.length > 0) {
            setUploadedImage({ url: res[0].url, key: res[0].key });
            setSelectedImage(res[0].url);
            toast.success("Image uploaded successfully");
        }
    };
    const handleUploadError = (err) => {
        toast.error("Image upload failed");
    };


    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/createArtisan');
            if (!res.ok) throw new Error('Failed to fetch artisans');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error('Error in fetchUsers:', err);
            toast.error("Failed to fetch users. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Handles edit and delete actions from ArtisanTable
    const handleAction = async (userId, action, imageKey) => {
        try {
            let userToEdit;
            switch (action) {
                case "edit":
                    userToEdit = users.find((user) => user._id === userId);
                    setEditingUser(userToEdit);
                    setFormMode('edit');
                    setSelectedImage(userToEdit.profileImage?.url || null);
                    setUploadedImage(userToEdit.profileImage || null);
                    setSpecializations(userToEdit.specializations || []);
                    setEditForm({
                        ...userToEdit,
                        callNumber: userToEdit.contact?.callNumber || "",
                        whatsappNumber: userToEdit.contact?.whatsappNumber || "",
                        email: userToEdit.contact?.email || "",
                        address: userToEdit.address?.fullAddress || '',
                        city: userToEdit.address?.city || '',
                        state: userToEdit.address?.state || '',
                        yearsOfExperience: userToEdit.yearsOfExperience || "",
                        specializations: userToEdit.specializations || [],
                    });
                    setFatherHusbandType(userToEdit.fatherHusbandType || 'Father');
                    setTimeout(() => {
                        if (document.forms['artisanForm']) {
                            const f = document.forms['artisanForm'];
                            f.title.value = userToEdit.title || '';
                            f.firstName.value = userToEdit.firstName || '';
                            f.lastName.value = userToEdit.lastName || '';
                            f.fatherHusbandTitle.value = userToEdit.fatherHusbandTitle || '';
                            f.fatherHusbandName.value = userToEdit.fatherHusbandName || '';
                            f.fatherHusbandLastName.value = userToEdit.fatherHusbandLastName || '';
                            f.shgName.value = userToEdit.shgName || '';
                            f.artisanNumber.value = userToEdit.artisanNumber || '';
                            f.yearsOfExperience.value = userToEdit.yearsOfExperience || '';
                            f.callNumber.value = userToEdit.contact?.callNumber || '';
                            f.whatsappNumber.value = userToEdit.contact?.whatsappNumber || '';
                            f.email.value = userToEdit.contact?.email || '';
                            f.address.value = userToEdit.address?.fullAddress || '';
                            f.city.value = userToEdit.address?.city || '';
                            f.state.value = userToEdit.address?.state || '';
                        }
                    }, 100);
                    break;
                case "delete":
                    // For delete, send DELETE request with artisan id and imageKey
                    setLoading(true);
                    const res = await fetch('/api/createArtisan', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: userId, imageKey })
                    });
                    if (res.ok) {
                        toast.success("User deleted successfully");
                        fetchUsers();
                    } else {
                        const err = await res.json();
                        toast.error(err.message || "Failed to delete user.");
                    }
                    setLoading(false);
                    break;
                default:
                    break;
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to perform action. Please try again.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSpecializations();
    }, []);

    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            title: 'Mr.',
            fatherHusbandType: 'Father',
            fatherHusbandTitle: 'Mr.',
            // Add other defaults if needed
        }
    });



    // Fetch specializations on mount
    useEffect(() => {
        fetchSpecializations();
    }, []);

    const fetchSpecializations = async () => {
        try {
            const res = await fetch('/api/specialization');
            const data = await res.json();
            console.log('Specialization API response:', data);
            if (Array.isArray(data) && data.length > 0 && data[0].name) {
                setAllSpecializations(data.map(s => s.name));
            } else if (Array.isArray(data) && data.length === 0) {
                setAllSpecializations([]);
                toast.error('No specializations found.');
            } else {
                setAllSpecializations([]);
                toast.error('Specialization API returned unexpected data.');
            }
        } catch (err) {
            toast.error('Failed to fetch specializations');
            setAllSpecializations([]);
        }
    };

    const onSubmit = async (data) => {
        // Gather missing required fields for client-side validation
        const requiredFields = [
            { key: 'title', label: 'Title' },
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'fatherHusbandType', label: 'Father/Husband Type' },
            { key: 'fatherHusbandTitle', label: 'Father/Husband Title' },
            { key: 'fatherHusbandName', label: 'Father/Husband Name' },
            { key: 'fatherHusbandLastName', label: 'Father/Husband Last Name' },
            { key: 'shgName', label: 'SHG Name' },
            { key: 'artisanNumber', label: 'Artisan Number' },
            { key: 'yearsOfExperience', label: "Year's Of Experience" },
            { key: 'callNumber', label: 'Call Number' },
            { key: 'address', label: 'Address' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
        ];
        const missing = requiredFields.filter(f => !data[f.key] || data[f.key].toString().trim() === '');
        if (missing.length > 0) {
            toast.error('Missing fields: ' + missing.map(f => f.label).join(', '));
            return;
        }
        // Proceed as before
        const payload = {
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            fatherHusbandType: data.fatherHusbandType,
            fatherHusbandTitle: data.fatherHusbandTitle,
            fatherHusbandName: data.fatherHusbandName,
            fatherHusbandLastName: data.fatherHusbandLastName,
            shgName: data.shgName,
            artisanNumber: data.artisanNumber,
            yearsOfExperience: data.yearsOfExperience,
            specializations: data.specialization ? [data.specialization] : [],
            callNumber: data.callNumber,
            whatsappNumber: data.whatsappNumber,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            profileImage: uploadedImage && typeof uploadedImage === 'object' && uploadedImage.url ? uploadedImage.url : (typeof uploadedImage === 'string' ? uploadedImage : null)
        };
        setLoading(true);
        try {
            const res = await fetch('/api/createArtisan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                if (
                    (err.error && err.error.includes('duplicate key')) || err.code === 11000 || (err.message && err.message.includes('Artisan number already exists'))
                ) {
                    toast.error('Artisan number already exists');
                } else {
                    toast.error(err.message || 'Failed to create artisan');
                    toast.error(err.message || 'Data not submitted! Please try again.');
                }
            }
        } catch (e) {
            toast.error('Data not submitted! Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => setSelectedImage(reader.result);
    //         reader.readAsDataURL(file);
    //     }
    // };

    const handleAddSpecialization = async () => {
        if (!newSpecialization.trim()) return;
        try {
            await fetch('/api/specialization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSpecialization.trim() })
            });
            setNewSpecialization("");
            setShowModal(false);
            fetchSpecializations();
            toast.success('Specialization added');
        } catch {
            toast.error('Failed to add specialization');
        }
    };

    // Toggle artisan active status
    const handleToggleActive = async (artisan) => {
        try {
            const res = await fetch('/api/createArtisan', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: artisan._id, active: !artisan.active })
            });
            if (!res.ok) throw new Error('Failed to update status');
            setUsers(prev => prev.map(a => a._id === artisan._id ? { ...a, active: !a.active } : a));
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    // Inline delete modal state for the table
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [artisanToDelete, setArtisanToDelete] = useState(null);

    // View artisan modal
    const handleTableView = (artisan) => {
        setSelectedUser(artisan);
        setShowUserModal(true);
    };
    const closeUserModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
    };

    // Edit artisan logic (no modal)
    const handleTableEdit = (artisan) => {
        setEditingUser(artisan);
        setEditForm({
            ...artisan,
            callNumber: artisan.contact?.callNumber || '',
            whatsappNumber: artisan.contact?.whatsappNumber || '',
            email: artisan.contact?.email || '',
            address: artisan.address?.fullAddress || '',
            city: artisan.address?.city || '',
            state: artisan.address?.state || '',
            profileImage: artisan.profileImage || '',
        });
        // Populate form fields
        setValue('title', artisan.title || 'Mr.');
        setValue('firstName', artisan.firstName || '');
        setValue('lastName', artisan.lastName || '');
        setValue('fatherHusbandType', artisan.fatherHusbandType || 'Father');
        setValue('fatherHusbandTitle', artisan.fatherHusbandTitle || 'Mr.');
        setValue('fatherHusbandName', artisan.fatherHusbandName || '');
        setValue('fatherHusbandLastName', artisan.fatherHusbandLastName || '');
        setValue('shgName', artisan.shgName || '');
        setValue('artisanNumber', artisan.artisanNumber || '');
        setValue('yearsOfExperience', artisan.yearsOfExperience || '');
        setValue('specialization', Array.isArray(artisan.specializations) ? artisan.specializations[0] : (artisan.specializations || ''));
        setValue('callNumber', artisan.contact?.callNumber || '');
        setValue('whatsappNumber', artisan.contact?.whatsappNumber || '');
        setValue('email', artisan.contact?.email || '');
        setValue('address', artisan.address?.fullAddress || '');
        setValue('city', artisan.address?.city || '');
        setValue('state', artisan.address?.state || '');
        setSelectedImage(artisan.profileImage || '');
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({});
        reset();
        setSelectedImage('');
    };


    // Edit form change handler
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    // Edit form submit handler
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            // Ensure specialization is sent as an array
            const specializationValue = editForm.specialization || (Array.isArray(editForm.specializations) ? editForm.specializations[0] : '');
            // Remove fields that should not be sent to PATCH
            const {
                _id, createdAt, updatedAt, __v,
                callNumber, whatsappNumber, email, city, state, // remove these from top-level
                ...rest
            } = editForm;

            // Check for duplicate artisan number
            try {
                const isDuplicateNumber = users.some(user =>
                    user.artisanNumber === editForm.artisanNumber &&
                    (!editingUser || user._id !== editingUser._id)
                );
                if (isDuplicateNumber) {
                    toast.error('Artisan number already exists');
                    return;
                }
            } catch (dupErr) {
                toast.error('Artisan number check failed');
                return;
            }

            const payload = {
                id: editingUser._id,
                ...rest,
                specializations: [specializationValue],
                contact: {
                    callNumber: editForm.callNumber,
                    whatsappNumber: editForm.whatsappNumber,
                    email: editForm.email
                },
                address: {
                    fullAddress: editForm.address,
                    city: editForm.city,
                    state: editForm.state
                },
                profileImage: (
                    typeof editForm.profileImage === 'object' && editForm.profileImage !== null
                        ? {
                            url: editForm.profileImage.url || '',
                            key: editForm.profileImage.key || ''
                        }
                        : uploadedImage && typeof uploadedImage === 'object'
                            ? {
                                url: uploadedImage.url || '',
                                key: uploadedImage.key || ''
                            }
                            : {
                                url: editForm.profileImage || '',
                                key: uploadedImage?.key || ''
                            }
                )
            };
            const res = await fetch('/api/createArtisan', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update artisan');
            const data = await res.json();
            setUsers(prev => prev.map(a => a._id === editingUser._id ? data.artisan : a));
            toast.success('Artisan updated successfully');
            setEditingUser(null);
            setEditForm({});
            reset();
            setSelectedImage('');
        } catch (err) {
            toast.error('Failed to update artisan');
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditForm({});
    };


    // Inline delete handlers for the table
    const handleInlineDelete = (artisan) => {
        setArtisanToDelete(artisan);
        setShowDeleteModal(true);
    };
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setArtisanToDelete(null);
    };
    const confirmDelete = async () => {
        if (!artisanToDelete) return;
        try {
            const res = await fetch("/api/createArtisan", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: artisanToDelete._id, imageKey: artisanToDelete.profileImage?.key || undefined })
            });
            if (!res.ok) throw new Error("Failed to delete artisan");
            toast.success("Artisan deleted successfully");
            setUsers(prev => prev.filter(a => a._id !== artisanToDelete._id));
        } catch (err) {
            toast.error("Failed to delete artisan");
        } finally {
            setShowDeleteModal(false);
            setArtisanToDelete(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10">
            <form
                className="flex flex-col md:flex-row gap-8 bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl"
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* Left: Form Fields */}
                <div className="flex-1 space-y-4">
                    {/* Artisan Name & Father/Husband Info */}
                    <div>
                        <div className="font-semibold mb-1">Artisan Name</div>
                        {/* Name/Title Row */}
                        <div className="flex gap-2 mb-3">
                            <Select value={watch('title') || ''} onValueChange={val => setValue('title', val, { shouldValidate: true })}>
                                <SelectTrigger className="w-24"><SelectValue placeholder="Mr." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mr.">Mr.</SelectItem>
                                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                                    <SelectItem value="Ms.">Ms.</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input placeholder="First Name" {...register('firstName', { required: true })} />
                            <Input placeholder="Last Name" {...register('lastName', { required: true })} />
                        </div>
                        <div className="font-semibold mb-1">Father/Husband Details</div>
                        {/* Father/Husband Row */}
                        <div className="flex gap-2 mb-2">
                            <Select value={watch('fatherHusbandType') || fatherHusbandType} onValueChange={val => { setFatherHusbandType(val); setValue('fatherHusbandType', val, { shouldValidate: true }); }}>
                                <SelectTrigger className="w-32"><SelectValue placeholder="Father/Husband" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Father">Father</SelectItem>
                                    <SelectItem value="Husband">Husband</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Father/Husband Details Row */}
                        <div className="flex gap-2 mb-2">
                            <Select value={watch('fatherHusbandTitle') || ''} onValueChange={val => setValue('fatherHusbandTitle', val, { shouldValidate: true })}>
                                <SelectTrigger className="w-24"><SelectValue placeholder="Mr." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mr.">Mr.</SelectItem>
                                    <SelectItem value="Mrs.">Late.</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input placeholder={fatherHusbandType === 'Husband' ? 'Husband First Name' : 'Father First Name'} {...register('fatherHusbandName', { required: true })} />
                            <Input placeholder={fatherHusbandType === 'Husband' ? 'Husband Last Name' : 'Father Last Name'} {...register('fatherHusbandLastName', { required: true })} />
                        </div>
                    </div>
                    {/* Artisan Detail */}
                    <div>
                        <div className="font-semibold mb-1">Artisan Detail</div>
                        <div className="flex gap-2 mb-2">
                            <Input placeholder="SHG Name" {...register('shgName', { required: true })} />
                            <Input placeholder="Artisan Number" {...register('artisanNumber', { required: true })} />
                        </div>
                        <div className="flex gap-2">
                            <Input placeholder="Year's Of Experience" type="number" {...register('yearsOfExperience', { required: true })} />
                            <div className="flex gap-2 w-full">
                                <Select value={watch('specialization') || (Array.isArray(editForm.specializations) ? editForm.specializations[0] : (editForm.specializations || ''))} onValueChange={val => setValue('specialization', val, { shouldValidate: true })}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Specialized In" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {allSpecializations.map((spec, i) => (
                                                <SelectItem key={i} value={spec}>{spec}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="icon" onClick={() => setShowModal(true)}>
                                    <Plus />
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Contact Number */}
                    <div>
                        <div className="font-semibold mb-1">Contact Number</div>
                        <div className="flex flex-row gap-3 w-full">
                            <div className="flex items-center w-1/2">
                                <input
                                    type="text"
                                    value="+91"
                                    disabled
                                    className="w-12 p-2 bg-gray-100 border border-gray-300 rounded-l text-center text-sm"
                                    tabIndex={-1}
                                    style={{ pointerEvents: 'none' }}
                                />
                                <Input
                                    placeholder="Call Number"
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    {...register('callNumber', { required: true })}
                                    className="rounded-l-none w-full"
                                />
                            </div>
                            <div className="flex items-center w-1/2">
                                <input
                                    type="text"
                                    value="+91"
                                    disabled
                                    className="w-12 p-2 bg-gray-100 border border-gray-300 rounded-l text-center text-sm"
                                    tabIndex={-1}
                                    style={{ pointerEvents: 'none' }}
                                />
                                <Input
                                    placeholder="Whats App Number"
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    {...register('whatsappNumber')}
                                    className="rounded-l-none w-full"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Email */}
                    <div>
                        <div className="font-semibold mb-1">Email (Optional)</div>
                        <Input placeholder="Type Email Here" type="email" {...register('email')} />
                    </div>
                    {/* Address */}
                    <div>
                        <div className="font-semibold mb-1">Address</div>
                        <Textarea placeholder="Full Address" {...register('address', { required: true })} />
                        <div className="flex gap-2 mt-2">
                            <Input placeholder="City" {...register('city', { required: true })} />
                            <Select value={watch('state') || ''} onValueChange={val => setValue('state', val, { shouldValidate: true })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="State" /></SelectTrigger>
                                <SelectContent>
                                    {INDIAN_STATES.map((state, i) => (
                                        <SelectItem key={i} value={state}>{state}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {editingUser ? (
                        <div className="flex gap-4 mt-4">
                            <Button type="button" onClick={handleEditSubmit} className="hover:bg-green-900 bg-blue-900 w-32 flex items-center justify-center" disabled={loading}>
                                {loading && (
                                    <span className="inline-block w-4 h-4 mr-2 border-2 border-t-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></span>
                                )}
                                {loading ? "Updating..." : "Update"}
                            </Button>
                            <Button type="button" onClick={handleCancelEdit} className="hover:bg-gray-700 bg-gray-500 w-32 flex items-center justify-center" disabled={loading}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button type="submit" className="hover:bg-red-900 bg-blue-900 w-32 mt-4 flex items-center justify-center" disabled={loading}>
                            {loading && (
                                <span className="inline-block w-4 h-4 mr-2 border-2 border-t-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></span>
                            )}
                            {loading ? "Saving..." : "Data Save"}
                        </Button>
                    )}
                </div>
                {/* Right: Image Upload with UploadThing */}
                <div className="flex flex-col items-center gap-8 min-w-[260px] w-full md:w-[320px]">
                    <div className="w-full flex flex-col items-center bg-gray-100 rounded-lg p-6 border border-gray-200">
                        <div className="mb-4 w-full aspect-square bg-white flex items-center justify-center rounded border border-dashed border-gray-400 overflow-hidden">
                            {selectedImage ? (
                                <img src={selectedImage} alt="Preview" className="object-cover w-full h-full" />
                            ) : (
                                <span className="text-gray-400">Upload Image</span>
                            )}
                        </div>
                        <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                        />
                    </div>
                </div>
            </form>
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Specialization</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newSpecialization}
                        onChange={e => setNewSpecialization(e.target.value)}
                        placeholder="Specialization Name"
                        className="mb-4"
                    />
                    <DialogFooter>
                        <Button type="button" onClick={handleAddSpecialization}>Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="w-full max-w-5xl mx-auto mt-10">
                <div className="w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artisan Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artisan Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center">No artisans found.</td>
                                </tr>
                            ) : (
                                users.map((artisan, idx) => (
                                    <tr key={artisan._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{artisan.firstName} {artisan.lastName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{artisan.artisanNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Switch
                                                checked={artisan.active}
                                                onCheckedChange={() => handleToggleActive(artisan)}
                                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button className="mr-2 px-2 py-1 border rounded" onClick={() => handleTableView(artisan)}>View</button>
                                            <button className="mr-2 px-2 py-1 border rounded bg-gray-200" onClick={() => handleTableEdit(artisan)}>Edit</button>
                                            <button className="px-2 py-1 border rounded bg-red-500 text-white" onClick={() => handleInlineDelete(artisan)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white rounded shadow-lg p-8">
                                <h2 className="text-lg font-semibold mb-4">Delete Artisan</h2>
                                <p>Are you sure you want to delete this artisan?</p>
                                <div className="flex justify-end mt-6 gap-3">
                                    <button className="px-4 py-2 border rounded" onClick={cancelDelete}>Cancel</button>
                                    <button className="px-4 py-2 border rounded bg-red-500 text-white" onClick={confirmDelete}>Delete</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Artisan Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg max-w-4xl w-full p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Artisan Profile</h2>
                            <button onClick={closeUserModal} className="text-gray-500 hover:text-black">&times;</button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Image + Address Column */}
                            <div className="md:w-1/3 w-full">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white mb-6">
                                    {selectedUser.profileImage ? (
                                        <img src={selectedUser.profileImage} alt="Profile" className="w-full h-72 object-cover rounded" />
                                    ) : (
                                        <div className="text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm mb-2">
                                    <div className="font-semibold text-gray-800">Full Address</div>
                                    <div className="text-gray-600">{selectedUser.address?.fullAddress || '-'}</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="bg-white p-3 rounded shadow-sm w-1/2">
                                        <div className="font-semibold text-gray-800">City</div>
                                        <div className="text-gray-600">{selectedUser.address?.city || '-'}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm w-1/2">
                                        <div className="font-semibold text-gray-800">State</div>
                                        <div className="text-gray-600">{selectedUser.address?.state || '-'}</div>
                                    </div>
                                </div>
                            </div>
                            {/* Details Section */}
                            <div className="md:w-2/3 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailBox label="Full Name" value={`${selectedUser.title} ${selectedUser.firstName} ${selectedUser.lastName}`} />
                                    <DetailBox label="Relationship Type" value={selectedUser.fatherHusbandType} />
                                    <DetailBox label={`${selectedUser.fatherHusbandType} Name`} value={`${selectedUser.fatherHusbandTitle} ${selectedUser.fatherHusbandName} ${selectedUser.fatherHusbandLastName}`} />
                                    <DetailBox label="SHG Name" value={selectedUser.shgName} />
                                    <DetailBox label="Artisan Number" value={selectedUser.artisanNumber} />
                                    <DetailBox label="Years of Experience" value={selectedUser.yearsOfExperience} />
                                    <DetailBox label="Specializations" value={Array.isArray(selectedUser.specializations) ? selectedUser.specializations.join(', ') : selectedUser.specializations} />
                                    <DetailBox label="Email" value={selectedUser.email || selectedUser.contact?.email || '-'} />
                                    <DetailBox label="Call Number" value={selectedUser.callNumber || selectedUser.contact?.callNumber || '-'} />
                                    <DetailBox label="WhatsApp Number" value={selectedUser.whatsappNumber || selectedUser.contact?.whatsappNumber || '-'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Artisan Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg max-w-3xl w-full p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Artisan</h2>
                            <button onClick={closeEditModal} className="text-gray-500 hover:text-black">&times;</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">First Name</label>
                                <Input name="firstName" value={editForm.firstName || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Last Name</label>
                                <Input name="lastName" value={editForm.lastName || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Title</label>
                                <Input name="title" value={editForm.title || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Father/Husband Type</label>
                                <Input name="fatherHusbandType" value={editForm.fatherHusbandType || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Father/Husband Title</label>
                                <Input name="fatherHusbandTitle" value={editForm.fatherHusbandTitle || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Father/Husband Name</label>
                                <Input name="fatherHusbandName" value={editForm.fatherHusbandName || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Father/Husband Last Name</label>
                                <Input name="fatherHusbandLastName" value={editForm.fatherHusbandLastName || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">SHG Name</label>
                                <Input name="shgName" value={editForm.shgName || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Artisan Number</label>
                                <Input name="artisanNumber" value={editForm.artisanNumber || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Years of Experience</label>
                                <Input name="yearsOfExperience" value={editForm.yearsOfExperience || ''} onChange={handleEditFormChange} required />
                            </div>
                            <div>
                                <label className="font-semibold">Specializations</label>
                                <Input name="specializations" value={Array.isArray(editForm.specializations) ? editForm.specializations.join(', ') : editForm.specializations || ''} onChange={handleEditFormChange} />
                            </div>
                            <div>
                                <label className="font-semibold">Email</label>
                                <Input name="email" value={editForm.email || ''} onChange={handleEditFormChange} />
                            </div>
                            <div>
                                <label className="font-semibold">Call Number</label>
                                <Input name="callNumber" value={editForm.callNumber || ''} onChange={handleEditFormChange} />
                            </div>
                            <div>
                                <label className="font-semibold">WhatsApp Number</label>
                                <Input name="whatsappNumber" value={editForm.whatsappNumber || ''} onChange={handleEditFormChange} />
                            </div>
                            <div>
                                <label className="font-semibold">Address</label>
                                <Input name="address" value={editForm.address || ''} onChange={handleEditFormChange} />
                            </div>
                            <div>
                                <label className="font-semibold">City</label>
                                <Input name="city" value={editForm.city || ''} onChange={handleEditFormChange} />
                            </div>
                            <div>
                                <label className="font-semibold">State</label>
                                <Input name="state" value={editForm.state || ''} onChange={handleEditFormChange} />
                            </div>
                            <div className="col-span-2 flex justify-end mt-4">
                                <Button type="submit">Update</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default CreateArtisan;