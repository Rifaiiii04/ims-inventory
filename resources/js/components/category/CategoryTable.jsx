import React from "react";

function CategoryTable({ data, onEdit, onDelete }) {
    const getCategoryIcon = (name) => {
        const icons = {
            Makanan: "🍽️",
            Minuman: "🥤",
            Snack: "🍿",
            Dessert: "🍰",
            Appetizer: "🥗",
        };
        return icons[name] || "📦";
    };

    const getCategoryColor = (name) => {
        const colors = {
            Makanan: "from-orange-100 to-orange-200 text-orange-700",
            Minuman: "from-blue-100 to-blue-200 text-blue-700",
            Snack: "from-purple-100 to-purple-200 text-purple-700",
            Dessert: "from-pink-100 to-pink-200 text-pink-700",
            Appetizer: "from-green-100 to-green-200 text-green-700",
        };
        return colors[name] || "from-gray-100 to-gray-200 text-gray-700";
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
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
                                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 6h.008v.008H6V6z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Daftar Kategori
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.length} kategori tersedia
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
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Nama Kategori</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Jumlah Produk</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Deskripsi</span>
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
                                className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30 transition-all duration-200 ${
                                    index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50/30"
                                }`}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 bg-gradient-to-br ${getCategoryColor(
                                                item.name
                                            )} rounded-lg flex items-center justify-center font-bold text-sm`}
                                        >
                                            {getCategoryIcon(item.name)}
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
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm">
                                        {item.productCount} produk
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm text-gray-600 max-w-xs">
                                        {item.description}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-1">
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
            <div className="md:hidden divide-y divide-gray-200/50">
                {data.map((item, index) => (
                    <div
                        key={item.id}
                        className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30 transition-all duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(
                                        item.name
                                    )} rounded-xl flex items-center justify-center font-bold text-sm`}
                                >
                                    {getCategoryIcon(item.name)}
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
                            <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm">
                                {item.productCount} produk
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            {item.description}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(item)}
                                className="flex-1 py-2.5 bg-green-50 text-green-600 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
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
                                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 6h.008v.008H6V6z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                        Belum ada kategori
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                        Mulai kelola kategori produk Anda dengan menambahkan
                        kategori pertama
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>Klik tombol "Tambah Kategori" untuk memulai</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryTable;
