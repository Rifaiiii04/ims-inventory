import React from "react";

function NotificationTable({ data, onEdit, onDelete, onToggleStatus }) {
    const getCategoryColor = (category) => {
        const colors = {
            "Bahan Utama":
                "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-sm",
            "Bahan Pokok":
                "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm",
            Sayuran:
                "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm",
            "Bumbu & Rempah":
                "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm",
            "Ikan Asin":
                "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200 shadow-sm",
            Minuman:
                "bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border border-cyan-200 shadow-sm",
        };
        return (
            colors[category] ||
            "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm"
        );
    };

    const getScheduleColor = (schedule) => {
        const colors = {
            Harian: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm",
            "2x Sehari":
                "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm",
            Mingguan:
                "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm",
        };
        return (
            colors[schedule] ||
            "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm"
        );
    };

    const getStatusBadge = (isActive) => {
        return isActive
            ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm"
            : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm";
    };

    const getStatusIcon = (isActive) => {
        return isActive ? "🔔" : "🔕";
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-6 py-5 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Daftar Notifikasi
                            </h3>
                            <p className="text-sm text-gray-500">
                                {data.length} notifikasi dikonfigurasi
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500 font-medium">
                            Live
                        </span>
                    </div>
                </div>
            </div>

            {/* Table - Desktop */}
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
                                    <span>Batas Min Stok</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Jadwal Notif</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Status</span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span>Terakhir Notif</span>
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
                                }`}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {item.productName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">
                                                {item.productName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ID: {item.id}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(
                                            item.category
                                        )}`}
                                    >
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {item.minStockLimit <= 3
                                                ? "⚠️"
                                                : "📊"}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800">
                                            {item.minStockLimit}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getScheduleColor(
                                            item.notificationSchedule
                                        )}`}
                                    >
                                        {item.notificationSchedule}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {getStatusIcon(item.isActive)}
                                        </span>
                                        <span
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(
                                                item.isActive
                                            )}`}
                                        >
                                            {item.isActive
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm text-gray-700">
                                        {item.lastNotified || "Belum pernah"}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() =>
                                                onToggleStatus(item.id)
                                            }
                                            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn ${
                                                item.isActive
                                                    ? "text-orange-600 hover:bg-orange-50"
                                                    : "text-green-600 hover:bg-green-50"
                                            }`}
                                            title={
                                                item.isActive
                                                    ? "Nonaktifkan"
                                                    : "Aktifkan"
                                            }
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
                                                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
                        className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {item.productName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800">
                                        {item.productName}
                                    </h4>
                                    <div className="text-xs text-gray-500">
                                        ID: {item.id}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">
                                        {getStatusIcon(item.isActive)}
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                            item.isActive
                                        )}`}
                                    >
                                        {item.isActive ? "Aktif" : "Nonaktif"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <span
                                className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getCategoryColor(
                                    item.category
                                )}`}
                            >
                                {item.category}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500 mb-1">
                                    Batas Min Stok
                                </div>
                                <div className="font-bold text-gray-800 flex items-center gap-1">
                                    <span>
                                        {item.minStockLimit <= 3 ? "⚠️" : "📊"}
                                    </span>
                                    <span>{item.minStockLimit}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500 mb-1">Jadwal</div>
                                <div className="font-semibold text-gray-700">
                                    {item.notificationSchedule}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-gray-500 text-xs mb-1">
                                Terakhir Notif:
                            </div>
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                {item.lastNotified || "Belum pernah"}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onToggleStatus(item.id)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                    item.isActive
                                        ? "text-orange-600 bg-orange-50 hover:bg-orange-100"
                                        : "text-green-600 bg-green-50 hover:bg-green-100"
                                }`}
                            >
                                {item.isActive ? "Nonaktifkan" : "Aktifkan"}
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
                                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                        Belum ada notifikasi
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                        Mulai konfigurasi notifikasi dengan menambahkan yang
                        pertama
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>
                            Klik tombol "Tambah Notifikasi" untuk memulai
                        </span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationTable;
