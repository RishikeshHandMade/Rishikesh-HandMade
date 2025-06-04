"use client";
import React, { useState, useEffect } from 'react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "../ui/table";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from 'react-hot-toast';
import { Input } from "../ui/input";
import { Label } from "../ui/label";


const CategoryTag = ({ productData, productId }) => {
  // ...existing state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  // Tag creation state
  const [tags, setTags] = useState([]); // All tag options (suggestions)
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags for current product

  const [newTagInput, setNewTagInput] = useState("");

  // Table state
  const [categoryRows, setCategoryRows] = useState([]); // [{ product, productName, tags, categoryTagId }]
  const [editRow, setEditRow] = useState(null); // { product, tags, categoryTagId }

  const [productTitle, setProductTitle] = useState("")
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
  // Fetch all products and all tags on mount
  useEffect(() => {
    fetchCategoryRows();
    // Fetch all tags from Tag model
    fetch("/api/productTag")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.tags)) {
          setTags(data.tags.map(tag => tag.name));
        }
      });
  }, []);
  // Tag input and add logic with suggestions
  const handleTagInputChange = (e) => {
    setNewTagInput(e.target.value);
  };
  const handleAddTag = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) {
      // No error toast, input is not required for form submission
      return;
    }
    if (selectedTags.includes(trimmed)) {
      toast.error("Tag already selected.");
      setNewTagInput("");
      return;
    }
    if (tags.includes(trimmed)) {
      // Tag already exists in dropdown, just add to selectedTags
      setSelectedTags([...selectedTags, trimmed]);
      setNewTagInput("");
      toast.success("Tag added to selection!");
      return;
    }
    // If tag does not exist, create it via API
    try {
      const res = await fetch("/api/productTag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create tag.");
        return;
      } else {
        toast.success("Tag created!");
      }
      // Always re-fetch tags after adding
      const tagsRes = await fetch("/api/productTag");
      const tagsData = await tagsRes.json();
      if (tagsData && Array.isArray(tagsData.tags)) {
        setTags(tagsData.tags.map(tag => tag.name));
      }
      setSelectedTags([...selectedTags, trimmed]);
      setNewTagInput("");
    } catch (err) {
      toast.error("API error while creating tag");
    }
  };
  // Show suggestions for tag input
  const tagSuggestions = tags.filter(tag =>
    newTagInput && tag.toLowerCase().includes(newTagInput.toLowerCase()) && !selectedTags.includes(tag)
  );
  
  // Fetch all category tags and products for the table
  const fetchCategoryRows = async () => {
    try {
      const productsRes = await fetch("/api/product");
      const products = await productsRes.json();
      if (!Array.isArray(products)) return;
      // For each product, fetch its category tag
      const rows = await Promise.all(products.map(async (p) => {
        let tags = [];
        let categoryTagId = null;
        try {
          const catRes = await fetch(`/api/productCategory?product=${p._id}`);
          const catJson = await catRes.json();
          if (catJson?.data && catJson.data.tags) {
            tags = catJson.data.tags;
            categoryTagId = catJson.data._id;
          }
        } catch { }
        return {
          product: p._id,
          productName: p.title,
          tags,
          categoryTagId
        };
      }));
      setCategoryRows(rows);
    } catch { }
  };

  useEffect(() => {
    fetchCategoryRows();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTags.length) {
      toast.error("Please add at least one tag.");
      return;
    }
    console.log(selectedTags)
    // If editing, PATCH; else POST
    try {
      let res;
      // Always use productId prop if present, else selectedProduct
      const productToSend = productId || selectedProduct;
      if (editRow && editRow.categoryTagId) {
        res = await fetch("/api/productCategory", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: productToSend, tags: selectedTags })
        });
      } else {
        res = await fetch("/api/productCategory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: productToSend, tags: selectedTags }),

        });
      }
      const json = await res.json();
      if (res.ok) {
        toast.success(editRow ? "Category updated!" : "Category created!");
        await fetchCategoryRows();
        setSelectedTags([]);
        setTags([]);
        setEditRow(null);
        setSelectedProduct("");
      } else {
        toast.error(json.error || "Error saving category");
      }
    } catch (err) {
      toast.error("API error");
    }
  };

  // Edit handler
  const handleEdit = (row) => {
    setEditRow(row);
    setSelectedProduct(row.product);
    setSelectedTags(row.tags);
  };
  // Delete handler
  const handleDelete = async (row) => {
    try {
      const res = await fetch("/api/productCategory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: row.product, tag: "__all__" })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Category deleted!");
        await fetchCategoryRows();
      } else {
        toast.error(json.error || "Delete failed");
      }
    } catch {
      toast.error("API error");
    }
  };


  return (
    <form className="page-content" onSubmit={handleSubmit}>
      {/* If in edit mode, show a banner and Cancel button */}
      <div className="container-fluid">
        <div className="row justify-content-center ">
          <div className="col-12 col-md-12 col-lg-12 bg-gray-100">
            <h3 className="my-4 text-center">Category Tag</h3>
            <div className="card my-2">
              <div className="card-body px-4 py-2">
                <div className="mb-6 flex flex-col items-center justify-center">
                  <Label className="font-bold mb-2 text-center">Product Name</Label>
                  <Input
                    className="mb-4 w-80 font-black text-center border-gray-300"
                    value={productName}
                    disabled
                    readOnly
                    placeholder={productName ? "Product Name" : "Product Name not found"}
                    style={productName ? {} : { border: '2px solid red', color: 'red' }}
                  />
                  {!productName && (
                    <div style={{ color: 'red', marginTop: '4px', fontWeight: 'bold' }}>
                      Product name not found! Please check if the product was created successfully.
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 mb-4 items-center justify-center">
                  <label className="font-bold text-center">Tags</label>
                  <div className="flex flex-row gap-2 items-center justify-center mb-4">
                    {/* Select dropdown for existing tags */}
                    <select
                      className="border p-2 rounded w-48"
                      value=""
                      onChange={e => {
                        const val = e.target.value;
                        if (
                          val &&
                          !selectedTags.includes(val)
                        ) {
                          setSelectedTags([...selectedTags, val]);
                        }
                      }}
                    >
                      <option value="" disabled>Select tag</option>
                      {tags.map((tag, idx) => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    {/* Input for new tag */}
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={handleTagInputChange}
                      className="border p-2 rounded w-48"
                      placeholder="Add new tag"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      autoComplete="off"
                    />
                    <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleAddTag}>
                      Add
                    </button>                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selectedTags.map((tag, idx) => (
                      <span key={tag} className="bg-gray-200 px-2 py-1 rounded-full flex items-center">
                        {tag}
                        <button type="button" className="ml-2 text-red-500" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Submit button: label changes depending on edit mode */}
                  {editRow ? (
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Update</button>
                      <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => {
                        setEditRow(null);
                        setSelectedTags([]);
                        setSelectedProduct("");
                      }}>Cancel</button>
                    </div>
                  ) : (
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-4 w-48 ">Create</button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Category Tag Table */}

          <div className="mt-8">
            <h4 className="mb-2 font-bold text-center">All Product Categories</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category Tags</TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryRows.length > 0 ? (
                  categoryRows.map((row, idx) => (
                    <TableRow key={row.product}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {row.tags.map(tag => (
                            <span key={tag} style={{ background: '#eee', padding: '6px', border: '1px solid #ccc', borderRadius: 12 }}>{tag}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" type="button" onClick={() => handleEdit(row)}>Edit</Button>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" type="button" onClick={() => { setShowDeleteDialog(true); setRowToDelete(row); }}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">No categories found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this category tag?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (rowToDelete) await handleDelete(rowToDelete);
              setShowDeleteDialog(false);
              setRowToDelete(null);
            }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default CategoryTag;
