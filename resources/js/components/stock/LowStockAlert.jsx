import React, { useState } from "react";

function LowStockAlert({ items }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    return (
        <div className="mb-6 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border border-red-200/50 rounded-2xl shadow-lg backdrop-blur-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-red-200/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5 text-red-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-800">
                                Peringatan: Stok Menipis!
                            </h3>
                            <p className="text-sm text-red-600">
                                {items.length} item memerlukan restock segera
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title={isExpanded ? "Tutup detail" : "Lihat detail"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className={`w-4 h-4 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                }`}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Tutup peringatan"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/70 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-800 truncate">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {item.category}
                                        </p>
                                    </div>
                                    <div className="ml-3 flex-shrink-0">
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-red-600">
                                                {item.quantity}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.unit}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Kebutuhan: {item.dailyNeed} {item.unit}
                                        /hari
                                    </div>
                                    <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                        Stok Rendah
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
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
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                            Restock Sekarang
                        </button>
                        <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
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
                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                                />
                            </svg>
                            Buat Laporan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LowStockAlert;
