import React, { useState, useEffect } from "react";
import ConversionDisplay from "./ConversionDisplay";

function StockTable({ data, onEdit, onDelete, onViewHistory, onBulkDelete }) {
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Reset select all when data changes
    useEffect(() => {
        setSelectAll(false);
        setSelectedItems(new Set());
    }, [data]);

    // Update select all state when selected items change
    useEffect(() => {
        if (data.length > 0) {
            setSelectAll(selectedItems.size === data.length);
        } else {
            setSelectAll(false);
        }
    }, [selectedItems, data.length]);

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = new Set(data.map((item) => item.id));
            setSelectedItems(allIds);
            setSelectAll(true);
        } else {
            setSelectedItems(new Set());
            setSelectAll(false);
        }
    };

    const handleSelectItem = (id, checked) => {
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedItems(newSelected);
    };

    const handleBulkDelete = () => {
        if (selectedItems.size === 0) {
            alert("Pilih minimal 1 item untuk dihapus");
            return;
        }

        const count = selectedItems.size;
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus ${count} item yang dipilih?`
            )
        ) {
            if (onBulkDelete) {
                onBulkDelete(Array.from(selectedItems));
                setSelectedItems(new Set());
                setSelectAll(false);
            }
        }
    };
    const getCategoryBadge = (category) => {
        return category === "Produk"
            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm"
            : "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm";
    };

    const getStockStatus = (quantity) => {
        if (quantity < 10)
            return "text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full text-xs";
        if (quantity < 30)
            return "text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded-full text-xs";
        return "text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full text-xs";
    };

    const getStockIcon = (quantity) => {
        if (quantity < 10) return "🔴";
        if (quantity < 30) return "🟡";
        return "🟢";
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-green-50 px-6 py-5 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                Daftar Stok
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.length} item tersedia
                                {selectedItems.size > 0 && (
                                    <span className="ml-2 text-blue-600 font-semibold">
                                        ({selectedItems.size} dipilih)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedItems.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold flex items-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                                Hapus ({selectedItems.size})
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-500 font-medium">
                                Live
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table - Desktop */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-12">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) =>
                                            handleSelectAll(e.target.checked)
                                        }
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                    />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Nama Stok</span>
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
                                    <span>Jumlah</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Total Cost</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Satuan</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Deskripsi Pembagian</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Terakhir Update</span>
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
                        {data.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                                    index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50/30"
                                } ${
                                    selectedItems.has(item.id)
                                        ? "bg-blue-50"
                                        : ""
                                }`}
                            >
                                <td className="px-6 py-5">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={(e) =>
                                            handleSelectItem(
                                                item.id,
                                                e.target.checked
                                            )
                                        }
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {item.name.charAt(0).toUpperCase()}
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
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryBadge(
                                            item.category
                                        )}`}
                                    >
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-bold text-gray-800">
                                        Rp{" "}
                                        {item.buyPrice.toLocaleString("id-ID")}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        per {item.unit}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {getStockIcon(item.quantity)}
                                        </span>
                                        <span
                                            className={`font-bold text-sm ${getStockStatus(
                                                item.quantity
                                            )}`}
                                        >
                                            {item.quantity}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-bold text-green-600">
                                        Rp{" "}
                                        {(
                                            parseFloat(item.buyPrice) *
                                            parseFloat(item.quantity)
                                        ).toLocaleString("id-ID")}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.quantity} × Rp{" "}
                                        {item.buyPrice.toLocaleString("id-ID")}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg text-center">
                                        {item.unit}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    {item.is_divisible &&
                                    item.division_description ? (
                                        <div className="max-w-xs">
                                            <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg mb-1">
                                                Dapat Dibagi
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {item.division_description}
                                            </div>
                                            {item.max_divisions && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Max: {item.max_divisions}{" "}
                                                    bagian
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-400 italic">
                                            Tidak dapat dibagi
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-xs text-gray-600 font-medium">
                                        {item.lastUpdated}
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-3 h-3"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                            />
                                        </svg>
                                        {item.updatedBy}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onViewHistory(item)}
                                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                            title="Lihat Histori"
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
                                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onEdit(item)}
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
                                            onClick={() => onDelete(item.id)}
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

            {/* Table - Mobile (Cards) */}
            <div className="md:hidden divide-y divide-gray-200/50">
                {data.map((item, index) => (
                    <div
                        key={item.id}
                        className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        } ${selectedItems.has(item.id) ? "bg-blue-50" : ""}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={(e) =>
                                        handleSelectItem(
                                            item.id,
                                            e.target.checked
                                        )
                                    }
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer flex-shrink-0"
                                />
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {item.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">
                                        {item.name}
                                    </h4>
                                    <div className="text-xs text-gray-500">
                                        ID: {item.id}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">
                                    {getStockIcon(item.quantity)}
                                </span>
                                <span
                                    className={`font-bold text-lg ${getStockStatus(
                                        item.quantity
                                    )}`}
                                >
                                    {item.quantity}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <span
                                className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryBadge(
                                    item.category
                                )}`}
                            >
                                {item.category}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500 mb-1">
                                    Harga Beli
                                </div>
                                <div className="font-bold text-gray-800">
                                    Rp {item.buyPrice.toLocaleString("id-ID")}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    per {item.unit}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500 mb-1">Satuan</div>
                                <div className="font-semibold text-gray-700">
                                    {item.unit}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                            <div className="text-gray-600 mb-1 text-xs font-semibold">
                                Total Cost
                            </div>
                            <div className="font-bold text-green-700 text-lg">
                                Rp{" "}
                                {(
                                    parseFloat(item.buyPrice) *
                                    parseFloat(item.quantity)
                                ).toLocaleString("id-ID")}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                                {item.quantity} × Rp{" "}
                                {item.buyPrice.toLocaleString("id-ID")}
                            </div>
                        </div>

                        {/* Deskripsi Pembagian */}
                        {item.is_divisible && item.division_description && (
                            <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <div className="text-xs font-semibold text-purple-700 mb-1">
                                    Deskripsi Pembagian
                                </div>
                                <div className="text-xs text-gray-700">
                                    {item.division_description}
                                </div>
                                {item.max_divisions && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Maksimal: {item.max_divisions} bagian
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mb-4">
                            <ConversionDisplay item={item} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                <div className="font-medium text-gray-600">
                                    {item.lastUpdated}
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-3 h-3"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                        />
                                    </svg>
                                    {item.updatedBy}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onViewHistory(item)}
                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                                    title="Lihat Histori"
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
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onEdit(item)}
                                    className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                                    title="Edit"
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
                                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                                    title="Hapus"
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
                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
                {data.map((item, index) => (
                    <div
                        key={item.id}
                        className={`border-b border-gray-200/50 last:border-b-0 ${
                            selectedItems.has(item.id) ? "bg-blue-50" : ""
                        }`}
                    >
                        <div className="p-4 hover:bg-gray-50/50 transition-colors">
                            {/* Mobile Card Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={(e) =>
                                            handleSelectItem(
                                                item.id,
                                                e.target.checked
                                            )
                                        }
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm truncate">
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(
                                                    item.category
                                                )}`}
                                            >
                                                {item.category}
                                            </span>
                                            <span
                                                className={`${getStockStatus(
                                                    item.quantity
                                                )}`}
                                            >
                                                {getStockIcon(item.quantity)}{" "}
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onViewHistory(item)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="History"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Card Details */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-gray-500 mb-1">
                                        Harga Beli
                                    </div>
                                    <div className="font-semibold text-gray-800">
                                        Rp{" "}
                                        {item.buyPrice.toLocaleString("id-ID")}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-gray-500 mb-1">
                                        Min. Stok
                                    </div>
                                    <div className="font-semibold text-gray-800">
                                        {item.minStock} {item.unit}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Card Footer */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        Terakhir update: {item.lastUpdated}
                                    </span>
                                    <span>By: {item.updatedBy}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {data.length === 0 && (
                <div className="text-center py-16 px-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-10 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                        Belum ada data stok
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                        Mulai kelola stok Anda dengan menambahkan item pertama
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>Klik tombol "Tambah Stok" untuk memulai</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StockTable;
