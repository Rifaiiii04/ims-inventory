import React, { useState, useEffect } from "react";
import axios from "axios";

function StockHistoryModal({ stock, onClose }) {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (stock?.id) {
            fetchHistory();
        }
    }, [stock]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`/api/stocks/${stock.id}/history`);
            if (response.data.success) {
                setHistoryData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil history');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'create':
                return (
                    <div className="w-3 h-3 bg-green-600 rounded-full border-4 border-green-100"></div>
                );
            case 'update':
                return (
                    <div className="w-3 h-3 bg-blue-600 rounded-full border-4 border-blue-100"></div>
                );
            case 'delete':
                return (
                    <div className="w-3 h-3 bg-red-600 rounded-full border-4 border-red-100"></div>
                );
            default:
                return (
                    <div className="w-3 h-3 bg-gray-600 rounded-full border-4 border-gray-100"></div>
                );
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'create':
                return 'text-green-600';
            case 'update':
                return 'text-blue-600';
            case 'delete':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold mb-1">
                                Histori Perubahan
                            </h2>
                            <p className="text-blue-50 text-sm">{stock.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
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

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat history...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-800">Terjadi Kesalahan</h3>
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Data */}
                    {!loading && !error && (
                        <div className="space-y-4">
                            {historyData.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada history</h3>
                                    <p className="text-gray-500 text-sm">Belum ada perubahan yang tercatat untuk stok ini</p>
                                </div>
                            ) : (
                                historyData.map((history, index) => (
                                    <div
                                        key={history.id}
                                        className="flex gap-4 relative pb-4 border-b border-gray-100 last:border-0"
                                    >
                                        {/* Timeline dot */}
                                        <div className="flex flex-col items-center">
                                            {getActionIcon(history.action)}
                                            {index !== historyData.length - 1 && (
                                                <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className={`font-bold text-sm ${getActionColor(history.action)}`}>
                                                        {history.action_display}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {history.created_at} • {history.user_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {history.created_at_human}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Description */}
                                            {history.description && (
                                                <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mb-2">
                                                    {history.description}
                                                </p>
                                            )}

                                            {/* Changes Detail */}
                                            {history.changes && history.changes.length > 0 && (
                                                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                                                    <p className="text-xs font-semibold text-blue-800 mb-1">Detail Perubahan:</p>
                                                    {history.changes.map((change, idx) => (
                                                        <p key={idx} className="text-xs text-blue-700">
                                                            {change.formatted_change}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors text-sm"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StockHistoryModal;
