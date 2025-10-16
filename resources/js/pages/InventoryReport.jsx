import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

function InventoryReport() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filterProduct, setFilterProduct] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Dummy data inventory dengan stok masuk dan stok akhir
    const [inventoryData, setInventoryData] = useState({
        summary: {
            totalProducts: 25,
            totalStock: 1250,
            lowStockItems: 5,
            totalBuyValue: 15000000,
            totalSellValue: 25000000,
        },
        items: [
            {
                id: 1,
                name: "Nasi Putih",
                category: "Bahan",
                buyPrice: 5000,
                sellPrice: 8000,
                initialStock: 30,
                stockIn: 20,
                finalStock: 50,
                unit: "Porsi",
                lastUpdate: "2025-01-11",
                updatedBy: "Admin",
            },
            {
                id: 2,
                name: "Mie Instan",
                category: "Bahan",
                buyPrice: 3000,
                sellPrice: 5000,
                initialStock: 15,
                stockIn: 0,
                finalStock: 8,
                unit: "Pack",
                lastUpdate: "2025-01-10",
                updatedBy: "Staff1",
            },
            {
                id: 3,
                name: "Nasi Goreng",
                category: "Produk",
                buyPrice: 8000,
                sellPrice: 15000,
                initialStock: 25,
                stockIn: 10,
                finalStock: 35,
                unit: "Porsi",
                lastUpdate: "2025-01-11",
                updatedBy: "Admin",
            },
            {
                id: 4,
                name: "Es Teh",
                category: "Minuman",
                buyPrice: 2000,
                sellPrice: 5000,
                initialStock: 40,
                stockIn: 15,
                finalStock: 45,
                unit: "Gelas",
                lastUpdate: "2025-01-11",
                updatedBy: "Staff2",
            },
            {
                id: 5,
                name: "Ayam Goreng",
                category: "Produk",
                buyPrice: 12000,
                sellPrice: 20000,
                initialStock: 20,
                stockIn: 5,
                finalStock: 18,
                unit: "Porsi",
                lastUpdate: "2025-01-10",
                updatedBy: "Admin",
            },
        ],
    });

    // Data untuk grafik
    const chartData = {
        topProducts: [
            { name: "Nasi Goreng", sold: 45, percentage: 35 },
            { name: "Es Teh", sold: 30, percentage: 25 },
            { name: "Ayam Goreng", sold: 25, percentage: 20 },
            { name: "Mie Goreng", sold: 20, percentage: 15 },
            { name: "Lainnya", sold: 5, percentage: 5 },
        ],
        stockUsage: [
            { name: "Nasi Putih", used: 20, remaining: 30 },
            { name: "Mie Instan", used: 7, remaining: 8 },
            { name: "Nasi Goreng", used: 10, remaining: 35 },
            { name: "Es Teh", used: 15, remaining: 45 },
            { name: "Ayam Goreng", used: 2, remaining: 18 },
        ],
    };

    const getStatusColor = (finalStock) => {
        if (finalStock <= 10) return "bg-red-100 text-red-700 border-red-200";
        if (finalStock <= 20)
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-green-100 text-green-700 border-green-200";
    };

    const getStatusText = (finalStock) => {
        if (finalStock <= 10) return "Kritis";
        if (finalStock <= 20) return "Perhatian";
        return "Aman";
    };

    // Filter data
    const filteredItems = inventoryData.items.filter((item) => {
        const matchesProduct = item.name
            .toLowerCase()
            .includes(filterProduct.toLowerCase());
        const matchesCategory =
            filterCategory === "" || item.category === filterCategory;
        const matchesDate = filterDate === "" || item.lastUpdate === filterDate;
        return matchesProduct && matchesCategory && matchesDate;
    });

    // Get unique categories for filter
    const categories = [
        ...new Set(inventoryData.items.map((item) => item.category)),
    ];

    const handleAddItem = () => {
        setEditingItem(null);
        setShowFormModal(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowFormModal(true);
    };

    const handleDeleteItem = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
            setInventoryData({
                ...inventoryData,
                items: inventoryData.items.filter((item) => item.id !== id),
            });
        }
    };

    const handleSaveItem = (itemData) => {
        if (editingItem) {
            // Update existing item
            setInventoryData({
                ...inventoryData,
                items: inventoryData.items.map((item) =>
                    item.id === editingItem.id
                        ? {
                              ...itemData,
                              id: editingItem.id,
                              lastUpdate: new Date()
                                  .toISOString()
                                  .split("T")[0],
                              updatedBy: "Admin",
                          }
                        : item
                ),
            });
        } else {
            // Add new item
            const newItem = {
                ...itemData,
                id: Math.max(...inventoryData.items.map((i) => i.id)) + 1,
                lastUpdate: new Date().toISOString().split("T")[0],
                updatedBy: "Admin",
            };
            setInventoryData({
                ...inventoryData,
                items: [...inventoryData.items, newItem],
            });
        }
        setShowFormModal(false);
        setEditingItem(null);
    };

    return (
        <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                </svg>
            </button>

            <div
                className={`fixed md:relative md:block z-40 transition-transform duration-300 h-full ${
                    isMobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                }`}
            >
                <div className="h-full p-3 bg-gradient-to-br from-gray-50 to-gray-100 md:bg-transparent">
                    <Sidebar />
                </div>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <TopBar
                    title="Laporan Inventory"
                    subtitle="Ringkasan stok dan nilai inventory"
                    showLiveIndicator={true}
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Total Produk
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {inventoryData.summary.totalProducts}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Item</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Total Stok
                            </p>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {inventoryData.summary.totalStock}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Unit</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Nilai Beli
                            </p>
                            <h3 className="text-xl font-bold text-orange-600">
                                Rp{" "}
                                {(
                                    inventoryData.summary.totalBuyValue /
                                    1000000
                                ).toFixed(1)}
                                M
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Total Beli
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Nilai Jual
                            </p>
                            <h3 className="text-xl font-bold text-green-600">
                                Rp{" "}
                                {(
                                    inventoryData.summary.totalSellValue /
                                    1000000
                                ).toFixed(1)}
                                M
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Total Jual
                            </p>
                        </div>
                    </div>

                    {/* Filter & Action Buttons */}
                    <div className="mb-6 bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Filter Produk
                                </label>
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={filterProduct}
                                    onChange={(e) =>
                                        setFilterProduct(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Filter Kategori
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) =>
                                        setFilterCategory(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Filter Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) =>
                                        setFilterDate(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleAddItem}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="size-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4.5v15m7.5-7.5h-15"
                                        />
                                    </svg>
                                    Tambah Item
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="size-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                </svg>
                                Export Excel
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="size-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                </svg>
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-6 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 px-6 py-5 border-b border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-5 h-5 text-white"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Tabel Laporan Inventory
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {filteredItems.length} item tersedia
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        Live
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Nama Produk</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Kategori</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Harga Beli</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Harga Jual</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Stok Awal</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Stok Masuk</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Stok Akhir</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <span>Status</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Aksi</span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/50">
                                    {filteredItems.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30 transition-all duration-200 ${
                                                index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-gray-50/30"
                                            }`}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-200 rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm">
                                                        {item.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800 text-sm">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {item.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-gray-800">
                                                    Rp{" "}
                                                    {item.buyPrice.toLocaleString(
                                                        "id-ID"
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    per {item.unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-green-600">
                                                    Rp{" "}
                                                    {item.sellPrice.toLocaleString(
                                                        "id-ID"
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    per {item.unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-center">
                                                    {item.initialStock}{" "}
                                                    {item.unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg text-center">
                                                    {item.stockIn} {item.unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-lg text-center">
                                                    {item.finalStock}{" "}
                                                    {item.unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getStatusColor(
                                                        item.finalStock
                                                    )}`}
                                                >
                                                    {getStatusText(
                                                        item.finalStock
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            handleEditItem(item)
                                                        }
                                                        className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                        title="Edit"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="size-4 group-hover/btn:scale-110 transition-transform"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteItem(
                                                                item.id
                                                            )
                                                        }
                                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                        title="Hapus"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="size-4 group-hover/btn:scale-110 transition-transform"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Produk Terlaris - Pie Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Produk Terlaris
                            </h3>
                            <div className="space-y-3">
                                {chartData.topProducts.map((product, index) => (
                                    <div
                                        key={product.name}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        index === 0
                                                            ? "#10B981"
                                                            : index === 1
                                                            ? "#3B82F6"
                                                            : index === 2
                                                            ? "#F59E0B"
                                                            : index === 3
                                                            ? "#EF4444"
                                                            : "#6B7280",
                                                }}
                                            ></div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {product.name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-800">
                                                {product.sold} terjual
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {product.percentage}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stok Terpakai - Bar Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Stok Terpakai
                            </h3>
                            <div className="space-y-4">
                                {chartData.stockUsage.map((item, index) => {
                                    const total = item.used + item.remaining;
                                    const usedPercentage =
                                        (item.used / total) * 100;
                                    return (
                                        <div key={item.name}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">
                                                    {item.name}
                                                </span>
                                                <span className="text-gray-500">
                                                    {item.used}/{total}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${usedPercentage}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <InventoryFormModal
                    item={editingItem}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingItem(null);
                    }}
                    onSave={handleSaveItem}
                />
            )}
        </div>
    );
}

// Form Modal Component
function InventoryFormModal({ item, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        buyPrice: "",
        sellPrice: "",
        initialStock: "",
        stockIn: "",
        finalStock: "",
        unit: "",
    });

    React.useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || "",
                category: item.category || "",
                buyPrice: item.buyPrice || "",
                sellPrice: item.sellPrice || "",
                initialStock: item.initialStock || "",
                stockIn: item.stockIn || "",
                finalStock: item.finalStock || "",
                unit: item.unit || "",
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {item
                                ? "Edit Item Inventory"
                                : "Tambah Item Inventory"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Produk *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                <option value="Bahan">Bahan</option>
                                <option value="Produk">Produk</option>
                                <option value="Minuman">Minuman</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga Beli (Rp) *
                            </label>
                            <input
                                type="number"
                                name="buyPrice"
                                value={formData.buyPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga Jual (Rp) *
                            </label>
                            <input
                                type="number"
                                name="sellPrice"
                                value={formData.sellPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stok Awal *
                            </label>
                            <input
                                type="number"
                                name="initialStock"
                                value={formData.initialStock}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stok Masuk
                            </label>
                            <input
                                type="number"
                                name="stockIn"
                                value={formData.stockIn}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stok Akhir *
                            </label>
                            <input
                                type="number"
                                name="finalStock"
                                value={formData.finalStock}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Satuan *
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                required
                            >
                                <option value="">Pilih Satuan</option>
                                <option value="Porsi">Porsi</option>
                                <option value="Pack">Pack</option>
                                <option value="Gelas">Gelas</option>
                                <option value="Botol">Botol</option>
                                <option value="Kg">Kg</option>
                                <option value="Liter">Liter</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 font-semibold shadow-lg text-sm"
                        >
                            {item ? "Update" : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InventoryReport;
