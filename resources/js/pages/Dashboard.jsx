import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SummaryCard from "../components/dashboard/SummaryCard";
import QuickActionButton from "../components/dashboard/QuickActionButton";
import TopProductCard from "../components/dashboard/TopProductCard";
import {
    ProductIcon,
    StockIcon,
    SalesIcon,
    TrendingIcon,
    PlusIcon,
    ReportIcon,
} from "../components/dashboard/DashboardIcons";

function Dashboard() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data dashboard berdasarkan observasi Kedai Angkringan Prasmanan
    const summaryData = {
        totalProducts: 22,
        lowStock: 8,
        todaySales: 1250000,
        topProducts: [
            { id: 1, name: "Ayam Bakar", sold: 45, revenue: 765000 },
            { id: 2, name: "Nasi", sold: 89, revenue: 445000 },
            { id: 3, name: "Es Teh Manis", sold: 67, revenue: 335000 },
            { id: 4, name: "Lele Goreng", sold: 28, revenue: 280000 },
            { id: 5, name: "Tusukan (Sate-satean)", sold: 45, revenue: 135000 },
        ],
    };

    const handleQuickAction = (action) => {
        console.log(`Quick action: ${action}`);
        // TODO: Implement navigation atau modal
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

                {/* Sidebar - Desktop & Mobile Overlay */}
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

                {/* Mobile Overlay Background */}
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
                        title="Dashboard"
                        subtitle="Ringkasan aktivitas dan performa bisnis"
                        showLiveIndicator={true}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Ringkasan Cepat */}
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                                Ringkasan Cepat
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <SummaryCard
                                    title="Total Produk"
                                    value={summaryData.totalProducts}
                                    icon={<ProductIcon />}
                                    color="green"
                                />
                                <SummaryCard
                                    title="Stok Menipis"
                                    value={summaryData.lowStock}
                                    icon={<StockIcon />}
                                    color="red"
                                    alert="Perlu restock segera!"
                                />
                                <SummaryCard
                                    title="Penjualan Hari Ini"
                                    value={`Rp ${summaryData.todaySales.toLocaleString(
                                        "id-ID"
                                    )}`}
                                    icon={<SalesIcon />}
                                    color="blue"
                                    trend="+12% dari kemarin"
                                />
                                <SummaryCard
                                    title="Produk Terlaris"
                                    value={summaryData.topProducts[0].name}
                                    icon={<TrendingIcon />}
                                    color="purple"
                                    trend={`${summaryData.topProducts[0].sold} terjual`}
                                />
                            </div>
                        </div>

                        {/* Produk Terlaris Detail */}
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                                Produk Terlaris Hari Ini
                            </h2>
                            <div className="space-y-3 md:space-y-4">
                                {summaryData.topProducts.map((product) => (
                                    <TopProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Aksi Cepat */}
                        <div className="mb-6">
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                                Aksi Cepat
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                <QuickActionButton
                                    icon={<PlusIcon />}
                                    label="Tambah Produk"
                                    onClick={() =>
                                        handleQuickAction("add-product")
                                    }
                                    variant="primary"
                                />
                                <QuickActionButton
                                    icon={<StockIcon />}
                                    label="Tambah Stok"
                                    onClick={() =>
                                        handleQuickAction("add-stock")
                                    }
                                    variant="outline"
                                />
                                <QuickActionButton
                                    icon={<ReportIcon />}
                                    label="Lihat Laporan Penjualan"
                                    onClick={() =>
                                        handleQuickAction("view-report")
                                    }
                                    variant="secondary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
