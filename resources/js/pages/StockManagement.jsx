import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import StockTable from "../components/stock/StockTable";
import StockFormModal from "../components/stock/StockFormModal";
import StockHistoryModal from "../components/stock/StockHistoryModal";
import LowStockAlert from "../components/stock/LowStockAlert";

function StockManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [selectedStockHistory, setSelectedStockHistory] = useState(null);

    // Data stok berdasarkan observasi Kedai Angkringan Prasmanan
    const [stockData, setStockData] = useState([
        {
            id: 1,
            name: "Ayam Utuh",
            category: "Bahan Utama",
            buyPrice: 25000,
            quantity: 3,
            unit: "ekor",
            dailyNeed: 3,
            conversion: "12 item (4 bagian per ekor)",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 2,
            name: "Lele",
            category: "Bahan Utama",
            buyPrice: 8000,
            quantity: 10,
            unit: "ekor",
            dailyNeed: 10,
            conversion: "10 porsi",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 3,
            name: "Nila",
            category: "Bahan Utama",
            buyPrice: 12000,
            quantity: 8,
            unit: "ekor",
            dailyNeed: 8,
            conversion: "8 porsi",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 4,
            name: "Cumi",
            category: "Bahan Utama",
            buyPrice: 45000,
            quantity: 1,
            unit: "kg",
            dailyNeed: 1,
            conversion: "30 tusuk sate",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 5,
            name: "Beras",
            category: "Bahan Pokok",
            buyPrice: 12000,
            quantity: 10,
            unit: "liter",
            dailyNeed: 10,
            conversion: "120 porsi nasi",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 6,
            name: "Tahu Bumbu Kuning",
            category: "Bahan Pokok",
            buyPrice: 3000,
            quantity: 25,
            unit: "bijik",
            dailyNeed: 25,
            conversion: "25 item",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 7,
            name: "Tempe Bumbu Kuning",
            category: "Bahan Pokok",
            buyPrice: 3000,
            quantity: 25,
            unit: "bijik",
            dailyNeed: 25,
            conversion: "25 item",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 8,
            name: "Tempe Bacem",
            category: "Bahan Pokok",
            buyPrice: 3000,
            quantity: 25,
            unit: "bijik",
            dailyNeed: 25,
            conversion: "25 tusuk",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 9,
            name: "Tahu Bacem",
            category: "Bahan Pokok",
            buyPrice: 3000,
            quantity: 25,
            unit: "bijik",
            dailyNeed: 25,
            conversion: "25 tusuk",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 10,
            name: "Bumbu Halus",
            category: "Bumbu & Rempah",
            buyPrice: 15000,
            quantity: 1,
            unit: "kg",
            dailyNeed: 0.33,
            conversion: "Untuk olahan",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 11,
            name: "Rempah Kering",
            category: "Bumbu & Rempah",
            buyPrice: 25000,
            quantity: 500,
            unit: "gr",
            dailyNeed: 166.67,
            conversion: "Bawang kering, cabai kering",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 12,
            name: "Kangkung",
            category: "Sayuran",
            buyPrice: 5000,
            quantity: 5,
            unit: "ikat",
            dailyNeed: 5,
            conversion: "10 porsi tumis",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 13,
            name: "Terong",
            category: "Sayuran",
            buyPrice: 8000,
            quantity: 10,
            unit: "buah",
            dailyNeed: 10,
            conversion: "10 porsi tumis",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 14,
            name: "Timun",
            category: "Sayuran",
            buyPrice: 5000,
            quantity: 5,
            unit: "buah",
            dailyNeed: 5,
            conversion: "10 porsi receuh",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 15,
            name: "Ikan Asin Japuh",
            category: "Ikan Asin",
            buyPrice: 35000,
            quantity: 0.5,
            unit: "kg",
            dailyNeed: 0.5,
            conversion: "10 porsi",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 16,
            name: "Ikan Asin Peda",
            category: "Ikan Asin",
            buyPrice: 40000,
            quantity: 0.5,
            unit: "kg",
            dailyNeed: 0.5,
            conversion: "10 porsi",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 17,
            name: "Ikan Asin Pindang",
            category: "Ikan Asin",
            buyPrice: 38000,
            quantity: 0.5,
            unit: "kg",
            dailyNeed: 0.5,
            conversion: "10 porsi",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 18,
            name: "Teh",
            category: "Minuman",
            buyPrice: 25000,
            quantity: 100,
            unit: "gr",
            dailyNeed: 100,
            conversion: "50 gelas es teh",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 19,
            name: "Jeruk",
            category: "Minuman",
            buyPrice: 15000,
            quantity: 10,
            unit: "buah",
            dailyNeed: 10,
            conversion: "10 gelas es jeruk",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 20,
            name: "Es Batu",
            category: "Minuman",
            buyPrice: 5000,
            quantity: 2,
            unit: "bal",
            dailyNeed: 2,
            conversion: "Untuk minuman",
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
    ]);

    // Stok menipis (threshold 10)
    const lowStockItems = stockData.filter((item) => item.quantity < 10);

    // Handle tambah stok baru
    const handleAddStock = (newStock) => {
        const stock = {
            ...newStock,
            id: stockData.length + 1,
            lastUpdated: new Date().toISOString().split("T")[0],
            updatedBy: "Admin", // TODO: Get from auth
        };
        setStockData([...stockData, stock]);
        setShowFormModal(false);
    };

    // Handle update stok
    const handleUpdateStock = (updatedStock) => {
        setStockData(
            stockData.map((item) =>
                item.id === updatedStock.id
                    ? {
                          ...updatedStock,
                          lastUpdated: new Date().toISOString().split("T")[0],
                          updatedBy: "Admin",
                      }
                    : item
            )
        );
        setEditingStock(null);
        setShowFormModal(false);
    };

    // Handle hapus stok
    const handleDeleteStock = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus stok ini?")) {
            setStockData(stockData.filter((item) => item.id !== id));
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

    return (
        <>
            <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
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
                    className={`fixed md:relative md:block z-40 transition-transform duration-300 h-full ${
                        isMobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full md:translate-x-0"
                    }`}
                >
                    <div className="h-full p-3 bg-gradient-to-br from-gray-50 to-gray-100 md:bg-transparent">
                        <Sidebar />
                    </div>
                </div>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
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
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Low Stock Alert */}
                        {lowStockItems.length > 0 && (
                            <LowStockAlert items={lowStockItems} />
                        )}

                        {/* Stock Table */}
                        <StockTable
                            data={stockData}
                            onEdit={handleEditStock}
                            onDelete={handleDeleteStock}
                            onViewHistory={handleViewHistory}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFormModal && (
                <StockFormModal
                    stock={editingStock}
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
