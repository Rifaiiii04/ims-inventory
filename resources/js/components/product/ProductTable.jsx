import React from "react";

function ProductTable({ data, onEdit, onDelete, onViewHistory }) {
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

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
            <div className="bg-gradient-to-r from-orange-50 via-white to-blue-50 px-6 py-5 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Daftar Produk
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.length} produk tersedia
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

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Produk</span>
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
                                    <span>Bahan</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Stok</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Harga</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Varian</span>
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
                                className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50/30 transition-all duration-200 ${
                                    index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50/30"
                                }`}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
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
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {getCategoryIcon(item.category)}
                                        </span>
                                        <span
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(
                                                item.category
                                            )}`}
                                        >
                                            {item.category}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-1">
                                        {item.ingredients
                                            .slice(0, 2)
                                            .map((ing, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-lg font-medium text-gray-700"
                                                >
                                                    {ing}
                                                </span>
                                            ))}
                                        {item.ingredients.length > 2 && (
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                +{item.ingredients.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-center">
                                        {item.initialStock}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-bold text-green-600">
                                        Rp{" "}
                                        {item.sellPrice.toLocaleString("id-ID")}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        per unit
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-semibold text-gray-700 bg-blue-100 px-3 py-1 rounded-lg text-center">
                                        {item.variants.length} varian
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onViewHistory(item)}
                                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                            title="Histori"
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

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200/50">
                {data.map((item, index) => (
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
                                <div className="text-xs text-gray-500">
                                    per unit
                                </div>
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
                                <div className="text-gray-500 mb-1">
                                    Stok Awal
                                </div>
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
                            <div className="text-gray-500 text-xs mb-1">
                                Bahan Baku:
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {item.ingredients
                                    .slice(0, 3)
                                    .map((ing, idx) => (
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
                            <button
                                onClick={() => onViewHistory(item)}
                                className="flex-1 py-2.5 text-blue-600 bg-blue-50 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                            >
                                Histori
                            </button>
                            <button
                                onClick={() => onEdit(item)}
                                className="flex-1 py-2.5 text-green-600 bg-green-50 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="flex-1 py-2.5 text-red-600 bg-red-50 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
                                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                        Belum ada produk
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                        Mulai kelola produk Anda dengan menambahkan item pertama
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>Klik tombol "Tambah Produk" untuk memulai</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductTable;
