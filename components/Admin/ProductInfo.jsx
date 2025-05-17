"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const ProductInfo = ({ productData, productId }) => {
  const [overview, setOverview] = useState("");
  const productTitle = productData?.title || "";

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !overview) {
      alert('Please provide an overview and valid product.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/productInfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, overview })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to save product info');
      } else {
        alert('Product info saved successfully!');
        setOverview("");
      }
    } catch (err) {
      alert('Error saving product info.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className="page-content" onSubmit={handleSubmit}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <h3 className="my-4 text-center">Product Info</h3>
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
                  <label className="form-label">Product Over View Description</label>
                  <Textarea className="form-control" rows={4} value={overview} onChange={e => setOverview(e.target.value)} />
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

export default ProductInfo;
