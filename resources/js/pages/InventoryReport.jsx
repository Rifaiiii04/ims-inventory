import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useInventoryReport } from "../hooks/useInventoryReport";

function InventoryReport() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [filterProduct, setFilterProduct] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Use inventory report hook for real data
    const {
        reportData: inventoryData,
        categories,
        loading,
        error,
        fetchInventoryReport,
        exportExcel,
        exportPDF,
    } = useInventoryReport();

    // Debug logging
    console.log("InventoryReport render:", {
        inventoryData,
        loading,
        error,
        categories,
    });

    // Handle filter changes
    const handleFilterChange = () => {
        fetchInventoryReport({
            product: filterProduct,
            category: filterCategory,
            date: filterDate,
        });
    };

    // Handle export functions
    const handleExportExcel = async () => {
        const result = await exportExcel({
            product: filterProduct,
            category: filterCategory,
            date: filterDate,
        });

        if (!result.success) {
            alert(result.message);
        }
    };

    const handleExportPDF = async () => {
        const result = await exportPDF({
            product: filterProduct,
            category: filterCategory,
            date: filterDate,
        });

        if (!result.success) {
            alert(result.message);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            Aman: {
                bg: "bg-green-100",
                text: "text-green-800",
                dot: "bg-green-400",
            },
            Perhatian: {
                bg: "bg-yellow-100",
                text: "text-yellow-800",
                dot: "bg-yellow-400",
            },
            Kritis: {
                bg: "bg-red-100",
                text: "text-red-800",
                dot: "bg-red-400",
            },
        };

        const config = statusConfig[status] || statusConfig["Aman"];

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
                <div
                    className={`w-1.5 h-1.5 ${config.dot} rounded-full mr-1.5`}
                ></div>
                {status}
            </span>
        );
    };

    // Handle add item (placeholder - since this is a report, not a management page)
    const handleAddItem = () => {
        alert(
            "Fitur tambah item tidak tersedia di laporan. Gunakan halaman Manajemen Produk untuk menambah produk baru."
        );
    };

    // Handle edit item (placeholder - since this is a report, not a management page)
    const handleEditItem = (item) => {
        alert(
            `Fitur edit item tidak tersedia di laporan. Gunakan halaman Manajemen Produk untuk mengedit produk "${item.name}".`
        );
    };

    // Handle delete item (placeholder - since this is a report, not a management page)
    const handleDeleteItem = (id) => {
        alert(
            "Fitur hapus item tidak tersedia di laporan. Gunakan halaman Manajemen Produk untuk menghapus produk."
        );
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
                                {inventoryData?.summary?.totalProducts || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Item</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Total Stok
                            </p>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {inventoryData?.summary?.totalStock || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Unit</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Nilai Beli
                            </p>
                            <h3 className="text-xl font-bold text-orange-600">
                                {formatCurrency(
                                    inventoryData?.summary?.totalBuyValue || 0
                                )}
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
                                {formatCurrency(
                                    inventoryData?.summary?.totalSellValue || 0
                                )}
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
                                    value={filterProduct}
                                    onChange={(e) =>
                                        setFilterProduct(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        handleFilterChange()
                                    }
                                    placeholder="Cari produk..."
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
                                        <option
                                            key={cat.id_kategori}
                                            value={cat.id_kategori}
                                        >
                                            {cat.nama_kategori}
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
                                    onClick={() =>
                                        (window.location.href = "/products")
                                    }
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
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
                                            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25A2.25 2.25 0 016 10.5zm0 9h2.25a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25A2.25 2.25 0 016 19.5z"
                                        />
                                    </svg>
                                    Kelola Produk
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportExcel}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2"
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
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                </svg>
                                Export Excel
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 flex items-center gap-2"
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
                                            {inventoryData?.items?.length || 0}{" "}
                                            item tersedia
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
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-gray-600">
                                                        Memuat data...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="text-red-600">
                                                    <p className="font-semibold">
                                                        Terjadi kesalahan
                                                    </p>
                                                    <p className="text-sm">
                                                        {error}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : !inventoryData?.items ||
                                      inventoryData.items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="text-gray-500">
                                                    <p className="font-semibold">
                                                        Tidak ada data
                                                    </p>
                                                    <p className="text-sm">
                                                        Belum ada produk yang
                                                        tersedia
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        inventoryData?.items?.map(
                                            (item, index) => (
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
                                                                    ID:{" "}
                                                                    {item.id}
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
                                                            {formatCurrency(
                                                                item.buy_price
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            per {item.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-bold text-green-600">
                                                            {formatCurrency(
                                                                item.sell_price
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            per {item.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-center">
                                                            {item.initial_stock}{" "}
                                                            {item.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg text-center">
                                                            {item.stock_in}{" "}
                                                            {item.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-lg text-center">
                                                            {item.final_stock}{" "}
                                                            {item.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {getStatusBadge(
                                                            item.status
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditItem(
                                                                        item
                                                                    )
                                                                }
                                                                className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                                title="Edit"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        2
                                                                    }
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
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
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryReport;
