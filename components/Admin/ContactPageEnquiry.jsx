'use client'

import { useEffect, useState } from "react";
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import toast from "react-hot-toast";
import { Calendar, Mail, MessageSquare, ScanSearch, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const ContactPageEnquiry = () => {
    const [allEnquiry, setAllEnquiry] = useState([])
    const [filteredEnquiry, setFilteredEnquiry] = useState([])
    const [selectedEnquiry, setSelectedEnquiry] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedMonth, setSelectedMonth] = useState('all')
    const itemsPerPage = 10

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch("/api/admin/getContacts")
                const data = await response.json()
                setAllEnquiry(data.contacts)
                setFilteredEnquiry(data.contacts)
            } catch (error) {
                toast.error("Something went wrong", { style: { borderRadius: "10px", border: "2px solid red" } })
            }
        }

        fetchContacts()
    }, [])

    // Group enquiries by month
    const groupByMonth = (enquiries) => {
        const months = {}
        enquiries.forEach(enquiry => {
            const date = new Date(enquiry.createdAt)
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
            if (!months[monthYear]) {
                months[monthYear] = []
            }
            months[monthYear].push(enquiry)
        })
        return months
    }

    const monthGroups = groupByMonth(allEnquiry)

    // Filter enquiries by selected month
    useEffect(() => {
        if (selectedMonth === 'all') {
            setFilteredEnquiry(allEnquiry)
            setCurrentPage(1)
        } else {
            const filtered = monthGroups[selectedMonth] || []
            setFilteredEnquiry(filtered)
            setCurrentPage(1)
        }
    }, [selectedMonth, allEnquiry])

    // Pagination logic
    const totalPages = Math.ceil(filteredEnquiry.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredEnquiry.slice(indexOfFirstItem, indexOfLastItem)

    const handleView = (enquiry) => {
        setSelectedEnquiry(enquiry)
        setIsOpen(true)
    }

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/admin/getContacts`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })

            if (!response.ok) {
                toast.error("Failed to delete contact enquiry", { style: { borderRadius: "10px", border: "2px solid red" } })
                return
            }
            
            toast.success("Enquiry deleted successfully", { style: { borderRadius: "10px", border: "2px solid green" } })
            setAllEnquiry(allEnquiry.filter((enquiry) => enquiry._id !== id))
        } catch (error) {
            toast.error("Something went wrong", { style: { borderRadius: "10px", border: "2px solid red" } })
        }
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    return (
        <div className="my-20 font-barlow w-full max-w-7xl mx-auto flex flex-col gap-8 items-center justify-center bg-blue-100 p-4 rounded-lg">
            {/* Month Filter */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">Contact Enquiries</h2>
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
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="w-[200px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.length > 0 ? currentItems.map((enquiry) => (
                        <TableRow key={enquiry._id} className="border-blue-400">
                            <TableCell>{new Date(enquiry.createdAt).toLocaleDateString('en-In', { day: 'numeric', month: 'long', year: 'numeric', })}</TableCell>
                            <TableCell>{enquiry.name}</TableCell>
                            <TableCell>+91 {enquiry.phone}</TableCell>
                            <TableCell>{enquiry.email}</TableCell>
                            <TableCell>{enquiry.subject}</TableCell>
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
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No contact enquiries found
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
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
                    <DialogContent className="max-w-[95vw]  font-barlow text-justify sm:max-w-lg md:max-w-2xl p-0 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="hidden" />
                        </DialogHeader>
                        <div className="pt-4 sm:pt-4 px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold">{selectedEnquiry.name}</h2>
                                        <div className="flex items-center gap-2 text-gray-600">
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
                                    Subject
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700">{selectedEnquiry.subject}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    Message
                                </h3>
                                <div className="mt-1 sm:mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="italic text-sm sm:text-base text-gray-700 max-h-96 overflow-y-auto">{selectedEnquiry.message}</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button variant="outline" onClick={() => setIsOpen(false)} className="sm:order-1 w-full sm:w-auto">
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default ContactPageEnquiry