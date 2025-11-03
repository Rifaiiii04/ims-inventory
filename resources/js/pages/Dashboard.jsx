import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SummaryCard from "../components/dashboard/SummaryCard";
import QuickActionButton from "../components/dashboard/QuickActionButton";
import TopProductCard from "../components/dashboard/TopProductCard";
import {
    DashboardSkeleton,
    SkeletonCard,
    SkeletonProductCard,
} from "../components/common/SkeletonLoader";
import { useDashboard } from "../hooks/useDashboard";
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
    const { dashboardData, lowStockAlerts, loading, error, refreshData } =
        useDashboard();

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleQuickAction = (action) => {
        console.log(`Quick action: ${action}`);
        // TODO: Implement navigation atau modal
    };

    // Show loading state with skeleton
    if (loading && !dashboardData?.summary?.top_products) {
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
                        <TopBar
                            title="Dashboard"
                            subtitle="Ringkasan aktivitas dan performa bisnis"
                            showLiveIndicator={true}
                        />

                        {/* Content with Skeleton */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <DashboardSkeleton />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopBar
                        title="Dashboard"
                        subtitle="Error loading data"
                        showLiveIndicator={false}
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-red-600"
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Error Loading Dashboard
                            </h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={refreshData}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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

                {/* Sidebar - Desktop & Mobile Overlay */}
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

                {/* Mobile Overlay Background - Only show when menu is open AND on mobile */}
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

                {/* Main Content - Always clickable, higher z-index when menu is open */}
                <div
                    className={`flex-1 flex flex-col overflow-hidden ${
                        !isMobileMenuOpen ? "relative z-0" : "relative z-[10]"
                    }`}
                >
                    {/* Top Bar */}
                    <TopBar
                        title="Dashboard"
                        subtitle="Ringkasan aktivitas dan performa bisnis"
                        showLiveIndicator={true}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {/* Ringkasan Cepat */}
                        <div className="mb-4 sm:mb-6 lg:mb-8">
                            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                                <div className="w-1 h-4 sm:h-5 bg-green-600 rounded-full"></div>
                                Ringkasan Cepat
                            </h2>
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                    <SummaryCard
                                        title="Total Produk"
                                        value={
                                            dashboardData?.summary
                                                ?.total_products ?? 0
                                        }
                                        icon={<ProductIcon />}
                                        color="green"
                                    />
                                    <SummaryCard
                                        title="Stok Menipis"
                                        value={
                                            dashboardData?.summary?.low_stock ??
                                            0
                                        }
                                        icon={<StockIcon />}
                                        color="red"
                                        alert={
                                            dashboardData?.summary?.low_stock >
                                            0
                                                ? "Perlu restock segera!"
                                                : "Stok aman"
                                        }
                                    />
                                    <SummaryCard
                                        title="Penjualan Hari Ini"
                                        value={formatCurrency(
                                            dashboardData?.summary
                                                ?.today_sales ?? 0
                                        )}
                                        icon={<SalesIcon />}
                                        color="blue"
                                        trend="Hari ini"
                                    />
                                    <SummaryCard
                                        title="Produk Terlaris"
                                        value={
                                            dashboardData?.summary?.top_products
                                                ?.length > 0
                                                ? dashboardData.summary
                                                      .top_products[0].name
                                                : "Belum ada data"
                                        }
                                        icon={<TrendingIcon />}
                                        color="purple"
                                        trend={
                                            dashboardData?.summary?.top_products
                                                ?.length > 0
                                                ? `${dashboardData.summary.top_products[0].sold} terjual`
                                                : "30 hari terakhir"
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {/* Produk Terlaris Detail */}
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                                Produk Terlaris (30 Hari Terakhir)
                            </h2>
                            <div className="space-y-3 md:space-y-4">
                                {loading ? (
                                    <>
                                        <SkeletonProductCard />
                                        <SkeletonProductCard />
                                        <SkeletonProductCard />
                                    </>
                                ) : dashboardData?.summary?.top_products
                                      ?.length > 0 ? (
                                    dashboardData.summary.top_products.map(
                                        (product) => (
                                            <TopProductCard
                                                key={product.id || product.name}
                                                product={product}
                                            />
                                        )
                                    )
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-8 h-8 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                />
                                            </svg>
                                        </div>
                                        <p>Belum ada data penjualan</p>
                                        <p className="text-sm">
                                            Mulai catat transaksi untuk melihat
                                            produk terlaris
                                        </p>
                                    </div>
                                )}
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
