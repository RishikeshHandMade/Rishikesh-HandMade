"use client";
import React, { useState } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
const ProductDescription = ({ productData, productId }) => {
  const [titleTag, setTitleTag] = useState("");
  const [description, setDescription] = useState("");
  const productTitle = productData?.title || "";

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !description) {
      alert('Please provide a description and valid product.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/productDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, description, titleTag })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to save description');
      } else {
        alert('Description saved successfully!');
        setDescription("");
        setTitleTag("");
      }
    } catch (err) {
      alert('Error saving description.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className="page-content" onSubmit={handleSubmit}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <h3 className="my-4 text-center">Product Description</h3>
            <div className="card my-2">
              <div className="card-body px-4 py-2">
                <div className="mb-4">
                  <label className="font-semibold">Product Name</label>
                  <Input
                    type="text"
                    className="form-control"
                    value={productTitle}
                    disabled
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Product Title Tag</label>
                  <div className="input-group">
                    <Input type="text" className="form-control" placeholder="Type Here:" value={titleTag} onChange={e => setTitleTag(e.target.value)} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Product Title Description</label>
                  <Textarea className="form-control" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="text-center">
                  <Button type="submit" className="bg-red-500 px-5">Data Save</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductDescription;
