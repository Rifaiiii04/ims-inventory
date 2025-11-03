import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useSalesReport } from "../hooks/useSalesReport";
import { ReportPageSkeleton } from "../components/common/SkeletonLoader";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

function SalesReport() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("daily");
    const [filterProduct, setFilterProduct] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterPayment, setFilterPayment] = useState("");

    // Use sales report hook for real data
    const {
        reportData: salesData,
        products,
        categories,
        loading,
        error,
        fetchSalesReport,
        exportPDF,
    } = useSalesReport();

    // Handle filter changes
    const handleFilterChange = useCallback(() => {
        fetchSalesReport({
            product: filterProduct,
            category: filterCategory,
            date: filterDate,
            payment: filterPayment,
            period: activeTab,
        });
    }, [
        filterProduct,
        filterCategory,
        filterDate,
        filterPayment,
        activeTab,
        fetchSalesReport,
    ]);

    // Auto-refresh when filters or period change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleFilterChange();
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [
        filterProduct,
        filterCategory,
        filterDate,
        filterPayment,
        activeTab,
        handleFilterChange,
    ]);

    // Silent auto-refresh every 30 seconds in background (without loading state)
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            // Silent refresh with current filters - update data without showing loading state
            fetchSalesReport(
                {
                    product: filterProduct,
                    category: filterCategory,
                    date: filterDate,
                    payment: filterPayment,
                    period: activeTab,
                },
                true
            ); // Silent mode
        }, 30000); // Refresh every 30 seconds

        return () => {
            clearInterval(refreshInterval);
        };
    }, [
        filterProduct,
        filterCategory,
        filterDate,
        filterPayment,
        activeTab,
        fetchSalesReport,
    ]);

    // Handle export function
    const handleExportPDF = async () => {
        const result = await exportPDF({
            product: filterProduct,
            category: filterCategory,
            date: filterDate,
            payment: filterPayment,
            period: activeTab,
        });

        if (!result.success) {
            alert(result.message);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg"
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
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>

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

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Laporan Penjualan"
                        subtitle="Analisis data penjualan dan performa produk"
                    />
                    <div className="flex-1 overflow-y-auto p-6">
                        <ReportPageSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex h-screen bg-gray-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg"
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
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>

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

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Laporan Penjualan"
                        subtitle="Analisis data penjualan dan performa produk"
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Terjadi Kesalahan
                            </h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchSalesReport()}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show empty state if no data
    if (!salesData) {
        return (
            <div className="flex h-screen bg-gray-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg"
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
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>

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

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Laporan Penjualan"
                        subtitle="Analisis data penjualan dan performa produk"
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-gray-400 text-6xl mb-4">
                                📊
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Belum Ada Data
                            </h3>
                            <p className="text-gray-600">
                                Tidak ada data penjualan yang tersedia untuk
                                ditampilkan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Chart colors
    const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Menu Toggle Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg"
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

            {/* Mobile Menu Overlay */}
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
                    title="Laporan Penjualan"
                    subtitle="Analisis data penjualan dan performa produk"
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Loading State - Show skeleton if loading and no data */}
                    {loading &&
                        (!salesData || !salesData.summary) &&
                        !error && <ReportPageSkeleton />}

                    {/* Filters & Content */}
                    {!loading && (
                        <>
                            {/* Filters */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Filter Laporan
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Sesuaikan periode dan kriteria
                                            laporan
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-gray-500 font-medium">
                                            Auto-refresh
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Produk
                                        </label>
                                        <select
                                            value={filterProduct}
                                            onChange={(e) =>
                                                setFilterProduct(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">
                                                Semua Produk
                                            </option>
                                            {products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kategori
                                        </label>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) =>
                                                setFilterCategory(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">
                                                Semua Kategori
                                            </option>
                                            {Array.isArray(categories) &&
                                                categories.map((category) => (
                                                    <option
                                                        key={
                                                            category.id ||
                                                            category.id_kategori
                                                        }
                                                        value={
                                                            category.id ||
                                                            category.id_kategori
                                                        }
                                                    >
                                                        {category.name ||
                                                            category.nama_kategori}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={filterDate}
                                            onChange={(e) =>
                                                setFilterDate(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Metode Pembayaran
                                        </label>
                                        <select
                                            value={filterPayment}
                                            onChange={(e) =>
                                                setFilterPayment(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">
                                                Semua Metode
                                            </option>
                                            <option value="Tunai">Tunai</option>
                                            <option value="QRIS">QRIS</option>
                                            <option value="Transfer">
                                                Transfer
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleFilterChange}
                                            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            Terapkan Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6 pt-6 border-t mb-5 border-gray-200 gap-3">
                                <button
                                    onClick={handleFilterChange}
                                    className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg"
                                    title="Refresh data"
                                >
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
                                            d="M16.023 9.348h4.992v-.001M2.25 18.002h9.75v-1.337c0-.873-.464-1.697-1.228-2.15a2.916 2.916 0 01.778-4.414 2.92 2.92 0 01-.778-4.414c.764-.453 1.228-1.277 1.228-2.15V5.251c0-1.104-.896-2-2-2H3.75c-1.104 0-2 .896-2 2v.001a2.916 2.916 0 00.778 4.414 2.92 2.92 0 00-.778 4.414c.764.453 1.228 1.277 1.228 2.15v1.337c0 1.104.896 2 2 2h2.25z"
                                        />
                                    </svg>
                                    Refresh
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg"
                                >
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
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                        />
                                    </svg>
                                    Export PDF
                                </button>
                            </div>
                            {/* </div> */}

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border-2 border-green-200 p-6 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 mt-5">
                                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                                                Total Transaksi
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mb-1">
                                                {salesData.summary
                                                    ?.total_transactions || 0}
                                            </p>
                                            <p className="text-xs text-green-600 font-medium">
                                                Semua periode
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                                            <svg
                                                className="w-8 h-8 text-green-600"
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
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border-2 border-blue-200 p-6 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                                                Total Pendapatan
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 mb-1 break-words">
                                                {formatCurrency(
                                                    salesData.summary
                                                        ?.total_revenue || 0
                                                )}
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium">
                                                Revenue total
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                                            <svg
                                                className="w-8 h-8 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg border-2 border-yellow-200 p-6 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">
                                                Produk Terjual
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mb-1">
                                                {salesData.summary
                                                    ?.total_products_sold || 0}
                                            </p>
                                            <p className="text-xs text-yellow-600 font-medium">
                                                Item terjual
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                                            <svg
                                                className="w-8 h-8 text-yellow-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                                                Produk Terlaris
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                                {salesData.summary
                                                    ?.top_product ||
                                                    "Tidak ada data"}
                                            </p>
                                            <p className="text-xs text-purple-600 font-medium">
                                                Best seller
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                                            <svg
                                                className="w-8 h-8 text-purple-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Revenue Chart */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Grafik Pendapatan
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Tren pendapatan & transaksi
                                            </p>
                                        </div>
                                    </div>
                                    {/* Period Tabs */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Periode Laporan
                                        </label>
                                        <div className="flex  bg-gray-100 p-1.5 rounded-xl">
                                            {[
                                                {
                                                    key: "daily",
                                                    label: "Harian",
                                                },
                                                {
                                                    key: "weekly",
                                                    label: "Mingguan",
                                                },
                                                {
                                                    key: "monthly",
                                                    label: "Bulanan",
                                                },
                                            ].map((period) => (
                                                <button
                                                    key={period.key}
                                                    onClick={() => {
                                                        setActiveTab(
                                                            period.key
                                                        );
                                                        handleFilterChange();
                                                    }}
                                                    className={`flex-1 px-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                                        activeTab === period.key
                                                            ? "bg-white text-green-600 shadow-lg scale-105"
                                                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                                    }`}
                                                >
                                                    {period.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <LineChart
                                            data={salesData.chart_data || []}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="period"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(value) =>
                                                    formatCurrency(value)
                                                }
                                            />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    formatCurrency(value),
                                                    name === "revenue"
                                                        ? "Pendapatan"
                                                        : name ===
                                                          "transactions"
                                                        ? "Transaksi"
                                                        : name,
                                                ]}
                                                labelFormatter={(label) =>
                                                    `Periode: ${label}`
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                                name="Pendapatan"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="transactions"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                name="Transaksi"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Product Performance */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Performa Produk
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Top 5 produk terlaris
                                            </p>
                                        </div>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <svg
                                                className="w-5 h-5 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <BarChart
                                            data={
                                                salesData.product_performance?.slice(
                                                    0,
                                                    5
                                                ) || []
                                            }
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [
                                                    formatCurrency(value),
                                                    "Pendapatan",
                                                ]}
                                            />
                                            <Bar
                                                dataKey="revenue"
                                                fill="#3B82F6"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Additional Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Category Performance */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Performa Kategori
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Distribusi pendapatan per
                                                kategori
                                            </p>
                                        </div>
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <svg
                                                className="w-5 h-5 text-purple-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={
                                                    salesData.category_performance?.slice(
                                                        0,
                                                        5
                                                    ) || []
                                                }
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) =>
                                                    `${name} ${(
                                                        percent * 100
                                                    ).toFixed(0)}%`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="revenue"
                                            >
                                                {(
                                                    salesData.category_performance?.slice(
                                                        0,
                                                        5
                                                    ) || []
                                                ).map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [
                                                    formatCurrency(value),
                                                    "Pendapatan",
                                                ]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Payment Methods */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Metode Pembayaran
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Perbandingan metode pembayaran
                                            </p>
                                        </div>
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <svg
                                                className="w-5 h-5 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <BarChart
                                            data={
                                                salesData.payment_methods || []
                                            }
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    name === "revenue"
                                                        ? formatCurrency(value)
                                                        : value,
                                                    name === "revenue"
                                                        ? "Pendapatan"
                                                        : "Jumlah Transaksi",
                                                ]}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="revenue"
                                                fill="#10B981"
                                                name="Pendapatan"
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#3B82F6"
                                                name="Jumlah"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Transaksi Terbaru
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {salesData.recent_transactions
                                                    ?.length || 0}{" "}
                                                transaksi terakhir
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-gray-500 font-medium">
                                                Live
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    ID Transaksi
                                                </th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Tanggal & Waktu
                                                </th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Metode Pembayaran
                                                </th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Kasir
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {salesData.recent_transactions
                                                ?.length > 0 ? (
                                                salesData.recent_transactions.map(
                                                    (transaction, index) => (
                                                        <tr
                                                            key={transaction.id}
                                                            className={`hover:bg-gray-50 transition-colors ${
                                                                index % 2 === 0
                                                                    ? "bg-white"
                                                                    : "bg-gray-50/50"
                                                            }`}
                                                        >
                                                            <td className="py-4 px-6">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                                    #
                                                                    {
                                                                        transaction.id
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        transaction.date
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        transaction.time
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="text-sm font-bold text-green-600">
                                                                    {formatCurrency(
                                                                        transaction.total
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span
                                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                                        transaction.payment_method ===
                                                                        "Tunai"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : transaction.payment_method ===
                                                                              "QRIS"
                                                                            ? "bg-purple-100 text-purple-800"
                                                                            : "bg-blue-100 text-blue-800"
                                                                    }`}
                                                                >
                                                                    {
                                                                        transaction.payment_method
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {transaction.cashier ||
                                                                        "N/A"}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="py-12 text-center"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <svg
                                                                className="w-12 h-12 text-gray-400 mb-3"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                            <p className="text-sm font-medium text-gray-500">
                                                                Tidak ada data
                                                                transaksi
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SalesReport;
