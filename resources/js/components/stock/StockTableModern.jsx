import React from "react";
import ModernTable from "../common/ModernTable";

function StockTableModern({ data, onEdit, onDelete, onViewHistory }) {
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

    const columns = [
        {
            header: "Nama Stok",
            accessor: "name",
            render: (value, item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                        {value.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-sm">
                            {value}
                        </div>
                        <div className="text-xs text-gray-500">
                            ID: {item.id}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Kategori",
            accessor: "category",
            render: (value) => (
                <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryBadge(
                        value
                    )}`}
                >
                    {value}
                </span>
            ),
        },
        {
            header: "Harga Beli",
            accessor: "buyPrice",
            render: (value, item) => (
                <div>
                    <div className="text-sm font-bold text-gray-800">
                        Rp {value.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-gray-500">per {item.unit}</div>
                </div>
            ),
        },
        {
            header: "Jumlah",
            accessor: "quantity",
            render: (value) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg">{getStockIcon(value)}</span>
                    <span
                        className={`font-bold text-sm ${getStockStatus(value)}`}
                    >
                        {value}
                    </span>
                </div>
            ),
        },
        {
            header: "Total Cost",
            accessor: "totalCost",
            render: (value, item) => (
                <div>
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
                </div>
            ),
        },
        {
            header: "Satuan",
            accessor: "unit",
            render: (value) => (
                <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg text-center">
                    {value}
                </div>
            ),
        },
        {
            header: "Terakhir Update",
            accessor: "lastUpdated",
            render: (value, item) => (
                <div>
                    <div className="text-xs text-gray-600 font-medium">
                        {value}
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
                </div>
            ),
        },
    ];

    const mobileCardComponent = (item, index) => (
        <div
            key={item.id}
            className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                        {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-800">
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
                    <div className="text-gray-500 mb-1">Harga Beli</div>
                    <div className="font-bold text-gray-800">
                        Rp {item.buyPrice.toLocaleString("id-ID")}
                    </div>
                    <div className="text-gray-500 text-xs">per {item.unit}</div>
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
                        parseFloat(item.buyPrice) * parseFloat(item.quantity)
                    ).toLocaleString("id-ID")}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                    {item.quantity} × Rp {item.buyPrice.toLocaleString("id-ID")}
                </div>
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
                    {onViewHistory && (
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
                    )}
                    {onEdit && (
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
                    )}
                    {onDelete && (
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
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <ModernTable
            title="Daftar Stok"
            subtitle={`${data.length} item tersedia`}
            iconColor="from-blue-500 to-green-500"
            data={data}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewHistory={onViewHistory}
            emptyStateTitle="Belum ada data stok"
            emptyStateDescription="Mulai kelola stok Anda dengan menambahkan item pertama"
            emptyStateAction="Klik tombol 'Tambah Stok' untuk memulai"
            mobileCardComponent={mobileCardComponent}
        />
    );
}

export default StockTableModern;
