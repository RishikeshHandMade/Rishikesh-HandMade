'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { statesIndia } from "../lib/IndiaStates"
import { toast } from 'react-hot-toast';
import Image from 'next/image';
const BecomePartner = () => {
    const [formData, setFormData] = useState({
        // Business Information
        businessName: '',
        businessType: '',
        industryCategory: '',
        yearOfEstablishment: '',
        legalStructure: '',
        isGstRegistered: false,
        gstNumber: '',
        panNumber: '',
        msmeNumber: '',

        // Primary Contact
        contactPerson: '',
        designation: '',
        mobile: '',
        alternateMobile: '',
        email: '',
        whatsappNumber: '',

        // Business Address
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: '',

        // Product & Supply
        deliveryCapability: '',

        // Bank Details
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',

        // Compliance
        qualityCertifications: '',
        returnPolicy: '',

        // Verification
        aadhaarNumber: '',

        // Other
        referredBy: '',
        additionalNotes: ''
    });

    const [currentSection, setCurrentSection] = useState(1);
    const totalSections = 6;
    const [uploading, setUploading] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(field);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/cloudinary', {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (res.ok && data.url) {
                setFormData(prev => ({
                    ...prev,
                    [field]: { url: data.url, key: data.key || '' }
                }));
                toast.success('File uploaded successfully!');
            } else {
                throw new Error(data.error || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${field}: ${error.message || 'Unknown error occurred'}`);
        } finally {
            setUploading('');
        }
    };
    
    const removeFile = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: null   
        }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic client-side validation
        if (!formData.businessName || !formData.email || !formData.mobile) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/becomePartner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Clear form after successful submission
            setFormData({
                businessName: '',
                businessType: '',
                industryCategory: '',
                yearOfEstablishment: '',
                legalStructure: '',
                isGstRegistered: false,
                gstNumber: '',
                panNumber: '',
                msmeNumber: '',
                contactPerson: '',
                designation: '',
                mobile: '',
                alternateMobile: '',
                email: '',
                whatsappNumber: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                country: '',
                deliveryCapability: '',
                bankName: '',
                accountHolderName: '',
                accountNumber: '',
                ifscCode: '',
                branch: '',
                qualityCertifications: '',
                returnPolicy: '',
                aadhaarNumber: '',
                referredBy: '',
                gstCertificate: null,
                panCard: null,
                msmeCertificate: null,
                cancelledCheque: null,
                productCatalog: null,
                businessCard: null
            });
            
            setCurrentSection(1);
            toast.success('Application submitted successfully! We will get back to you soon.');
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextSection = () => {
        if (currentSection < totalSections) {
            setCurrentSection(currentSection + 1);
        }
    };

    const prevSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Become a Partner</CardTitle>
                    <CardDescription className="text-center">
                        Fill out the form below to register as a partner with Rishikesh HandMade
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${(currentSection / totalSections) * 100}%` }}
                            ></div>
                        </div>

                        {/* Section 1: Business Information */}
                        {currentSection === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Business Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Business / Company Name *</Label>
                                        <Input
                                            id="businessName"
                                            name="businessName"
                                            placeholder="Enter Business / Company Name"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="businessType">Business Type *</Label>
                                        <Select
                                            value={formData.businessType}
                                            onValueChange={(value) => handleSelectChange('businessType', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select business type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                                                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                                                <SelectItem value="distributor">Distributor</SelectItem>
                                                <SelectItem value="supplier">Supplier</SelectItem>
                                                <SelectItem value="agency">Agency</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="industryCategory">Industry / Product Category *</Label>
                                        <Input
                                            id="industryCategory"
                                            name="industryCategory"
                                            placeholder="Enter Industry / Product Category"
                                            value={formData.industryCategory}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="yearOfEstablishment">Year of Establishment *</Label>
                                        <Input
                                            type="number"
                                            id="yearOfEstablishment"
                                            name="yearOfEstablishment"
                                            placeholder="Enter Year of Establishment"
                                            value={formData.yearOfEstablishment}
                                            onChange={handleChange}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="legalStructure">Legal Structure *</Label>
                                        <Select
                                            value={formData.legalStructure}
                                            onValueChange={(value) => handleSelectChange('legalStructure', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select legal structure" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="proprietor">Proprietor</SelectItem>
                                                <SelectItem value="partnership">Partnership</SelectItem>
                                                <SelectItem value="pvt-ltd">Pvt Ltd</SelectItem>
                                                <SelectItem value="llp">LLP</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isGstRegistered"
                                                name="isGstRegistered"
                                                className="w-5 h-5"
                                                checked={formData.isGstRegistered}
                                                onCheckedChange={(checked) =>
                                                    setFormData(prev => ({ ...prev, isGstRegistered: checked }))
                                                }
                                            />
                                            <Label htmlFor="isGstRegistered">GST Registered?</Label>
                                        </div>

                                        {formData.isGstRegistered && (
                                            <div className="mt-2 space-y-2">
                                                <Label htmlFor="gstNumber">GST Number *</Label>
                                                <Input
                                                    id="gstNumber"
                                                    name="gstNumber"
                                                    value={formData.gstNumber}
                                                    onChange={handleChange}
                                                    required={formData.isGstRegistered}
                                                    placeholder="22AAAAA0000A1Z5"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="panNumber">PAN Number *</Label>
                                        <Input
                                            id="panNumber"
                                            name="panNumber"
                                            value={formData.panNumber}
                                            onChange={handleChange}
                                            required
                                            placeholder="AAAAA0000A"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="msmeNumber">MSME/Udyam Registration No (Optional)</Label>
                                        <Input
                                            id="msmeNumber"
                                            name="msmeNumber"
                                            placeholder="Enter MSME/Udyam Registration No"
                                            value={formData.msmeNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 2: Contact Information */}
                        {currentSection === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Primary Contact Person</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPerson">Contact Person Name *</Label>
                                        <Input
                                            id="contactPerson"
                                            name="contactPerson"
                                            placeholder="Enter Contact Person Name"
                                            value={formData.contactPerson}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="designation">Designation *</Label>
                                        <Input
                                            id="designation"
                                            name="designation"
                                            placeholder="Enter Designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile Number *</Label>
                                        <Input
                                            type="tel"
                                            id="mobile"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="Enter Mobile Number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="alternateMobile">Alternate Mobile (optional)</Label>
                                        <Input
                                            type="tel"
                                            id="alternateMobile"
                                            name="alternateMobile"
                                            value={formData.alternateMobile}
                                            onChange={handleChange}
                                            pattern="[0-9]{10}"
                                            placeholder="Enter Alternate Mobile Number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="contact@example.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                                        <Input
                                            type="tel"
                                            id="whatsappNumber"
                                            name="whatsappNumber"
                                            value={formData.whatsappNumber}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="Enter WhatsApp Number"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold pt-4">Business Address</h3>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Office Address *</Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            placeholder="Enter Office Address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter City"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Select
                                                value={formData.state}
                                                onValueChange={(value) => handleSelectChange('state', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select State" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statesIndia.map((state,idx) => (
                                                        <SelectItem key={idx} value={state}>
                                                            {state}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pincode">Pin Code *</Label>
                                            <Input
                                                id="pincode"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                required
                                                pattern="[0-9]{6}"
                                                placeholder="123456"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country *</Label>
                                            <Input
                                                id="country"
                                                name="country"
                                                placeholder="Enter Country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 3: Product & Supply */}
                        {currentSection === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Product & Supply Details</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="deliveryCapability">Delivery Capability *</Label>
                                    <Select
                                        value={formData.deliveryCapability}
                                        onValueChange={(value) => handleSelectChange('deliveryCapability', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select delivery capability" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="local">Local</SelectItem>
                                            <SelectItem value="state">State</SelectItem>
                                            <SelectItem value="pan-india">PAN India</SelectItem>
                                            <SelectItem value="international">International</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-semibold">Upload Documents</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {formData.isGstRegistered && (
                                            <div className="space-y-2">
                                                <Label>GST Certificate {formData.isGstRegistered && '*'}</Label>
                                                {formData.gstCertificate?.url ? (
                                                    <div className="relative group">
                                                        <div className="border rounded-md p-2 flex items-center justify-between">
                                                            <span className="truncate">
                                                                {formData.gstCertificate.url.split('/').pop()}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFile('gstCertificate')}
                                                                className="text-destructive hover:text-destructive/80"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                        {formData.gstCertificate.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                            <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                                <Image
                                                                    src={formData.gstCertificate.url}
                                                                    alt="GST Certificate"
                                                                    fill
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileUpload(e, 'gstCertificate')}
                                                            required={formData.isGstRegistered}
                                                            disabled={!formData.isGstRegistered || uploading === 'gstCertificate'}
                                                            className="flex-1"
                                                        />
                                                        {uploading === 'gstCertificate' && (
                                                            <div className="text-sm text-muted-foreground">Uploading...</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>PAN Card *</Label>
                                            {formData.panCard?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.panCard.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('panCard')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    {formData.panCard.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                        <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                            <Image
                                                                src={formData.panCard.url}
                                                                alt="PAN Card"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'panCard')}
                                                        required
                                                        disabled={uploading === 'panCard'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'panCard' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>MSME/Udyam Certificate (Optional)</Label>
                                            {formData.msmeCertificate?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.msmeCertificate.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('msmeCertificate')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    {formData.msmeCertificate.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                        <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                            <Image
                                                                src={formData.msmeCertificate.url}
                                                                alt="MSME Certificate"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'msmeCertificate')}
                                                        disabled={uploading === 'msmeCertificate'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'msmeCertificate' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Bank Cancelled Cheque *</Label>
                                            {formData.cancelledCheque?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.cancelledCheque.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('cancelledCheque')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    {formData.cancelledCheque.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                        <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                            <Image
                                                                src={formData.cancelledCheque.url}
                                                                alt="Cancelled Cheque"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'cancelledCheque')}
                                                        required
                                                        disabled={uploading === 'cancelledCheque'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'cancelledCheque' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Product Catalog/Brochure *</Label>
                                            {formData.productCatalog?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.productCatalog.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('productCatalog')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    {formData.productCatalog.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                        <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                            <Image
                                                                src={formData.productCatalog.url}
                                                                alt="Product Catalog"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'productCatalog')}
                                                        required
                                                        disabled={uploading === 'productCatalog'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'productCatalog' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Business Card (Optional)</Label>
                                            {formData.businessCard?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.businessCard.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('businessCard')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                        <Image
                                                            src={formData.businessCard.url}
                                                            alt="Business Card"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'businessCard')}
                                                        disabled={uploading === 'businessCard'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'businessCard' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 4: Bank Details */}
                        {currentSection === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Bank Details</h3>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Bank Name *</Label>
                                        <Input
                                            id="bankName"
                                            name="bankName"
                                            placeholder="Enter Bank Name"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                        <Input
                                            id="accountHolderName"
                                            name="accountHolderName"
                                            placeholder="Enter Account Holder Name"
                                            value={formData.accountHolderName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="accountNumber">Account Number *</Label>
                                            <Input
                                                id="accountNumber"
                                                name="accountNumber"
                                                placeholder="Enter Account Number"
                                                value={formData.accountNumber}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="ifscCode">IFSC Code *</Label>
                                            <Input
                                                id="ifscCode"
                                                name="ifscCode"
                                                placeholder="Enter IFSC Code"
                                                value={formData.ifscCode}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="branch">Branch *</Label>
                                        <Input
                                            id="branch"
                                            name="branch"
                                            placeholder="Enter Branch"
                                            value={formData.branch}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 5: Compliance & Verification */}
                        {currentSection === 5 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Compliance</h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="qualityCertifications">Quality Certifications (ISO/Organic/Handloom etc)</Label>
                                        <Textarea
                                            id="qualityCertifications"
                                            name="qualityCertifications"
                                            value={formData.qualityCertifications}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="List any quality certifications your business holds"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="returnPolicy">Return / Replacement Policy *</Label>
                                        <Textarea
                                            id="returnPolicy"
                                            name="returnPolicy"
                                            value={formData.returnPolicy}
                                            onChange={handleChange}
                                            rows={3}
                                            required
                                            placeholder="Describe your return and replacement policy"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 space-y-6">
                                    <h3 className="text-lg font-semibold">Verification</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="aadhaarNumber">Aadhaar Number (Optional)</Label>
                                            <Input
                                                id="aadhaarNumber"
                                                name="aadhaarNumber"
                                                value={formData.aadhaarNumber}
                                                onChange={handleChange}
                                                pattern="[0-9]{12}"
                                                placeholder="12-digit Aadhaar number"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Upload Aadhaar (Optional)</Label>
                                            {formData.aadhaarUpload?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.aadhaarUpload.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('aadhaarUpload')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    {formData.aadhaarUpload.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                        <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                            <Image
                                                                src={formData.aadhaarUpload.url}
                                                                alt="Aadhaar Upload"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'aadhaarUpload')}
                                                        disabled={uploading === 'aadhaarUpload'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'aadhaarUpload' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Authorized Person Photo *</Label>
                                            {formData.authorizedPersonPhoto?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.authorizedPersonPhoto.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('authorizedPersonPhoto')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                        <Image
                                                            src={formData.authorizedPersonPhoto.url}
                                                            alt="Authorized Person Photo"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'authorizedPersonPhoto')}
                                                        required={!formData.authorizedPersonPhoto}
                                                        disabled={uploading === 'authorizedPersonPhoto'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'authorizedPersonPhoto' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 6: Other Details & Submission */}
                        {currentSection === 6 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Other Details</h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="referredBy">Referred By (Optional)</Label>
                                        <Input
                                            id="referredBy"
                                            name="referredBy"
                                            value={formData.referredBy}
                                            onChange={handleChange}
                                            placeholder="Name of the person who referred you"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="additionalNotes">Additional Notes</Label>
                                        <Textarea
                                            id="additionalNotes"
                                            name="additionalNotes"
                                            value={formData.additionalNotes}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Any additional information you'd like to share"
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="terms" required />
                                            <Label htmlFor="terms">
                                                I hereby declare that the information provided is true and correct to the best of my knowledge.
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="privacy" required />
                                            <Label htmlFor="privacy">
                                                I agree to the Terms & Conditions and Privacy Policy of Rishikesh HandMade.
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevSection}
                                disabled={currentSection === 1}
                            >
                                Previous
                            </Button>

                            {currentSection < totalSections ? (
                                <Button
                                    type="button"
                                    onClick={nextSection}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : 'Submit Application'}
                                </Button>
                            )}
                        </div>

                        {/* Progress Indicator */}
                        <div className="text-center text-sm text-muted-foreground">
                            Step {currentSection} of {totalSections}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default BecomePartner;