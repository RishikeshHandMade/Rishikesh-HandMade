"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const VideoManagement = ({ productData, productId }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const productTitle = productData?.title || "";

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl || !productId) {
      alert('Please provide a video URL and valid product.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/productVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, videoUrl })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to save video');
      } else {
        alert('Video saved successfully!');
        setVideoUrl("");
      }
    } catch (err) {
      alert('Error saving video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="page-content" onSubmit={handleSubmit}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <h4 className="my-3 text-center">Video Management</h4>
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
                  <label className="form-label">Product Video URL</label>
                  <div className="input-group">
                    <Input type="text" className="form-control" placeholder="Youtube URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                  </div>
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

export default VideoManagement;
