"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";



export default function EditArtisan({ artisan }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [artisanToDelete, setArtisanToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const handleDeleteClick = (artisan) => {
    setArtisanToDelete(artisan);
    setShowDeleteModal(true);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/createArtisan');
      if (!res.ok) throw new Error('Failed to fetch artisans');
      const data = await res.json();
      console.log(data)
      setUsers(data);
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      toast.error("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!artisanToDelete) return;
    try {
      setLoading(true)
      const res = await fetch("/api/createArtisan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: artisanToDelete._id, imageKey: artisanToDelete.profileImage?.key || undefined })
      });
      if (!res.ok) throw new Error("Failed to delete artisan");
      toast.success("Artisan deleted successfully");
      if (onDeleted) onDeleted(artisanToDelete._id);
    } catch (err) {
      toast.error("Failed to delete artisan");
    } finally {
      setShowDeleteModal(false);
      setArtisanToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setArtisanToDelete(null);
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white shadow-lg rounded-xl p-6 mt-6 w-full overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-4 py-3">S.No.</TableHead>
              <TableHead className="px-4 py-3">Artisan Name</TableHead>
              <TableHead className="px-4 py-3">Artisan Number</TableHead>
              <TableHead className="px-4 py-3">Edit Info</TableHead>
              <TableHead className="px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">Loading...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">No artisans found.</TableCell>
              </TableRow>
            ) : (
              users.map((artisan, idx) => (
                <TableRow key={artisan._id} className="hover:bg-gray-200 transition">
                  <TableCell className="px-4 py-3 font-medium">{idx + 1}</TableCell>
                  <TableCell className="px-4 py-3">{artisan.firstName} {artisan.lastName}</TableCell>
                  <TableCell className="px-4 py-3">{artisan.artisanNumber}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem(`artisan_${artisan._id}`, JSON.stringify(artisan));
                        }
                        router.push(`/admin/artisan/${artisan._id}`);
                      }}
                    >
                      Edit Info
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-3 space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onView && onView(artisan)}>View</Button>
                    <Button size="sm" variant="secondary" onClick={() => onEdit && onEdit(artisan)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(artisan)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artisan</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this artisan?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
