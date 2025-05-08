"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import toast from "react-hot-toast";
import { Calendar, Mail, MessageSquare, ScanSearch, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const ComingSoonEnquiries = () => {
    const [allEnquiry, setAllEnquiry] = useState([]);
    const [filteredEnquiry, setFilteredEnquiry] = useState([]);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const itemsPerPage = 10;
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Group by month
    const groupByMonth = (enquiries) => {
        const months = {};
        enquiries.forEach(enquiry => {
            const date = new Date(enquiry.createdAt);
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            if (!months[monthYear]) {
                months[monthYear] = [];
            }
            months[monthYear].push(enquiry);
        });
        return months;
    };
    const monthGroups = groupByMonth(allEnquiry);

    useEffect(() => {
        const fetchEnquiries = async () => {
            try {
                const response = await fetch("/api/comingSoonEnquiry");
                const data = await response.json();
                console.log(data)
                if (Array.isArray(data)) {
                    setAllEnquiry(data);
                    setFilteredEnquiry(data);
                } else if (data && data.error) {
                    toast.error("Failed to fetch enquiries: " + data.error, { style: { borderRadius: "10px", border: "2px solid red" } });
                    setAllEnquiry([]);
                    setFilteredEnquiry([]);
                } else {
                    toast.error("Unexpected response from server", { style: { borderRadius: "10px", border: "2px solid red" } });
                    setAllEnquiry([]);
                    setFilteredEnquiry([]);
                }
            } catch (error) {
                toast.error("Something went wrong", { style: { borderRadius: "10px", border: "2px solid red" } });
                setAllEnquiry([]);
                setFilteredEnquiry([]);
            }
        };
        fetchEnquiries();
    }, []);

    useEffect(() => {
        if (selectedMonth === 'all') {
            setFilteredEnquiry(allEnquiry);
            setCurrentPage(1);
        } else {
            const filtered = monthGroups[selectedMonth] || [];
            setFilteredEnquiry(filtered);
            setCurrentPage(1);
        }
    }, [selectedMonth, allEnquiry]);

    // Pagination
    const totalPages = Math.ceil(filteredEnquiry.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEnquiry.slice(indexOfFirstItem, indexOfLastItem);

    const handleView = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setIsOpen(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDelete = async (id, dialog = false) => {
        setLoadingDelete(true);
        try {
            const response = await fetch("/api/comingSoonEnquiry", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (!response.ok) {
                toast.error("Failed to delete enquiry", { style: { borderRadius: "10px", border: "2px solid red" } });
                setLoadingDelete(false);
                return;
            }
            toast.success("Enquiry deleted successfully", { style: { borderRadius: "10px", border: "2px solid green" } });
            setAllEnquiry(allEnquiry.filter((enquiry) => enquiry._id !== id));
            setFilteredEnquiry(filteredEnquiry.filter((enquiry) => enquiry._id !== id));
            if (dialog) setIsOpen(false);
        } catch (error) {
            toast.error("Something went wrong", { style: { borderRadius: "10px", border: "2px solid red" } });
        }
        setLoadingDelete(false);
    };

    return (
        <div className="my-20 font-barlow w-full max-w-7xl mx-auto flex flex-col gap-8 items-center justify-center bg-blue-100 p-4 rounded-lg">
            {/* Month Filter */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">Coming Soon Package Enquiries</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm">Filter by month:</span>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border rounded-md px-3 py-1 text-sm"
                    >
                        <option value="all">All Months</option>
                        {Object.keys(monthGroups).map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Table className="w-full mx-auto">
                <TableHeader>
                    <TableRow className={"border-blue-600"}>
                        <TableHead className="w-[150px]">Date</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Travel Date</TableHead>
                        <TableHead className="w-[120px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.length > 0 ? currentItems.map((enquiry) => (
                        <TableRow key={enquiry._id} className="border-blue-400">
                            <TableCell>{new Date(enquiry.createdAt).toLocaleDateString('en-In', { day: 'numeric', month: 'long', year: 'numeric', })}</TableCell>
                            <TableCell>{enquiry.packageId?.title || '-'}</TableCell>
                            <TableCell>{enquiry.firstName + " " + enquiry.lastName}</TableCell>
                            <TableCell>+91 {enquiry.phone}</TableCell>
                            <TableCell>{enquiry.email}</TableCell>
                            <TableCell>{enquiry.travelDate ? new Date(enquiry.travelDate).toLocaleDateString('en-In', { day: 'numeric', month: 'long', year: 'numeric', }) : '-'}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleView(enquiry)} variant="outline" size="sm" className="h-8 flex-1">
                                        <ScanSearch className="w-3 h-3 mr-1" /> View
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(enquiry._id)}
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 flex-1"
                                        disabled={loadingDelete}
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No coming soon enquiries found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {filteredEnquiry.length > itemsPerPage && (
                <div className="flex items-center justify-center gap-4 font-barlow">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 p-0 ${currentPage === page ? "bg-blue-600 text-white" : "text-blue-600"}`}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Enquiry Details Dialog */}
            {isOpen && selectedEnquiry && (
                <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
                    <DialogContent
                        style={{
                            maxHeight: "90vh",
                            overflowY: "auto",
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            margin: 0,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                            background: "#fff",
                            borderRadius: "16px",
                            zIndex: 50,
                            minWidth: "320px"
                        }}
                        className="max-w-[95vw] font-barlow text-justify sm:max-w-lg md:max-w-2xl p-0 overflow-hidden"
                    >
              
                        <DialogHeader>
                            <DialogTitle className="hidden" />
                        </DialogHeader>
                        <div className="pt-4 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold">{selectedEnquiry.firstName + " " + selectedEnquiry.lastName}</h2>
                                        <div className="flex items-center gap-2 text-gray-600 pt-5">
                                            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">{selectedEnquiry.email}</span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="bg-blue-50 mr-8 text-blue-700 border-blue-200 flex items-center gap-1 text-xs w-fit"
                                    >
                                        <Calendar className="w-3 h-3" />
                                        {new Date(selectedEnquiry.createdAt).toLocaleDateString('en-In', { day: 'numeric', month: 'long', year: 'numeric', })}
                                    </Badge>
                                </div>
                            </div>
                            <Separator className="my-4 sm:my-6" />
                            <div className="mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    Package
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700">{selectedEnquiry.packageId?.title || '-'}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    Travel Date
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700">{selectedEnquiry.travelDate ? new Date(selectedEnquiry.travelDate).toLocaleDateString('en-In', { day: 'numeric', month: 'long', year: 'numeric', }) : '-'}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    Address
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700">{selectedEnquiry.address}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    Counts (Adults/Children/Infants)
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700">{selectedEnquiry.adults} / {selectedEnquiry.children} / {selectedEnquiry.infants}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    Start From
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700">{selectedEnquiry.startFrom}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    Which Location
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700">{selectedEnquiry.whichLocation}</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button variant="outline" onClick={() => setIsOpen(false)} className="sm:order-1 w-full sm:w-auto">
                                Close
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(selectedEnquiry._id, true)}
                                className="w-full sm:w-auto"
                                disabled={loadingDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ComingSoonEnquiries;
