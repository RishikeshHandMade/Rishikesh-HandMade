'use client';
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, EyeOff, Edit, Save, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const PartnerLoginDetails = ({ approvedVendor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({
    partnerUsername: '',
    partnerPassword: ''
  });
  const [showPassword, setShowPassword] = useState({});
  // Ensure approvedVendor is an array
  const safeApprovedVendor = Array.isArray(approvedVendor) ? approvedVendor : [];

  const [partners, setPartners] = useState(safeApprovedVendor);

  // Update partners when approvedVendor changes
  useEffect(() => {
    if (Array.isArray(approvedVendor)) {
      setPartners(approvedVendor);
    }
  }, [approvedVendor]);

  const filteredPartners = safeApprovedVendor.filter(partner =>
    partner?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner?.partnerUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleStatusChange = async (id, isActive) => {
    try {
      // Update local state optimistically
      const updatedPartners = partners.map(partner =>
        partner._id === id
          ? { ...partner, isActive }
          : partner
      );
      setPartners(updatedPartners);

      // Make API call to update status
      const response = await fetch('/api/becomePartner', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isActive,
          // We're not sending status here as the backend will handle it based on isActive
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update status');
      }

      // Update the partners state with the server response
      setPartners(prevPartners =>
        prevPartners.map(partner =>
          partner._id === responseData._id ? responseData : partner
        )
      );

    } catch (error) {
      console.error('Error updating status:', error);
      // Revert the local state on error
      if (Array.isArray(approvedVendor)) {
        setPartners(approvedVendor);
      } else {
        // If approvedVendor is not an array, refetch the data
        try {
          const res = await fetch('/api/becomePartner/isApproved');
          if (res.ok) {
            const data = await res.json();
            setPartners(data);
          }
        } catch (fetchError) {
          console.error('Failed to refetch partners:', fetchError);
        }
      }
      // Show error message to user
      alert(`Failed to update status: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by business name or username..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Partners Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner, index) => (
                <TableRow key={partner._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{partner.businessName}</TableCell>

                  {/* Username */}
                  <TableCell>
                    {editingId === partner._id ? (
                      <Input
                        type="text"
                        value={editedData.partnerUsername || ''}
                        onChange={(e) => setEditedData({ ...editedData, partnerUsername: e.target.value })}
                        className="h-8"
                      />
                    ) : (
                      partner.partnerUsername
                    )}
                  </TableCell>

                  {/* Password */}
                  <TableCell>
                    {editingId === partner._id ? (
                      <div className="relative">
                        <Input
                          type={showPassword[partner._id] ? 'text' : 'password'}
                          value={editedData.partnerPassword || ''}
                          onChange={(e) => setEditedData({ ...editedData, partnerPassword: e.target.value })}
                          className="h-8 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(prev => ({
                            ...prev,
                            [partner._id]: !prev[partner._id]
                          }))}
                        >
                          {showPassword[partner._id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>{showPassword[partner._id] ? partner.partnerPassword : '••••••••'}</span>
                        <button
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(prev => ({
                            ...prev,
                            [partner._id]: !prev[partner._id]
                          }))}
                        >
                          {showPassword[partner._id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`status-${partner._id}`}
                        checked={partner.isActive}
                        onCheckedChange={(checked) => handleStatusChange(partner._id, checked)}
                      />
                      <Label htmlFor={`status-${partner._id}`} className="cursor-pointer">
                        {partner.isActive ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No partner accounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PartnerLoginDetails;