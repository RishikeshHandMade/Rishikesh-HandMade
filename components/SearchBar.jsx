"use client";

import { Input } from "@/components/ui/input";
import { CalendarClock, MapPin, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/context/SearchContext";
import Image from "next/image";

export default function SearchBar({ placeholder }) {
    const [query, setQuery] = useState("");
    const [relatedPackages, setRelatedPackages] = useState([]);
    const [packages, setPackages] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const { isSearchOpen, setIsSearchOpen } = useSearch();
    const router = useRouter();

    useEffect(() => {
        const storedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
        setRecentSearches(storedSearches);

        const fetchPackages = async () => {
            try {
                const res = await fetch("/api/getSearchPackages");
                const data = await res.json();
                if (data.packages && data.packages.length > 0) {
                    setPackages(data.packages);
                }
            } catch (error) {
                console.error("Error fetching packages:", error);
            }
        };

        fetchPackages();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === "k") {
                event.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearch = async (event) => {
        const value = event.target.value;
        setQuery(value);

        if (value.trim().length < 2) {
            setRelatedPackages([]);
            return;
        }

        try {
            const res = await fetch(`/api/packages/search?q=${value}`);
            if (res.ok) {
                const data = await res.json();
                setRelatedPackages(data);
            } else {
                setRelatedPackages([]);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            setRelatedPackages([]);
        }
    };

    const handlePackageClick = (id, name) => {
        const updatedSearches = [{ id, name }, ...recentSearches.filter(item => item.id !== id)].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

        router.push(`/package/${encodeURIComponent(id)}`);
        setIsSearchOpen(false);
    };

    const handleSubmit = () => {
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsSearchOpen(false);
    };

    const clearRecentSearches = () => {
        localStorage.removeItem("recentSearches");
        setRecentSearches([]);
    };

    return (
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
                <button className="hidden" aria-label="Open search"></button>
            </DialogTrigger>
            <DialogTitle className="px-4 py-2 flex items-center xl:justify-between border-2 rounded-full focus:ring-2 focus:ring-primary gap-4 h-10 w-36 cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-6 w-6" />
                <p className="text-sm font-medium">Ctrl + K</p>
            </DialogTitle>

            <DialogContent className="max-w-2xl max-h-[60vh] font-barlow p-4 overflow-y-auto">
                <div className="relative mt-6">
                    <Search className="absolute left-3 top-4 h-6 w-6 text-gray-600" />
                    <Input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder={placeholder}
                        className="px-10 !py-6 flex-1 w-full placeholder:font-normal placeholder:text-gray-600 border-2 border-blue-600  focus-visible:ring-0 rounded-full shadow-none focus:ring-0 outline-none"
                    />
                </div>

                {/* Random  Packages Dropdown */}
                {packages && packages.length > 0 && (
                    <>
                        <h2 className="mt-4 text-xl font-medium mb-2 font-barlow">You Might Also Like</h2>
                        <ul className="border rounded-md shadow-sm bg-white max-h-[25rem] overflow-y-auto">
                            {packages.map((pkg, index) => (
                                <li
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                                    onClick={() => handlePackageClick(pkg?._id, pkg?.packageName)}
                                >
                                    <Image
                                        src={pkg?.basicDetails?.thumbnail?.url}
                                        width={1280} height={720} quality={50}
                                        alt={pkg?.packageName}
                                        className="w-24 h-24 rounded-md object-cover"
                                    />
                                    <div className="flex items-end gap-4 w-full">
                                        <div>
                                            <p className="font-semibold text-lg">{pkg?.packageName}</p>
                                            <p className="flex items-center gap-2 font-barlow text-blue-600 text-sm font-semibold">
                                                <MapPin className="h-4 w-4" />
                                                {pkg?.basicDetails?.location}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="flex items-center gap-2 font-barlow text-blue-600 text-sm font-semibold">
                                                <CalendarClock className="h-4 w-4" /> {pkg?.basicDetails?.duration} Days {pkg?.basicDetails?.duration - 1} Nights
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* Related Packages Dropdown */}
                {query && relatedPackages.length > 0 && (
                    <>
                        <h2 className="mt-4 text-xl font-medium mb-2 font-barlow">Search Results: {query}</h2>
                        <ul className="mt-2 border rounded-md shadow-sm bg-white max-h-[25rem] overflow-y-auto">
                            {relatedPackages.map((pkg, index) => (
                                <li
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                                    onClick={() => handlePackageClick(pkg?._id, pkg?.packageName)}
                                >
                                    <Image
                                        src={pkg?.basicDetails?.thumbnail?.url}
                                        width={1280} height={720} quality={50}
                                        alt={pkg?.packageName}
                                        className="w-24 h-24 rounded-md object-cover"
                                    />
                                    <div>
                                        <p className="font-medium">{pkg?.packageName}</p>
                                        <p className="text-xs flex items-center text-gray-500">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {pkg?.basicDetails?.location}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Recent Packages</p>
                        <ul className="mt-2 border rounded-md shadow-sm bg-white">
                            {recentSearches.map((search, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handlePackageClick(search.id, search.name)}
                                >
                                    <span>{search.name}</span>
                                    <X className="h-4 w-4 text-gray-400 hover:text-red-500" onClick={(e) => {
                                        e.stopPropagation();
                                        const filteredSearches = recentSearches.filter(item => item.id !== search.id);
                                        setRecentSearches(filteredSearches);
                                        localStorage.setItem("recentSearches", JSON.stringify(filteredSearches));
                                    }} />
                                </li>
                            ))}
                        </ul>

                        <button onClick={clearRecentSearches} className="text-sm text-red-500 mt-2 hover:underline">
                            Clear recent searches
                        </button>
                    </div>
                )}
                <div className="sticky bottom-4 pb-4 translate-y-1/2  w-full bg-white">
                <Button onClick={handleSubmit} className="w-full uppercase text-base mt-4 bg-blue-600 hover:bg-blue-700 mx-auto">Search</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
