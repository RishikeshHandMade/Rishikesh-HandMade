'use client';
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, EyeOff, Edit, Save, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const PartnerLoginDetails = ({ partnerDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [partners, setPartners] = useState([]);

  const filteredPartners = partners.filter(partner => 
    partner.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleStatusChange = async (id, isActive) => {
    try {
      // Here you would typically make an API call to update the status
      // For now, we'll just update the local state
      setPartners(partners.map(partner => 
        partner._id === id 
          ? { ...partner, isActive } 
          : partner
      ));
    } catch (error) {
      console.error('Error updating status:', error);
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
                        value={editedData.username || ''}
                        onChange={(e) => setEditedData({...editedData, username: e.target.value})}
                        className="h-8"
                      />
                    ) : (
                      partner.username
                    )}
                  </TableCell>
                  
                  {/* Password */}
                  <TableCell>
                    {editingId === partner._id ? (
                      <div className="relative">
                        <Input
                          type="password"
                          value={editedData.password || ''}
                          onChange={(e) => setEditedData({...editedData, password: e.target.value})}
                          className="h-8 pr-10"
                        />
                        <button 
                          type="button" 
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const input = document.querySelector(`#password-${partner._id}`);
                            if (input) {
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>••••••••</span>
                        <button 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const input = document.querySelector(`#password-${partner._id}`);
                            if (input) {
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <input 
                      id={`password-${partner._id}`}
                      type="password" 
                      value={partner.password} 
                      readOnly 
                      className="hidden" 
                    />
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