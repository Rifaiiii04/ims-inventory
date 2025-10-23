import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { useTransactionHistory } from "../../hooks/useTransaction";
import TransactionTable from "../../components/pos/TransactionTable";
import TransactionDetailModal from "../../components/pos/TransactionDetailModal";
import TransactionFilters from "../../components/pos/TransactionFilters";

function TransactionHistory() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        paymentMethod: '',
        cashierId: ''
    });

    const {
        transactions,
        loading,
        error,
        fetchHistory
    } = useTransactionHistory();

    useEffect(() => {
        fetchHistory(filters);
    }, [filters, fetchHistory]);

    const handleViewDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
    };

    const handlePrintReceipt = (transaction) => {
        // TODO: Implement print receipt
        console.log('Print receipt for transaction:', transaction);
    };

    const handleExportPDF = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.paymentMethod) params.append('payment_method', filters.paymentMethod);
            if (filters.cashierId) params.append('cashier_id', filters.cashierId);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(`/api/transactions/export/pdf?${params.toString()}`);
            if (response.data.success) {
                alert(`PDF Export: ${response.data.message}\nData tersedia: ${response.data.count} transaksi`);
            } else {
                alert('Gagal export PDF: ' + response.data.message);
            }
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert('Terjadi kesalahan saat export PDF');
        }
    };

    const handleExportExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.paymentMethod) params.append('payment_method', filters.paymentMethod);
            if (filters.cashierId) params.append('cashier_id', filters.cashierId);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(`/api/transactions/export/excel?${params.toString()}`);
            if (response.data.success) {
                alert(`Excel Export: ${response.data.message}\nData tersedia: ${response.data.count} transaksi`);
            } else {
                alert('Gagal export Excel: ' + response.data.message);
            }
        } catch (err) {
            console.error('Error exporting Excel:', err);
            alert('Terjadi kesalahan saat export Excel');
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    if (loading) {
        return (
            <>
                <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat riwayat transaksi...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Terjadi Kesalahan</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchHistory(filters)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-6 text-gray-700"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>

                {/* Sidebar */}
                <div
                    className={`fixed lg:relative lg:block z-40 transition-transform duration-300 h-full ${
                        isMobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="h-full p-3 bg-gradient-to-br from-gray-50 to-gray-100 lg:bg-transparent">
                        <Sidebar />
                    </div>
                </div>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <TopBar
                        title="Riwayat Transaksi"
                        subtitle="Lihat dan kelola riwayat transaksi"
                        showLiveIndicator={true}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <div className="space-y-6">
                            {/* Filters */}
                            <TransactionFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onExportPDF={handleExportPDF}
                                onExportExcel={handleExportExcel}
                            />

                            {/* Transaction Table */}
                            <TransactionTable
                                transactions={transactions?.data || []}
                                onViewDetail={handleViewDetail}
                                onPrintReceipt={handlePrintReceipt}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedTransaction && (
                <TransactionDetailModal
                    transaction={selectedTransaction}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}
        </>
    );
}

export default TransactionHistory;
