'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, CheckCircle, XCircle, Download } from 'lucide-react';
import { FileText, Building2, User, MapPin, Banknote } from 'lucide-react';
// Helper component for consistent info rows
function InfoRow({ label, value }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500 font-medium">{label}:</span>
            <span className="col-span-2">{value}</span>
        </div>
    );
}


function DocumentLink({ url, label }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
            <FileText className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
            <Download className="h-4 w-4 text-blue-600" />
        </a>
    );
}
const BecomePartner = ({ partnerDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    if (!partnerDetails) {
        return <div className="text-center py-8">Loading partner applications...</div>;
    }

    const filteredPartners = partnerDetails.filter(partner => {
        const matchesSearch =
            partner.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.mobile?.includes(searchTerm) ||
            partner.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.panNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleView = (partner) => {
        setSelectedPartner(partner);
        setIsViewOpen(true);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch('/api/becomePartner', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Refresh the data
            window.location.reload();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by business name, mobile, or GST..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Partner Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>GST Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPartners.length > 0 ? (
                            filteredPartners.map((partner, index) => (
                                <TableRow key={partner._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{partner.businessName}</TableCell>
                                    <TableCell>{partner.mobile}</TableCell>
                                    <TableCell>{partner.gstNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${partner.status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : partner.status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {partner.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleView(partner)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" /> View
                                        </Button>
                                        {partner.status !== 'approved' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleStatusChange(partner._id, 'approved')}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                            </Button>
                                        )}
                                        {partner.status !== 'rejected' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleStatusChange(partner._id, 'rejected')}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" /> Reject
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No partner applications found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Modal */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedPartner && (
                        <div className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-gray-800">Partner Application Details</DialogTitle>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Status:</span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedPartner.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : selectedPartner.status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedPartner.status.charAt(0).toUpperCase() + selectedPartner.status.slice(1)}
                                    </span>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Business Information */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                        <Building2 className="h-5 w-5 inline-block mr-2 text-blue-600" />
                                        Business Information
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <InfoRow label="Business Name" value={selectedPartner.businessName} />
                                        <InfoRow label="Business Type" value={selectedPartner.businessType} />
                                        <InfoRow label="Industry" value={selectedPartner.industryCategory} />
                                        <InfoRow label="Year Established" value={selectedPartner.yearOfEstablishment} />
                                        <InfoRow label="Legal Structure" value={selectedPartner.legalStructure} />
                                        <InfoRow
                                            label="GST Registered"
                                            value={selectedPartner.isGstRegistered ? 'Yes' : 'No'}
                                        />
                                        {selectedPartner.isGstRegistered && (
                                            <InfoRow label="GST Number" value={selectedPartner.gstNumber} />
                                        )}
                                        <InfoRow label="PAN Number" value={selectedPartner.panNumber} />
                                        <InfoRow label="MSME Number" value={selectedPartner.msmeNumber || 'N/A'} />
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                        <User className="h-5 w-5 inline-block mr-2 text-blue-600" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <InfoRow label="Contact Person" value={selectedPartner.contactPerson} />
                                        <InfoRow label="Designation" value={selectedPartner.designation} />
                                        <InfoRow label="Mobile" value={selectedPartner.mobile} />
                                        <InfoRow label="Alternate Mobile" value={selectedPartner.alternateMobile || 'N/A'} />
                                        <InfoRow label="Email" value={selectedPartner.email} />
                                        <InfoRow label="WhatsApp" value={selectedPartner.whatsappNumber || 'N/A'} />
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4 pb-2 border-b border-gray-200">
                                        <MapPin className="h-5 w-5 inline-block mr-2 text-blue-600" />
                                        Address
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p>{selectedPartner.address}</p>
                                        <p>{selectedPartner.city}, {selectedPartner.state}</p>
                                        <p>{selectedPartner.pincode}, {selectedPartner.country}</p>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                        <Banknote className="h-5 w-5 inline-block mr-2 text-blue-600" />
                                        Bank Details
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-700">
                                        <InfoRow label="Bank Name" value={selectedPartner.bankName} />
                                        <InfoRow label="Account Holder" value={selectedPartner.accountHolderName} />
                                        <InfoRow label="Account Number" value={selectedPartner.accountNumber} />
                                        <InfoRow label="IFSC Code" value={selectedPartner.ifscCode} />
                                        <InfoRow label="Branch" value={selectedPartner.branch} />
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                        <FileText className="h-5 w-5 inline-block mr-2 text-blue-600" />
                                        Documents
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedPartner.productCatalog?.url && (
                                            <DocumentLink
                                                url={selectedPartner.productCatalog.url}
                                                label="Product Catalog"
                                            />
                                        )}
                                        {selectedPartner.panCard?.url && (
                                            <DocumentLink
                                                url={selectedPartner.panCard.url}
                                                label="PAN Card"
                                            />
                                        )}
                                        {selectedPartner.aadhaarUpload?.url && (
                                            <DocumentLink
                                                url={selectedPartner.aadhaarUpload.url}
                                                label="Aadhaar Card"
                                            />
                                        )}
                                        {selectedPartner.authorizedPersonPhoto?.url && (
                                            <DocumentLink
                                                url={selectedPartner.authorizedPersonPhoto.url}
                                                label="Authorized Person Photo"
                                            />
                                        )}
                                        {selectedPartner.businessCard?.url && (
                                            <DocumentLink
                                                url={selectedPartner.businessCard.url}
                                                label="Business Card"
                                            />
                                        )}
                                        {selectedPartner.cancelledCheque?.url && (
                                            <DocumentLink
                                                url={selectedPartner.cancelledCheque.url}
                                                label="Cancelled Cheque"
                                            />
                                        )}
                                        {selectedPartner.gstCertificate?.url && (
                                            <DocumentLink
                                                url={selectedPartner.gstCertificate.url}
                                                label="GST Certificate"
                                            />
                                        )}
                                        {selectedPartner.msmeCertificate?.url && (
                                            <DocumentLink
                                                url={selectedPartner.msmeCertificate.url}
                                                label="MSME Certificate"
                                            />
                                        )}
                                        {/* Add more document links as needed */}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsViewOpen(false)}
                                    className="min-w-[120px]"
                                >
                                    Close
                                </Button>
                                <Button
                                    variant={selectedPartner.status === 'rejected' ? 'outline' : 'destructive'}
                                    onClick={() => {
                                        handleStatusChange(selectedPartner._id, selectedPartner.status === 'rejected' ? 'pending' : 'rejected');
                                        setIsViewOpen(false);
                                    }}
                                    className="min-w-[120px]"
                                >
                                    {selectedPartner.status === 'rejected' ? 'Mark as Pending' : 'Reject'}
                                </Button>
                                {selectedPartner.status !== 'approved' && (
                                    <Button
                                        onClick={() => {
                                            handleStatusChange(selectedPartner._id, 'approved');
                                            setIsViewOpen(false);
                                        }}
                                        className="min-w-[120px] bg-green-600 hover:bg-green-700"
                                    >
                                        Approve
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default BecomePartner;