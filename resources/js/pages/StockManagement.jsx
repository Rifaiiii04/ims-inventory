import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import StockTable from "../components/stock/StockTable";
import StockFormModal from "../components/stock/StockFormModal";
import StockHistoryModal from "../components/stock/StockHistoryModal";
import LowStockAlert from "../components/stock/LowStockAlert";
import { useStock } from "../hooks/useStock";

function StockManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [selectedStockHistory, setSelectedStockHistory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Use stock hook for real data
    const { 
        stocks: stockData, 
        lowStockAlerts, 
        categories, 
        error, 
        createStock, 
        updateStock, 
        deleteStock, 
        refreshData 
    } = useStock();

    // Handle tambah stok baru
    const handleAddStock = async (newStock) => {
        const result = await createStock(newStock);
        if (result.success) {
        setShowFormModal(false);
        } else {
            alert(result.message);
        }
    };

    // Handle update stok
    const handleUpdateStock = async (updatedStock) => {
        const result = await updateStock(updatedStock.id, updatedStock);
        if (result.success) {
        setEditingStock(null);
        setShowFormModal(false);
        } else {
            alert(result.message);
        }
    };

    // Handle hapus stok
    const handleDeleteStock = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus stok ini?")) {
            const result = await deleteStock(id);
            if (!result.success) {
                alert(result.message);
            }
        }
    };

    // Handle edit stok
    const handleEditStock = (stock) => {
        setEditingStock(stock);
        setShowFormModal(true);
    };

    // Handle lihat histori
    const handleViewHistory = (stock) => {
        setSelectedStockHistory(stock);
        setShowHistoryModal(true);
    };

    // Filter stocks based on search term
    const filteredStocks = stockData.filter(stock => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            stock.name.toLowerCase().includes(searchLower) ||
            stock.category.toLowerCase().includes(searchLower) ||
            stock.unit.toLowerCase().includes(searchLower)
        );
    });

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
                        title="Pengelolaan Stok"
                        subtitle="Manajemen dan pemantauan stok bahan baku dan produk"
                        buttonText="Tambah Stok"
                        buttonIcon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                        }
                        onButtonClick={() => {
                            setEditingStock(null);
                            setShowFormModal(true);
                        }}
                        buttonColor="green"
                            showSearch={true}
                            searchValue={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Cari stok, kategori, atau satuan..."
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {/* Error State */}
                        {error && (
                            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-red-800 text-sm sm:text-base">Terjadi Kesalahan</h3>
                                        <p className="text-xs sm:text-sm text-red-600 break-words">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Low Stock Alert */}
                        {lowStockAlerts.length > 0 && (
                            <div className="mb-4 sm:mb-6">
                                <LowStockAlert items={lowStockAlerts} />
                            </div>
                        )}

                        {/* Search Results Info */}
                        {searchTerm && (
                            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span className="text-xs sm:text-sm text-blue-800 break-words">
                                        Menampilkan {filteredStocks.length} dari {stockData.length} stok untuk pencarian "{searchTerm}"
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* No Search Results */}
                        {searchTerm && filteredStocks.length === 0 && (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-2">Tidak ada hasil ditemukan</h3>
                                <p className="text-gray-500 text-xs sm:text-sm mb-4 px-4">
                                    Tidak ada stok yang cocok dengan pencarian "{searchTerm}"
                                </p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                                >
                                    Hapus Pencarian
                                </button>
                            </div>
                        )}

                        {/* Stock Table */}
                        <div className="overflow-x-auto">
                            <StockTable
                                data={filteredStocks}
                                onEdit={handleEditStock}
                                onDelete={handleDeleteStock}
                                onViewHistory={handleViewHistory}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFormModal && (
                <StockFormModal
                    stock={editingStock}
                    categories={categories}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingStock(null);
                    }}
                    onSubmit={editingStock ? handleUpdateStock : handleAddStock}
                />
            )}

            {showHistoryModal && selectedStockHistory && (
                <StockHistoryModal
                    stock={selectedStockHistory}
                    onClose={() => {
                        setShowHistoryModal(false);
                        setSelectedStockHistory(null);
                    }}
                />
            )}
        </>
    );
}

export default StockManagement;
