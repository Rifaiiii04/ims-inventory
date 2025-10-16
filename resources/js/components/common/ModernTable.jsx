import React from "react";

function ModernTable({
    title,
    subtitle,
    icon,
    iconColor = "from-blue-500 to-green-500",
    data = [],
    columns = [],
    onEdit,
    onDelete,
    onViewHistory,
    emptyStateTitle = "Belum ada data",
    emptyStateDescription = "Mulai tambahkan data untuk melihat tabel",
    emptyStateAction = "Klik tombol tambah untuk memulai",
    showActions = true,
    showHeader = true,
    className = "",
    mobileCardComponent,
    loading = false,
}) {
    const getColumnValue = (item, column) => {
        if (typeof column.accessor === "function") {
            return column.accessor(item);
        }
        return item[column.accessor];
    };

    const renderCell = (item, column, index) => {
        const value = getColumnValue(item, column);

        if (column.render) {
            return column.render(value, item, index);
        }

        return <div className="text-sm font-medium text-gray-800">{value}</div>;
    };

    const renderMobileCard = (item, index) => {
        if (mobileCardComponent) {
            return mobileCardComponent(item, index);
        }

        return (
            <div
                key={item.id || index}
                className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                            {item.name
                                ? item.name.charAt(0).toUpperCase()
                                : "#"}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">
                                {item.name || `Item #${index + 1}`}
                            </h4>
                            <div className="text-xs text-gray-500">
                                ID: {item.id || index + 1}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    {columns.slice(0, 4).map((column, colIndex) => (
                        <div
                            key={colIndex}
                            className="bg-gray-50 rounded-lg p-3"
                        >
                            <div className="text-gray-500 mb-1">
                                {column.header}
                            </div>
                            <div className="font-bold text-gray-800">
                                {getColumnValue(item, column)}
                            </div>
                        </div>
                    ))}
                </div>

                {showActions && (
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
                                onClick={() => onDelete(item.id || item)}
                                className="flex-1 py-2.5 text-red-600 bg-red-50 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
                            >
                                Hapus
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 bg-gray-200 rounded"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm ${className}`}
        >
            {showHeader && (
                <div
                    className={`bg-gradient-to-r from-blue-50 via-white to-green-50 px-6 py-5 border-b border-gray-200/50`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}
                            >
                                {icon || (
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
                                            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                                        />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {subtitle || `${data.length} item tersedia`}
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
            )}

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.header}</span>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                </th>
                            ))}
                            {showActions && (
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Aksi</span>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                        {data.map((item, index) => (
                            <tr
                                key={item.id || index}
                                className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                                    index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50/30"
                                }`}
                            >
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="px-6 py-5">
                                        {renderCell(item, column, index)}
                                    </td>
                                ))}
                                {showActions && (
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-1">
                                            {onViewHistory && (
                                                <button
                                                    onClick={() =>
                                                        onViewHistory(item)
                                                    }
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
                                            )}
                                            {onEdit && (
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
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() =>
                                                        onDelete(
                                                            item.id || item
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
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200/50">
                {data.map((item, index) => renderMobileCard(item, index))}
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
                                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                        {emptyStateTitle}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                        {emptyStateDescription}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span>{emptyStateAction}</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ModernTable;
