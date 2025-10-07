"use client";
import React, { useState, useEffect } from 'react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "../ui/table";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from 'react-hot-toast';
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Trash } from 'lucide-react';

const ProductTagLine = ({ productData, productId }) => {
  // ...existing state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  // Tag creation state
  const [tags, setTags] = useState([]); // All tag options (suggestions)
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags for current product

  const [newTagInput, setNewTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  // Table state
  const [categoryRows, setCategoryRows] = useState([]); // [{ product, productName, tags, categoryTagId }]
  const [editRow, setEditRow] = useState(null); // { product, tags, categoryTagId }
  //   console.log(categoryRows)
  const [productTitle, setProductTitle] = useState("")
  const [highlights, setHighlights] = useState(['']);
  useEffect(() => {
    if (!productData && productId) {
      fetch(`/api/product/${productId}`)
        .then(async res => {
          if (!res.ok) {
            setProductTitle("");
            return;
          }
          const text = await res.text();
          if (!text) {
            setProductTitle("");
            return;
          }
          const data = JSON.parse(text);
          setProductTitle(data.title || "");
        })
        .catch(() => setProductTitle(""));
    }
  }, [productData, productId]);

  const productName = productData?.title || productTitle || "";
  // Fetch and populate form with existing highlights
  useEffect(() => {
    if (!productId) return;
    
    fetch(`/api/productTagLine?product=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.data) {
          // Set highlights from the API response
          if (data.data.highlights?.length > 0) {
            setHighlights(data.data.highlights);
          } else {
            // If no highlights exist, start with one empty field
            setHighlights(['']);
          }
          
          // Keep categoryRows for reference if needed
          setCategoryRows([{
            product: productId,
            productName: productData?.title || productTitle || "",
            highlights: data.data.highlights || [],
            categoryTagId: data.data._id
          }]);
        } else {
          // If no data exists, initialize with one empty field
          setHighlights(['']);
        }
      })
      .catch(error => {
        console.error('Error fetching highlights:', error);
        // Initialize with one empty field on error
        setHighlights(['']);
      });
  }, [productId, productData, productTitle]);

  const handleHighlightChange = (idx, value) => {
    setHighlights(prev => prev.map((h, i) => (i === idx ? value : h)));
  };

  const addHighlight = () => {
    setHighlights(prev => [...prev, '']);
  };

  const removeHighlight = idx => {
    setHighlights(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const productToSend = productId || selectedProduct;
    const highlightsToSend = highlights.filter(h => h.trim() !== '');
    
    if (!productToSend) {
      toast.error("Product is required.");
      return;
    }
    
    if (highlightsToSend.length === 0) {
      toast.error("At least one highlight is required.");
      return;
    }

    setLoading(true);
    try {
      const method = (categoryRows.length > 0 && categoryRows[0].categoryTagId) ? "PATCH" : "POST";
      const url = "/api/productTagLine";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          product: productToSend, 
          highlights: highlightsToSend
        })
      });
      
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success("Highlights saved successfully!");
        // Update local state with the saved highlights
        setHighlights(highlightsToSend);
        
        // Update categoryRows with the latest data
        setCategoryRows([{
          product: productToSend,
          productName: productData?.title || productTitle || "",
          highlights: highlightsToSend,
          categoryTagId: json.data?._id || (categoryRows[0]?.categoryTagId || null)
        }]);
        
      } else {
        throw new Error(json.error || "Failed to save highlights");
      }
    } catch (err) {
      console.error('Error saving highlights:', err);
      toast.error(err.message || "Error saving highlights");
    }
  };


  return (
    <form className="page-content" onSubmit={handleSubmit}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h3 className="text-lg font-semibold">Product Highlights</h3>
                <p className="text-sm text-gray-500">
                  {productName || 'No product selected'}
                </p>
              </div>
              
              <div className="card-body p-4">
                {!productName ? (
                  <div className="text-red-600 font-medium p-3 bg-red-50 rounded-md mb-4">
                    Product name not found! Please check if the product was created successfully.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        Highlights
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      
                      <div className="space-y-2">
                        {highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={highlight}
                              onChange={e => handleHighlightChange(idx, e.target.value)}
                              placeholder={`Enter highlight #${idx + 1}`}
                              className="flex-1"
                              disabled={loading}
                            />
                            {highlights.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeHighlight(idx)}
                                className="p-2 text-red-500 hover:text-red-700"
                                disabled={loading}
                                aria-label="Remove highlight"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={addHighlight}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          disabled={loading}
                        >
                          <span className="bg-blue-500 px-2 py-1 text-white">+ Add another highlight</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={loading || highlights.some(h => !h.trim())}
                      >
                        {loading ? 'Saving...' : 'Save Highlights'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductTagLine;
