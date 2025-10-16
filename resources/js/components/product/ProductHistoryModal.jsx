import React from "react";

function ProductHistoryModal({ product, onClose }) {
    const historyData = [
        {
            id: 1,
            action: "Tambah Produk",
            details: "Produk dibuat",
            date: "2025-10-11 10:30",
            user: "Admin",
        },
        {
            id: 2,
            action: "Update Harga",
            details: `Rp ${product.sellPrice.toLocaleString("id-ID")}`,
            date: "2025-10-10 14:20",
            user: "Staff1",
        },
        {
            id: 3,
            action: "Update Stok",
            details: `Stok: ${product.initialStock}`,
            date: "2025-10-09 09:15",
            user: "Admin",
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold mb-1">
                                Histori Perubahan
                            </h2>
                            <p className="text-blue-50 text-sm">
                                {product.name}
                            </p>
                        </div>
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

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {historyData.map((history, index) => (
                            <div
                                key={history.id}
                                className="flex gap-4 relative pb-4 border-b border-gray-100 last:border-0"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-green-600 rounded-full border-4 border-green-100"></div>
                                    {index !== historyData.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-gray-800">
                                        {history.action}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        {history.date} • {history.user}
                                    </p>
                                    <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mt-2">
                                        {history.details}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductHistoryModal;
