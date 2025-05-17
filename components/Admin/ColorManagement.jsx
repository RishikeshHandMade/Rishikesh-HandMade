"use client";
import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const ColorManagement = () => {
  const [style1, setStyle1] = useState("style1");
  const [colorInputs, setColorInputs] = useState([""]);
  const [products, setProducts] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loadingArtisans, setLoadingArtisans] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);


  const handleColorInputChange = (idx, value) => {
    const updated = [...colorInputs];
    updated[idx] = value;
    setColorInputs(updated);
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement save logic here
    alert(`Saved! Artisan: ${selectedArtisan}, Product: ${selectedProduct}, Style: ${style1}, Colors: ${colorInputs.join(", ")}`);
  };

  return (
    <form className="page-content" onSubmit={handleSubmit}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-12 col-lg-12">
            <h3 className="my-3 text-center">Color Management</h3>
            <div className="card my-2">
              <div className="card-body px-4 py-2">
                <div className="mb-4">
                  <label className="font-semibold">Product Color Management Style</label>
                  <Select value={style1} onValueChange={setStyle1}>
                    <SelectTrigger className="w-full border-2 border-blue-600 bg-gray-200">
                      <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-blue-600 bg-gray-200">
                      <SelectGroup>
                        <SelectItem value="style1">Menu Style 1</SelectItem>
                        <SelectItem value="style2">Menu Style 2</SelectItem>
                        <SelectItem value="style3">Menu Style 3</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <label className="font-semibold">Product Color Management Style 2</label>
                  {colorInputs.map((color, idx) => (
                    <div className="d-flex mb-2" key={idx}>
                      <Input type="text" className="form-control" placeholder="Product Title" value={color} onChange={e => handleColorInputChange(idx, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Button type="submit" className="bg-red-500 px-5 py-2">
                    Data Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ColorManagement;
