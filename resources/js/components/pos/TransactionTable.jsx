import React from "react";

function TransactionTable({ transactions, onViewDetail, onPrintReceipt }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodBadge = (method) => {
        const methods = {
            'cash': { label: 'Tunai', color: 'bg-green-100 text-green-700 border-green-200' },
            'qris': { label: 'QRIS', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'lainnya': { label: 'Transfer', color: 'bg-purple-100 text-purple-700 border-purple-200' }
        };
        
        const methodInfo = methods[method] || { label: method, color: 'bg-gray-100 text-gray-700 border-gray-200' };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${methodInfo.color}`}>
                {methodInfo.label}
            </span>
        );
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum Ada Transaksi</h3>
                    <p className="text-gray-500">Belum ada transaksi yang tercatat</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Riwayat Transaksi</h3>
                            <p className="text-sm text-gray-500">{transactions.length} transaksi ditemukan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                No. Transaksi
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Waktu
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Metode
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Kasir
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {transactions.map((transaction, index) => (
                            <tr
                                key={transaction.id_transaksi}
                                className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                }`}
                            >
                                <td className="px-6 py-5">
                                    <div className="font-bold text-gray-800 text-sm">
                                        TRX{transaction.id_transaksi}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm text-gray-700">
                                        {formatDate(transaction.tanggal_waktu)}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="font-bold text-green-600">
                                        {formatPrice(transaction.total_transaksi)}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    {getPaymentMethodBadge(transaction.metode_bayar)}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm text-gray-700">
                                        {transaction.user?.nama_user || 'Unknown'}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onViewDetail(transaction)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Lihat Detail"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onPrintReceipt(transaction)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Cetak Struk"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
            <div className="lg:hidden divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                    <div
                        key={transaction.id_transaksi}
                        className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">
                                    TRX{transaction.id_transaksi}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {formatDate(transaction.tanggal_waktu)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600 text-sm">
                                    {formatPrice(transaction.total_transaksi)}
                                </p>
                                {getPaymentMethodBadge(transaction.metode_bayar)}
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="text-xs text-gray-500">Kasir:</p>
                            <p className="text-sm text-gray-700">
                                {transaction.user?.nama_user || 'Unknown'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onViewDetail(transaction)}
                                className="flex-1 py-2 text-blue-600 bg-blue-50 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                            >
                                Lihat Detail
                            </button>
                            <button
                                onClick={() => onPrintReceipt(transaction)}
                                className="flex-1 py-2 text-green-600 bg-green-50 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"
                            >
                                Cetak Struk
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TransactionTable;
