import React from "react";
import ModernTable from "../common/ModernTable";

function ProductTableModern({ data, onEdit, onDelete, onViewHistory }) {
    const getCategoryColor = (category) => {
        const colors = {
            Makanan:
                "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 shadow-sm",
            Minuman:
                "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm",
            Snack: "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm",
        };
        return (
            colors[category] ||
            "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm"
        );
    };

    const getCategoryIcon = (category) => {
        const icons = {
            Makanan: "🍽️",
            Minuman: "🥤",
            Snack: "🍿",
        };
        return icons[category] || "📦";
    };

    const columns = [
        {
            header: "Produk",
            accessor: "name",
            render: (value, item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
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
                <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(value)}</span>
                    <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(
                            value
                        )}`}
                    >
                        {value}
                    </span>
                </div>
            ),
        },
        {
            header: "Bahan",
            accessor: "ingredients",
            render: (value) => (
                <div className="flex flex-wrap gap-1">
                    {value.slice(0, 2).map((ing, idx) => (
                        <span
                            key={idx}
                            className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-lg font-medium text-gray-700"
                        >
                            {ing}
                        </span>
                    ))}
                    {value.length > 2 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            +{value.length - 2}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: "Stok",
            accessor: "initialStock",
            render: (value) => (
                <div className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-center">
                    {value}
                </div>
            ),
        },
        {
            header: "Harga",
            accessor: "sellPrice",
            render: (value) => (
                <div>
                    <div className="text-sm font-bold text-green-600">
                        Rp {value.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-gray-500">per unit</div>
                </div>
            ),
        },
        {
            header: "Varian",
            accessor: "variants",
            render: (value) => (
                <div className="text-sm font-semibold text-gray-700 bg-blue-100 px-3 py-1 rounded-lg text-center">
                    {value.length} varian
                </div>
            ),
        },
    ];

    const mobileCardComponent = (item, index) => (
        <div
            key={item.id}
            className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50/30 transition-all duration-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm">
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
                <div className="text-right">
                    <div className="text-base font-bold text-green-600">
                        Rp {item.sellPrice.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-gray-500">per unit</div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                        {getCategoryIcon(item.category)}
                    </span>
                    <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(
                            item.category
                        )}`}
                    >
                        {item.category}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 mb-1">Stok Awal</div>
                    <div className="font-bold text-gray-800">
                        {item.initialStock}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 mb-1">Varian</div>
                    <div className="font-semibold text-gray-700">
                        {item.variants.length} varian
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <div className="text-gray-500 text-xs mb-1">Bahan Baku:</div>
                <div className="flex flex-wrap gap-1">
                    {item.ingredients.slice(0, 3).map((ing, idx) => (
                        <span
                            key={idx}
                            className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-lg font-medium text-gray-700"
                        >
                            {ing}
                        </span>
                    ))}
                    {item.ingredients.length > 3 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            +{item.ingredients.length - 3}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                {onViewHistory && (
                    <button
                        onClick={() => onViewHistory(item)}
                        className="flex-1 py-2.5 text-blue-600 bg-blue-50 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                        Histori
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 py-2.5 text-green-600 bg-green-50 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors"
                    >
                        Edit
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(item.id)}
                        className="flex-1 py-2.5 text-red-600 bg-red-50 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                        Hapus
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <ModernTable
            title="Daftar Produk"
            subtitle={`${data.length} produk tersedia`}
            iconColor="from-orange-500 to-blue-500"
            data={data}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewHistory={onViewHistory}
            emptyStateTitle="Belum ada produk"
            emptyStateDescription="Mulai kelola produk Anda dengan menambahkan item pertama"
            emptyStateAction="Klik tombol 'Tambah Produk' untuk memulai"
            mobileCardComponent={mobileCardComponent}
        />
    );
}

export default ProductTableModern;
