import React, { useState } from "react";

function TransactionFilters({ filters, onFilterChange, onExportPDF, onExportExcel }) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        onFilterChange({ search: searchTerm });
    };

    const handleDateChange = (field, value) => {
        onFilterChange({ [field]: value });
    };

    const handleMethodChange = (method) => {
        onFilterChange({ paymentMethod: method });
    };

    const clearFilters = () => {
        setSearchTerm("");
        onFilterChange({
            startDate: '',
            endDate: '',
            paymentMethod: '',
            search: ''
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(price);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Filter & Export</h3>
                            <p className="text-sm text-gray-500">Saring dan ekspor data transaksi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Content */}
            <div className="p-6 space-y-6">
                {/* Search */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pencarian
                    </label>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari berdasarkan nomor transaksi, kasir, atau metode pembayaran..."
                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <svg
                                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tanggal Mulai
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tanggal Akhir
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Payment Method Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Metode Pembayaran
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleMethodChange('')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filters.paymentMethod === ''
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => handleMethodChange('cash')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filters.paymentMethod === 'cash'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            💵 Tunai
                        </button>
                        <button
                            onClick={() => handleMethodChange('qris')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filters.paymentMethod === 'qris'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            📱 QRIS
                        </button>
                        <button
                            onClick={() => handleMethodChange('lainnya')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filters.paymentMethod === 'lainnya'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            🏦 Transfer
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                    >
                        Reset Filter
                    </button>
                    <button
                        onClick={onExportPDF}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export PDF
                    </button>
                    <button
                        onClick={onExportExcel}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Excel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TransactionFilters;
