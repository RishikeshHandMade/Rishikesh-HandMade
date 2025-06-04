"use client";
import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
const COLOR_LIST =
  [
    { "hex": "#FF0000", "name": "Red" },
    { "hex": "#00FF00", "name": "Green" },
    { "hex": "#0000FF", "name": "Blue" },
    { "hex": "#FFFF00", "name": "Yellow" },
    { "hex": "#FFA500", "name": "Orange" },
    { "hex": "#800080", "name": "Purple" },
    { "hex": "#FFC0CB", "name": "Pink" },
    { "hex": "#000000", "name": "Black" },
    { "hex": "#FFFFFF", "name": "White" },
    { "hex": "#808080", "name": "Gray" },
    { "hex": "#A52A2A", "name": "Brown" },
    { "hex": "#8B4513", "name": "Saddle Brown" },
    { "hex": "#D2B48C", "name": "Tan" },
    { "hex": "#FFD700", "name": "Gold" },
    { "hex": "#008080", "name": "Teal" },
    { "hex": "#00CED1", "name": "Dark Turquoise" },
    { "hex": "#4682B4", "name": "Steel Blue" },
    { "hex": "#000080", "name": "Navy" },
    { "hex": "#B22222", "name": "Firebrick" },
    { "hex": "#228B22", "name": "Forest Green" },
    { "hex": "#F5DEB3", "name": "Wheat" },
    { "hex": "#E9967A", "name": "Dark Salmon" },
    { "hex": "#C0C0C0", "name": "Silver" },
    { "hex": "#F0E68C", "name": "Khaki" },
    { "hex": "#BDB76B", "name": "Dark Khaki" },
    { "hex": "#DC143C", "name": "Crimson" },
    { "hex": "#F0F8FF", "name": "Aliceblue" },
    { "hex": "#FAEBD7", "name": "Antiquewhite" },
    { "hex": "#00FFFF", "name": "Aqua" },
    { "hex": "#7FFFD4", "name": "Aquamarine" },
    { "hex": "#F0FFFF", "name": "Azure" },
    { "hex": "#F5F5DC", "name": "Beige" },
    { "hex": "#FFE4C4", "name": "Bisque" },
    { "hex": "#FFEBCD", "name": "Blanchedalmond" },
    { "hex": "#8A2BE2", "name": "Blueviolet" },
    { "hex": "#DEB887", "name": "Burlywood" },
    { "hex": "#5F9EA0", "name": "Cadetblue" },
    { "hex": "#7FFF00", "name": "Chartreuse" },
    { "hex": "#D2691E", "name": "Chocolate" },
    { "hex": "#FF7F50", "name": "Coral" },
    { "hex": "#6495ED", "name": "Cornflowerblue" },
    { "hex": "#FFF8DC", "name": "Cornsilk" },
    { "hex": "#008B8B", "name": "Darkcyan" },
    { "hex": "#B8860B", "name": "Darkgoldenrod" },
    { "hex": "#A9A9A9", "name": "Darkgray" },
    { "hex": "#006400", "name": "Darkgreen" },
    { "hex": "#8B008B", "name": "Darkmagenta" },
    { "hex": "#556B2F", "name": "Darkolivegreen" },
    { "hex": "#FF8C00", "name": "Darkorange" },
    { "hex": "#9932CC", "name": "Darkorchid" },
    { "hex": "#8B0000", "name": "Darkred" },
    { "hex": "#8FBC8F", "name": "Darkseagreen" },
    { "hex": "#483D8B", "name": "Darkslateblue" },
    { "hex": "#2F4F4F", "name": "Darkslategray" },
    { "hex": "#9400D3", "name": "Darkviolet" },
    { "hex": "#FF1493", "name": "Deeppink" },
    { "hex": "#00BFFF", "name": "Deepskyblue" },
    { "hex": "#696969", "name": "Dimgray" },
    { "hex": "#1E90FF", "name": "Dodgerblue" },
    { "hex": "#FFFAF0", "name": "Floralwhite" },
    { "hex": "#FF00FF", "name": "Fuchsia" },
    { "hex": "#DCDCDC", "name": "Gainsboro" },
    { "hex": "#F8F8FF", "name": "Ghostwhite" },
    { "hex": "#DAA520", "name": "Goldenrod" },
    { "hex": "#ADFF2F", "name": "Greenyellow" },
    { "hex": "#F0FFF0", "name": "Honeydew" },
    { "hex": "#FF69B4", "name": "Hotpink" },
    { "hex": "#CD5C5C", "name": "Indianred" },
    { "hex": "#4B0082", "name": "Indigo" },
    { "hex": "#FFFFF0", "name": "Ivory" },
    { "hex": "#E6E6FA", "name": "Lavender" },
    { "hex": "#FFF0F5", "name": "Lavenderblush" },
    { "hex": "#7CFC00", "name": "Lawngreen" },
    { "hex": "#FFFACD", "name": "Lemonchiffon" },
    { "hex": "#ADD8E6", "name": "Lightblue" },
    { "hex": "#F08080", "name": "Lightcoral" },
    { "hex": "#E0FFFF", "name": "Lightcyan" },
    { "hex": "#D3D3D3", "name": "Lightgray" },
    { "hex": "#90EE90", "name": "Lightgreen" },
    { "hex": "#FFB6C1", "name": "Lightpink" },
    { "hex": "#FFA07A", "name": "Lightsalmon" },
    { "hex": "#20B2AA", "name": "Lightseagreen" },
    { "hex": "#87CEFA", "name": "Lightskyblue" },
    { "hex": "#778899", "name": "Lightslategray" },
    { "hex": "#B0C4DE", "name": "Lightsteelblue" },
    { "hex": "#FFFFE0", "name": "Lightyellow" },
    { "hex": "#32CD32", "name": "Limegreen" },
    { "hex": "#FAF0E6", "name": "Linen" },
    { "hex": "#800000", "name": "Maroon" },
    { "hex": "#66CDAA", "name": "Mediumaquamarine" },
    { "hex": "#0000CD", "name": "Mediumblue" },
    { "hex": "#BA55D3", "name": "Mediumorchid" },
    { "hex": "#9370DB", "name": "Mediumpurple" },
    { "hex": "#3CB371", "name": "Mediumseagreen" },
    { "hex": "#7B68EE", "name": "Mediumslateblue" },
    { "hex": "#00FA9A", "name": "Mediumspringgreen" },
    { "hex": "#48D1CC", "name": "Mediumturquoise" },
    { "hex": "#C71585", "name": "Mediumvioletred" },
    { "hex": "#191970", "name": "Midnightblue" },
    { "hex": "#F5FFFA", "name": "Mintcream" },
    { "hex": "#FFE4E1", "name": "Mistyrose" },
    { "hex": "#FFE4B5", "name": "Moccasin" },
    { "hex": "#FFDEAD", "name": "Navajowhite" },
    { "hex": "#FDF5E6", "name": "Oldlace" },
    { "hex": "#808000", "name": "Olive" },
    { "hex": "#6B8E23", "name": "Olivedrab" },
    { "hex": "#FF4500", "name": "Orangered" },
    { "hex": "#DA70D6", "name": "Orchid" },
    { "hex": "#EEE8AA", "name": "Palegoldenrod" },
    { "hex": "#98FB98", "name": "Palegreen" },
    { "hex": "#AFEEEE", "name": "Paleturquoise" },
    { "hex": "#DB7093", "name": "Palevioletred" },
    { "hex": "#FFEFD5", "name": "Papayawhip" },
    { "hex": "#FFDAB9", "name": "Peachpuff" },
    { "hex": "#CD853F", "name": "Peru" },
    { "hex": "#DDA0DD", "name": "Plum" },
    { "hex": "#B0E0E6", "name": "Powderblue" },
    { "hex": "#663399", "name": "Rebeccapurple" },
    { "hex": "#BC8F8F", "name": "Rosybrown" },
    { "hex": "#4169E1", "name": "Royalblue" },
    { "hex": "#FA8072", "name": "Salmon" },
    { "hex": "#F4A460", "name": "Sandybrown" },
    { "hex": "#2E8B57", "name": "Seagreen" },
    { "hex": "#FFF5EE", "name": "Seashell" },
    { "hex": "#A0522D", "name": "Sienna" },
    { "hex": "#87CEEB", "name": "Skyblue" },
    { "hex": "#6A5ACD", "name": "Slateblue" },
    { "hex": "#708090", "name": "Slategray" },
    { "hex": "#FFFAFA", "name": "Snow" },
    { "hex": "#FAFAD2", "name": "Lightgoldenrodyellow" },
  ];

const ColorManagement = ({ productData, productId }) => {

  // Multiple color selection
  const [selectedHexes, setSelectedHexes] = useState([]); // array of hex codes
  const [customColors, setCustomColors] = useState([]); // array of custom color names
  const [customColorInput, setCustomColorInput] = useState(""); // input field for custom color

  const [fetchedTitle, setFetchedTitle] = useState("");

  const [colorTableData, setColorTableData] = useState([]);
  // API functions
  const fetchColor = async () => {
    if (!productId) return null;
    const res = await fetch(`/api/productColor?product=${productId}`);
    if (!res.ok) return null;
    return res.json();
  };

  const createOrUpdateColor = async (colorArr) => {
    const res = await fetch('/api/productColor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: productId, colors: colorArr, active: true })
    });
    return res.json();
  };

  const patchColor = async ({ id, active, colors }) => {
    const res = await fetch('/api/productColor', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active, colors })
    });
    return res.json();
  };


  const fetchColorTable = async () => {
    try {
      const res = await fetch("/api/productColor");
      if (!res.ok) return;
      const data = await res.json();
      setColorTableData(data || []);
    } catch (e) {
      setColorTableData([]);
    }
  };


  useEffect(() => {
    fetchColorTable();
  }, []);

  // Toggle color active status via PATCH
  const handleSwitch = async (id, checked) => {
    try {
      await patchColor({ id, active: checked });
      toast.success("Status updated");
      fetchColorTable();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const [editRowId, setEditRowId] = useState(null);
  const handleEditRow = row => {
    setEditRowId(row._id);
    setSelectedHexes(row.colors.filter(c => c.hex).map(c => c.hex));
    setCustomColors(row.colors.filter(c => !c.hex && c.name).map(c => c.name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setSelectedHexes([]);
    setCustomColors([]);
    setCustomColorInput("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editRowId) return;
    let colorArr = [
      ...selectedHexes.map(hex => {
        const found = COLOR_LIST.find(c => c.hex === hex);
        return { name: found?.name || '', hex };
      }),
      ...customColors.map(name => ({ name, hex: '' }))
    ];
    if (colorArr.length === 0) {
      toast.error('Please select or enter at least one color');
      return;
    }
    try {
      await patchColor({ id: editRowId, colors: colorArr });
      toast.success('Color updated!');
      fetchColorTable();
      handleCancelEdit();
    } catch {
      toast.error('Failed to update color');
    }
  };


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleDeleteRow = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/productColor/${deleteId}`, { method: "DELETE" });
      setColorTableData(prev => prev.filter(row => row._id !== deleteId));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Fetch product title on mount or productId change
  useEffect(() => {
    if (productData && productData.title) {
      setFetchedTitle(productData.title);
    } else if (productId) {
      fetch(`/api/product/${productId}`)
        .then(async res => {
          if (!res.ok) {
            setFetchedTitle("");
            return;
          }
          const text = await res.text();
          if (!text) {
            setFetchedTitle("");
            return;
          }
          const data = JSON.parse(text);
          setFetchedTitle(data.title || "");
        })
        .catch(() => setFetchedTitle(""));
    } else {
      setFetchedTitle("");
    }
  }, [productData, productId]);

  // Fetch existing color on mount
  useEffect(() => {
    if (productId) {
      fetchColor().then(data => {
        if (data && data.colors && data.colors.length > 0) {
          // Separate hex and custom colors
          const hexes = data.colors.filter(c => c.hex).map(c => c.hex);
          const customs = data.colors.filter(c => !c.hex && c.name).map(c => c.name);
          setSelectedHexes(hexes);
          setCustomColors(customs);
        } else {
          setSelectedHexes([]);
          setCustomColors([]);
        }
      });
    }
  }, [productId]);

  // Submit handler (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error('No product selected');
      return;
    }
    // Build array of all selected colors
    let colorArr = [
      ...selectedHexes.map(hex => {
        const found = COLOR_LIST.find(c => c.hex === hex);
        return { name: found?.name || '', hex };
      }),
      ...customColors.map(name => ({ name, hex: '' }))
    ];
    if (colorArr.length === 0) {
      toast.error('Please select or enter at least one color');
      return;
    }
    try {
      const data = await createOrUpdateColor(colorArr);
      if (data.error) {
        toast.error(data.error || 'Failed to save color');
      } else {
        toast.success('Product color saved!');
        fetchColorTable();
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  // Toggle color swatch selection (mutually exclusive)
  const handleHexSelect = (hex) => {
    if (customColors.length > 0) return; // Prevent if custom color is present
    setSelectedHexes((prev) =>
      prev.includes(hex) ? prev.filter(h => h !== hex) : [...prev, hex]
    );
    setCustomColors([]);
    setCustomColorInput("");
  };

  // Custom color input handler (for input field)
  const handleCustomColorChange = (e) => {
    setCustomColorInput(e.target.value);
  };
  // Add custom color to list (mutually exclusive)
  const handleAddCustomColor = () => {
    if (selectedHexes.length > 0) return; // Prevent if swatch color is present
    const val = customColorInput.trim();
    if (val && !customColors.includes(val)) {
      setCustomColors([...customColors, val]);
      setCustomColorInput("");
      setSelectedHexes([]);
    }
  };
  // Remove custom color
  const handleRemoveCustomColor = (name) => {
    setCustomColors(customColors.filter(c => c !== name));
  };
  // Remove swatch color
  const handleRemoveHex = (hex) => {
    setSelectedHexes(selectedHexes.filter(h => h !== hex));
  };
  return (
    <div>
      <form className="page-content" onSubmit={handleSubmit}>
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-md-12 col-lg-12">
              <h3 className="my-1 text-center font-semibold text-2xl">Color Management</h3>
              <div className="card my-2">
                <div className="card-body px-4 py-2">
                  <div className="mb-4">
                    {/* Product Name Display (like SizeManagement) */}
                    <div className="mb-4 flex flex-col items-center justify-center">
                      <label className="font-semibold mb-2">Product Name</label>
                      <Input
                        className="mb-4 w-80 font-black text-center border-gray-300"
                        value={fetchedTitle || ''}
                        disabled
                        readOnly
                        placeholder={fetchedTitle ? "Product Name" : "Product Name not found"}
                        style={fetchedTitle ? {} : { border: '2px solid red', color: 'red' }}
                      />
                      {!fetchedTitle && (
                        <div className="text-red-500 text-xs">Product not found</div>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="font-semibold text-lg ">Choose from Color List</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10, marginTop: 10, height: 300, overflowY: 'auto', border: "1px solid #ccc", padding: "10px" }}>
                      {COLOR_LIST.map((col) => (
                        <div
                          key={col.hex}
                          onClick={() => handleHexSelect(col.hex)}
                          style={{
                            cursor: customColors.length > 0 ? 'not-allowed' : 'pointer',
                            opacity: customColors.length > 0 ? 0.5 : 1,
                            border: selectedHexes.includes(col.hex) ? '3px solid #1976d2' : '1px solid #ccc',
                            borderRadius: 8,
                            padding: 8,
                            minWidth: 120,
                            textAlign: 'center',
                            background: '#f7f7f7',
                          }}
                        >
                          <div style={{ width: 32, height: 32, background: col.hex, borderRadius: '50%', margin: '0 auto 6px', border: '1px solid #888' }} />
                          <div style={{ fontSize: 13 }}>{col.name}</div>
                          <div style={{ fontSize: 12, color: '#888' }}>{col.hex}</div>
                          {selectedHexes.includes(col.hex) && (
                            <button onClick={e => { e.stopPropagation(); handleRemoveHex(col.hex); }} style={{ marginTop: 4, background: 'transparent', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                          )}
                        </div>
                      ))}
                    </div>

                  </div>
                  <div style={{ margin: '12px 0', textAlign: 'center', fontWeight: 500, marginTop: "20px" }}>OR</div>
                  <div className="mb-4">
                    <label className="font-semibold ">Enter Custom Color Name</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <Input
                        type="text"
                        className="form-control mt-2 w-80"
                        placeholder="Type color name (e.g. Sky Blue, Olive, etc)"
                        value={customColorInput}
                        onChange={handleCustomColorChange}
                        disabled={selectedHexes.length > 0}
                      />
                      <Button type="button" onClick={handleAddCustomColor} disabled={!customColorInput.trim() || selectedHexes.length > 0}>Add</Button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {customColors.map(name => (
                        <span key={name} style={{ background: '#eee', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center' }}>
                          {name}
                          <button onClick={() => handleRemoveCustomColor(name)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold' }}>x</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    {editRowId ? (
                      <>
                        <Button type="button" className="bg-yellow-500 px-5 py-2 mr-2" onClick={handleUpdate}>
                          Update
                        </Button>
                        <Button type="button" className="bg-gray-400 px-5 py-2" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button type="submit" className="bg-red-500 px-5 py-2">
                        Data Save
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 16 }}>All Product Colors</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 700, borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ padding: 8, border: '1px solid #ddd' }}>S.No</th>
                <th style={{ padding: 8, border: '1px solid #ddd' }}>Product Name</th>
                <th style={{ padding: 8, border: '1px solid #ddd' }}>Hex / Color Name</th>
                <th style={{ padding: 8, border: '1px solid #ddd' }}>Active</th>
                <th style={{ padding: 8, border: '1px solid #ddd' }}>Edit</th>
                <th style={{ padding: 8, border: '1px solid #ddd' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {colorTableData.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>No entries</td></tr>
              )}
              {colorTableData.map((row, idx) => (
                <tr key={row._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8, border: '1px solid #ddd' }}>{idx + 1}</td>
                  <td style={{ padding: 8, border: '1px solid #ddd' }}>{row.product?.title || '-'}</td>
                  <td style={{ padding: 8, border: '1px solid #ddd' }}>
                    {row.colors.map((c, i) => (
                      <span key={i} style={{ marginRight: 8, display: 'inline-block' }}>
                        {c.hex ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <span style={{ display: 'inline-block', width: 16, height: 16, background: c.hex, border: '1px solid #888', borderRadius: 4, marginRight: 4 }}></span>
                            <span>{c.name}</span>
                          </span>
                        ) : (
                          <span>{c.name}</span>
                        )}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: 8, border: '1px solid #ddd' }}>
                    <Switch checked={!!row.active} onCheckedChange={checked => handleSwitch(row._id, checked)} />
                  </td>
                  <td style={{ padding: 8, border: '1px solid #ddd' }}>
                    <button onClick={() => handleEditRow(row)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Edit</button>
                  </td>
                  <td style={{ padding: 8, border: '1px solid #ddd' }}>
                    <Button variant="destructive" onClick={() => openDeleteModal(row._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Delete Modal */}
      {showDeleteModal && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Color Entry</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this color entry?</p>
            <DialogFooter>
              <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteRow}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ColorManagement;
