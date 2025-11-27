import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { useTransactionHistory } from "../../hooks/useTransaction";
import TransactionTable from "../../components/pos/TransactionTable";
import TransactionDetailModal from "../../components/pos/TransactionDetailModal";
import TransactionFilters from "../../components/pos/TransactionFilters";
import MobileSidebarToggle from "../../components/sidebar/MobileSidebarToggle";

function TransactionHistory() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        paymentMethod: "",
        cashierId: "",
    });

    const { transactions, loading, error, fetchHistory } =
        useTransactionHistory();

    useEffect(() => {
        fetchHistory(filters);
    }, [filters, fetchHistory]);

    const handleViewDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
    };

    const handlePrintReceipt = async (transaction) => {
        try {
            // Fetch receipt HTML from API
            const response = await axios.get(
                `/api/transactions/${transaction.id_transaksi}/print`,
                {
                    responseType: "text",
                }
            );

            // Open HTML in new window for printing
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(response.data);
                printWindow.document.close();
                // Auto trigger print dialog
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            } else {
                alert("Popup diblokir. Silakan izinkan popup untuk situs ini.");
            }
        } catch (err) {
            console.error("Error printing receipt:", err);
            alert("Terjadi kesalahan saat mencetak struk. Silakan coba lagi.");
        }
    };

    const handleExportPDF = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate)
                params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);
            if (filters.paymentMethod)
                params.append("payment_method", filters.paymentMethod);
            if (filters.cashierId)
                params.append("cashier_id", filters.cashierId);
            if (filters.search) params.append("search", filters.search);

            // Backend returns HTML that can be printed as PDF
            const response = await axios.get(
                `/api/transactions/export/pdf?${params.toString()}`,
                {
                    responseType: "text",
                }
            );

            // Open HTML in new window for printing
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(response.data);
                printWindow.document.close();
                // Auto trigger print dialog
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            } else {
                alert("Popup diblokir. Silakan izinkan popup untuk situs ini.");
            }
        } catch (err) {
            console.error("Error exporting PDF:", err);
            alert("Terjadi kesalahan saat export PDF. Silakan coba lagi.");
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    // Show loading only if no transactions loaded (initial load)
    if (loading && (!transactions || transactions.data?.length === 0)) {
        return (
            <>
                <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                        <TopBar
                            title="Riwayat Transaksi"
                            subtitle="Lihat dan kelola riwayat transaksi"
                            showLiveIndicator={true}
                        />
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">
                                    Memuat riwayat transaksi...
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Mohon tunggu sebentar
                                </p>
                            </div>
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
                                <svg
                                    className="w-6 h-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                Terjadi Kesalahan
                            </h3>
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
                <MobileSidebarToggle
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

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

                {/* Mobile Overlay - Only show when menu is open AND on mobile */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[30] lg:hidden transition-opacity duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                        }}
                    />
                )}

                {/* Main Content - Always clickable, higher z-index */}
                <div
                    className={`flex-1 flex flex-col overflow-hidden ${
                        !isMobileMenuOpen ? "relative z-0" : "relative z-[10]"
                    }`}
                >
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
