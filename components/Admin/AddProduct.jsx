'use client'

import { useForm } from "react-hook-form"
import { Input } from "../ui/input"
import { NumericFormat } from "react-number-format"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"

const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

const AddProduct = ({ id }) => {
    const { handleSubmit, register, setValue, reset } = useForm();
    const subMenuId = id;
    const [productCode, setProductCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [artisan, setArtisan] = useState("");
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [order, setOrder] = useState(1);
    const [active, setActive] = useState(true);
    // console.log(products)

    useEffect(() => {
        setLoading(true);
        fetch('/api/createArtisan')
            .then(res => res.json())
            .then(data => {
                setArtisans(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        setProductCode(generateCode());
    }, []);

    useEffect(() => {
        // Fetch products for this submenu/category or all direct products
        const fetchProducts = async () => {
            try {
                let url = '';
                if (subMenuId) {
                    url = `/api/getSubMenuById/${subMenuId}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                // console.log(data)
                if (subMenuId && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else if (!subMenuId && Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                setProducts([]);
            }
        };
        fetchProducts();
    }, [subMenuId]);
    const deletePackage = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/website-manage/addPackage', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const result = await response.json();
            if (response.ok) {
                setProducts((prev) => prev.filter((prod) => prod._id !== id));
                toast.success('Product deleted successfully!');
            } else {
                toast.error(result.message || 'Failed to delete product.');
            }
        } catch (error) {
            toast.error('Failed to delete product.');
        } finally {
            setIsLoading(false);
        }
    };
    const onSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                title,
                code: productCode,
                artisan,
                order,
                active,
                isDirect: !subMenuId,
                ...(subMenuId ? { subMenuId, category: subMenuId } : {})
            };
            const response = await fetch('/api/admin/website-manage/addPackage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (response.ok) {
                toast.success('Product added successfully!');
                reset();
                setProductCode(generateCode());
                // Refetch products
                if (subMenuId) {
                    const res = await fetch(`/api/getSubMenuById/${subMenuId}`);
                    const data = await res.json();
                    console.log('Fetched after create:', data);
                    if (Array.isArray(data.products)) {
                        setProducts(data.products);
                        if (data.products.length === 0) {
                            toast.error('No products found in submenu after create.');
                        }
                    } else {
                        setProducts([]);
                        toast.error('Unexpected response fetching products for submenu.');
                    }
                } else {
                    const res = await fetch('/api/product?isDirect=true');
                    const data = await res.json();
                    console.log('Fetched after create:', data);
                    if (Array.isArray(data)) {
                        setProducts(data);
                        if (data.length === 0) {
                            toast.error('No direct products found after create.');
                        }
                    } else {
                        setProducts([]);
                        toast.error('Unexpected response fetching direct products.');
                    }
                }
            } else {
                toast.error(result.message || 'Failed to add product');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }


        if (!title || !artisan) {
            toast.error("All fields are required", { style: { borderRadius: "10px", border: "2px solid red" } });
            return;
        }
        try {
            const response = await fetch("/api/admin/website-manage/addPackage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: productCode, title, artisan }),
            });

            const res = await response.json();

            if (response.ok) {
                toast.success("Package added successfully!", { style: { borderRadius: "10px", border: "2px solid green" } })
                window.location.reload();
            } else {
                toast.error("Failed to add package", { style: { borderRadius: "10px", border: "2px solid red" } })
            }
        } catch (error) {
            toast.error("Something went wrong", { style: { borderRadius: "10px", border: "2px solid red" } })
        }

    };
    return (
        <>
            <form className="flex flex-col items-center justify-center gap-8 my-20 bg-blue-100 w-[50%] max-w-xl md:max-w-7xl mx-auto p-4 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex md:flex-row flex-col items-center md:items-end gap-6 w-full">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="productCode" className="font-semibold">Product Code</label>
                        <Input name="productCode" className="w-32 border-2 border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 font-bold" readOnly value={productCode} />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <label htmlFor="productTitle" className="font-semibold">Product Title</label>
                        <Input name="productTitle" className="w-full border-2 font-bold border-blue-600 " value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <label htmlFor="artisan" className="font-semibold">Artisan Name</label>
                        <Select value={artisan} onValueChange={setArtisan} name="artisan" disabled={loading}>
                            <SelectTrigger className="w-full border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0">
                                <SelectValue placeholder={loading ? 'Loading artisans...' : 'Select Artisan'} />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-blue-600 bg-gray-200">
                                <SelectGroup>
                                    {artisans.length > 0 ? (
                                        artisans.map(a => (
                                            <SelectItem key={a._id} value={a._id} className="focus:bg-blue-300 font-bold">
                                                {a.title ? `${a.title} ` : ''}{a.firstName} {a.lastName}
                                            </SelectItem>
                                        ))
                                    ) : null}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Add Package</Button>
            </form>

            <div className="bg-blue-100 p-4 rounded-lg shadow max-w-5xl mx-auto w-full overflow-x-auto lg:overflow-visible text-center">
                <Table className="w-full min-w-max lg:min-w-0">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center !text-black w-1/3">Package Name</TableHead>
                            <TableHead className="text-center !text-black w-1/3">Order</TableHead>
                            <TableHead className="w-1/3 !text-black text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products && products.length > 0 ? (
                            products.map((prod, index) => (
                                <TableRow key={prod._id}>
                                    <TableCell className="border font-semibold border-blue-600">{prod.title}</TableCell>
                                    <TableCell className="border font-semibold border-blue-600">{index + 1}</TableCell>
                                    <TableCell className="border font-semibold border-blue-600">
                                        <div className="flex items-center justify-center gap-6">
                                            <Button size="icon" variant="outline" asChild>
                                                <Link href={`/admin/add_direct_product/${prod._id}`}>
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button size="icon" disabled={isLoading} onClick={() => deletePackage(prod._id)} variant="destructive">
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                {/* <Switch
                                                    id={`switch-${prod._id}`}
                                                    checked={prod.active}
                                                    onCheckedChange={() => toggleSwitch(prod._id, prod.active)}
                                                    className={`rounded-full transition-colors ${prod.active ? "!bg-green-500" : "!bg-red-500"}`}
                                                />
                                                <Label htmlFor={`switch-${prod._id}`} className="text-black">
                                                    {prod.active ? "ON" : "OFF"}
                                                </Label> */}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="3" className="text-center border font-semibold border-blue-600">
                                    No packages available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    )

}
export default AddProduct

