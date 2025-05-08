'use client'

import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { statesIndia } from "@/lib/IndiaStates"
import toast from "react-hot-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

const CreateCity = () => {
    const { handleSubmit, register, setValue, watch, reset } = useForm()
    const [selectedState, setSelectedState] = useState("")
    const [editItem, setEditItem] = useState(null)
    const [cities, setCities] = useState([])

    useEffect(() => {
        try {
            const fetchCities = async () => {
                const response = await fetch("/api/admin/website-manage/addCityName")
                const res = await response.json()
                if (response.ok) {
                    setCities(res.cities)
                } else {
                    toast.error(res.message, {
                        style: {
                            borderRadius: "10px",
                            border: "2px solid red",
                        }
                    });
                }
            }
            fetchCities()
        } catch (error) {
            toast.error("Something went wrong", {
                style: {
                    borderRadius: "10px",
                    border: "2px solid red",
                }
            });
        }
    }, [])

    const handleUpdate = async () => {
        try {
            if (!selectedState || !editItem || !watch("cityName")) {
                toast.error("Please provide all details", { style: { borderRadius: "10px", border: "2px solid red" } });
                return;
            }

            const response = await fetch(`/api/admin/website-manage/addCityName`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedState,
                    oldCityName: editItem,  // The city name before editing
                    newCityName: watch("cityName") // The new city name from the input field
                }),
            });

            const res = await response.json();

            if (response.ok) {
                toast.success("City updated successfully!", { style: { borderRadius: "10px", border: "2px solid green" } });
                setEditItem(null);
                window.location.reload();
            } else {
                toast.error(res.message, { style: { borderRadius: "10px", border: "2px solid red" } });
            }
        } catch (error) {
            toast.error("Error updating City", { style: { borderRadius: "10px", border: "2px solid red" } });
        }
    };

    const handleEdit = (city) => {
        setEditItem(city);
        setValue("cityName", city);
    };

    const deleteMenuItem = async (city) => {
        try {
            const response = await fetch(`/api/admin/website-manage/addCityName`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selectedState, city }),
            });

            if (response.ok) {
                toast.success("City deleted successfully!", { style: { borderRadius: "10px", border: "2px solid green" } });
                window.location.reload();
            } else {
                toast.error("Failed to delete City", { style: { borderRadius: "10px", border: "2px solid red" } });
            }
        } catch (error) {
            console.error("Error deleting City:", error);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedState) {
            toast.error("Please select a state", {
                style: {
                    borderRadius: "10px",
                    border: "2px solid red",
                }
            });
            return;
        }
        if (!data.cityName) {
            toast.error("Please enter a city name", {
                style: {
                    borderRadius: "10px",
                    border: "2px solid red",
                }
            });
            return;
        }
        try {
            const response = await fetch("/api/admin/website-manage/addCityName", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const res = await response.json()

            if (response.ok) {
                toast.success("City added successfully!", {
                    style: {
                        borderRadius: "10px",
                        border: "2px solid green",
                    }
                })
                reset();
                setSelectedState("");
                window.location.reload();
            } else {
                toast.error(res.message, {
                    style: {
                        borderRadius: "10px",
                        border: "2px solid red",
                    }
                });
            }
        } catch (error) {
            toast.error("Something went wrong", {
                style: {
                    borderRadius: "10px",
                    border: "2px solid red",
                }
            });
        }
    }

    return (
        <div className="my-20 w-full bg-blue-100 p-4 rounded-lg">
            <form className="flex flex-col items-center gap-8 " onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-4xl font-semibold">Add City to State</h1>

                <div className="flex flex-col items-center gap-4 mt-12">
                    <Select
                        name="stateName"
                        className="p-2 border border-gray-300 rounded-md"
                        onValueChange={(value) => {
                            setValue("stateName", value)
                            setSelectedState(value)
                        }}
                    >
                        <SelectTrigger className="border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 w-96">
                            <SelectValue placeholder="Select State" className="" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-blue-600 font-barlow bg-blue-100">
                            <SelectGroup>
                                {statesIndia.sort().map((state, index) => (
                                    <SelectItem key={index} value={state} className="focus:bg-blue-300 font-bold truncate">
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <input
                        type="text"
                        placeholder="Enter City Name"
                        {...register("cityName", { required: true })}
                        className="border-2 bg-transparent border-blue-600 focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-gray-600 font-semibold w-96 p-2 text-sm rounded-md capitalize"
                    />
                </div>

                <button type="submit" className="bg-blue-600 text-white p-2 rounded-md">Save City</button>
            </form>

            <div className="max-w-2xl mx-auto mt-20 flex flex-col items-center gap-8">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center !text-black">City Name</TableHead>
                            <TableHead className="text-center !text-black">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cities?.length > 0 ? (
                            selectedState ? (
                                cities.filter((state) => state.stateName === selectedState).length > 0 ? (
                                    cities
                                        .filter((state) => state.stateName === selectedState)
                                        .map((state) =>
                                            state.cities.length > 0 ? (
                                                state.cities.map((city) => (
                                                    <TableRow key={city}>
                                                        <TableCell className="border font-semibold border-blue-600"><Badge className="py-1.5 text-base mr-4 hover:bg-blue-600 bg-blue-500 border-2 border-blue-600">{city}</Badge></TableCell>
                                                        <TableCell className="border font-semibold border-blue-600 text-center">
                                                            <Button size="icon" onClick={() => handleEdit(city)} variant="outline" className="mr-4">
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" onClick={() => deleteMenuItem(city)} variant="destructive">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow key="no-city">
                                                    <TableCell colSpan={2} className="border font-semibold border-blue-600 text-center">
                                                        No cities available for this state.
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                ) : (
                                    <TableRow key="no-state">
                                        <TableCell colSpan={2} className="border font-semibold border-blue-600 text-center">
                                            Selected state not found in database.
                                        </TableCell>
                                    </TableRow>
                                )
                            ) : (
                                <TableRow key="no-selection">
                                    <TableCell colSpan={2} className="border font-semibold border-blue-600 text-center">
                                        Please select a state to view cities.
                                    </TableCell>
                                </TableRow>
                            )
                        ) : (
                            <TableRow key="no-states">
                                <TableCell colSpan={2} className="border font-semibold border-blue-600 text-center">
                                    No states available in the database.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {editItem && (
                    <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
                        <DialogContent className="font-barlow">
                            <DialogHeader>
                                <DialogTitle>Change City Name</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(handleUpdate)}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                                    <div className="flex flex-col gap-2 col-span-3">
                                        <Label>City Name</Label>
                                        <Input {...register("cityName")} className="border-2 border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 font-bold" />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button className="bg-blue-600 hover:bg-blue-500" type="submit">Save</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}

export default CreateCity
