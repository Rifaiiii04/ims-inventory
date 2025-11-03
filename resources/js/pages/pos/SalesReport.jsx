import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import TransactionDetailModal from "../../components/pos/TransactionDetailModal";
import { useSalesReport } from "../../hooks/useSalesReport";
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
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Use sales report hook to fetch data from database
    const {
        reportData: salesData,
        products,
        categories,
        loading,
        error,
        fetchSalesReport,
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
    }, [filterProduct, filterCategory, filterDate, filterPayment, activeTab, fetchSalesReport]);

    // Auto-refresh when filters or period change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleFilterChange();
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [filterProduct, filterCategory, filterDate, filterPayment, activeTab, handleFilterChange]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleViewDetail = async (transactionId) => {
        setLoadingDetail(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}/transactions/${transactionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch transaction detail");
            }

            const result = await response.json();
            if (result.success && result.data) {
                setSelectedTransaction(result.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error("Error fetching transaction detail:", error);
            alert("Gagal mengambil detail transaksi");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Get filtered transactions from database
    const filteredTransactions = salesData?.recent_transactions?.filter((transaction) => {
        const transactionProduct = transaction.items?.[0]?.product || "";
        const transactionCategory = transaction.items?.[0]?.category || "";
        const transactionDate = transaction.date || "";
        const transactionPayment = transaction.payment_method || "";

        const matchesProduct = transactionProduct
            .toLowerCase()
            .includes(filterProduct.toLowerCase());
        const matchesCategory = filterCategory === "" || transactionCategory
            .toLowerCase()
            .includes(filterCategory.toLowerCase());
        const matchesDate = filterDate === "" || transactionDate.includes(filterDate);
        const matchesPayment = filterPayment === "" || transactionPayment
            .toLowerCase()
            .includes(filterPayment.toLowerCase());

        return matchesProduct && matchesCategory && matchesDate && matchesPayment;
    }) || [];

    // Transform chart data from database
    const getCurrentData = () => {
        if (!salesData?.chart_data) return [];
        
        return salesData.chart_data.map((item) => {
            switch (activeTab) {
                case "daily":
                    return {
                        date: item.period,
                        sales: item.revenue || 0,
                        transactions: item.transactions || 0,
                    };
                case "weekly":
                    return {
                        week: item.period,
                        sales: item.revenue || 0,
                        transactions: item.transactions || 0,
                    };
                case "monthly":
                    return {
                        month: item.period,
                        sales: item.revenue || 0,
                        transactions: item.transactions || 0,
                    };
                default:
                    return {
                        date: item.period,
                        sales: item.revenue || 0,
                        transactions: item.transactions || 0,
                    };
            }
        });
    };

    const getCurrentLabel = () => {
        switch (activeTab) {
            case "daily":
                return "Penjualan Harian";
            case "weekly":
                return "Penjualan Mingguan";
            case "monthly":
                return "Penjualan Bulanan";
            default:
                return "Penjualan Harian";
        }
    };

    const getCurrentXAxisKey = () => {
        switch (activeTab) {
            case "daily":
                return "date";
            case "weekly":
                return "week";
            case "monthly":
                return "month";
            default:
                return "date";
        }
    };

    // Show loading state
    if (loading) {
        return (
            <>
                <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat data laporan penjualan...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show error state
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
                                onClick={() => window.location.reload()}
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

    // Get product performance data from database
    const productPerformance = salesData?.product_performance?.map((product) => {
        const totalRevenue = salesData?.summary?.total_revenue || 1;
        return {
            name: product.name || "Unknown",
            sales: product.revenue || 0,
            percentage: totalRevenue > 0 ? ((product.revenue || 0) / totalRevenue * 100).toFixed(1) : 0,
        };
    }) || [];

    // Get payment method data from database
    const paymentMethodData = salesData?.payment_methods?.map((method) => {
        const colors = {
            "Tunai": "#10B981",
            "QRIS": "#3B82F6",
            "Transfer": "#8B5CF6",
            "Cash": "#10B981",
            "lainnya": "#8B5CF6",
        };
        return {
            name: method.name || "Unknown",
            value: method.count || 0,
            color: colors[method.name] || "#8B5CF6",
        };
    }) || [];

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
                        title="Laporan Penjualan"
                        subtitle="Analisis dan laporan penjualan lengkap"
                        showLiveIndicator={true}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">
                                                Total Transaksi
                                            </p>
                                            <p className="text-3xl font-bold">
                                                {salesData?.summary?.total_transactions || 0}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-400/30 rounded-xl flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6"
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

                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm font-medium">
                                                Total Pendapatan
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(
                                                    salesData?.summary?.total_revenue || 0
                                                )}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-400/30 rounded-xl flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6"
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

                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">
                                                Produk Terjual
                                            </p>
                                            <p className="text-3xl font-bold">
                                                {salesData?.summary?.total_products_sold || 0}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-400/30 rounded-xl flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6"
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

                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100 text-sm font-medium">
                                                Produk Terlaris
                                            </p>
                                            <p className="text-lg font-bold">
                                                {salesData?.summary?.top_product || "Tidak ada data"}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-400/30 rounded-xl flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sales Trend Chart */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Tren Penjualan
                                        </h3>
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setActiveTab("daily")}
                                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                                    activeTab === "daily"
                                                        ? "bg-white text-gray-800 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-800"
                                                }`}
                                            >
                                                Harian
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("weekly")}
                                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                                    activeTab === "weekly"
                                                        ? "bg-white text-gray-800 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-800"
                                                }`}
                                            >
                                                Mingguan
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("monthly")}
                                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                                    activeTab === "monthly"
                                                        ? "bg-white text-gray-800 shadow-sm"
                                                        : "text-gray-600 hover:text-gray-800"
                                                }`}
                                            >
                                                Bulanan
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={getCurrentData()}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f0f0f0"
                                                />
                                                <XAxis
                                                    dataKey={getCurrentXAxisKey()}
                                                    stroke="#666"
                                                    fontSize={12}
                                                />
                                                <YAxis
                                                    stroke="#666"
                                                    fontSize={12}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "white",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        boxShadow:
                                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                    formatter={(value, name) => [
                                                        name === "sales"
                                                            ? formatCurrency(value)
                                                            : value,
                                                        name === "sales"
                                                            ? "Penjualan"
                                                            : "Transaksi",
                                                    ]}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#3B82F6"
                                                    strokeWidth={3}
                                                    dot={{
                                                        fill: "#3B82F6",
                                                        strokeWidth: 2,
                                                        r: 4,
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="transactions"
                                                    stroke="#10B981"
                                                    strokeWidth={3}
                                                    dot={{
                                                        fill: "#10B981",
                                                        strokeWidth: 2,
                                                        r: 4,
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Product Performance Chart */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6">
                                        Performa Produk
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={productPerformance}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f0f0f0"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="#666"
                                                    fontSize={12}
                                                />
                                                <YAxis
                                                    stroke="#666"
                                                    fontSize={12}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "white",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        boxShadow:
                                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                    formatter={(value) => [
                                                        formatCurrency(value),
                                                        "Penjualan",
                                                    ]}
                                                />
                                                <Bar
                                                    dataKey="sales"
                                                    fill="#8B5CF6"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6">
                                        Metode Pembayaran
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={paymentMethodData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {paymentMethodData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.color}
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "white",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        boxShadow:
                                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Products List */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6">
                                        Produk Terlaris
                                    </h3>
                                    <div className="space-y-4">
                                        {productPerformance.map(
                                            (product, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {product.percentage}%
                                                                dari total penjualan
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-800">
                                                            {formatCurrency(
                                                                product.sales
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Table */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Daftar Transaksi
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            <input
                                                type="text"
                                                placeholder="Cari produk..."
                                                value={filterProduct}
                                                onChange={(e) =>
                                                    setFilterProduct(e.target.value)
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <select
                                                value={filterCategory}
                                                onChange={(e) =>
                                                    setFilterCategory(e.target.value)
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">
                                                    Semua Kategori
                                                </option>
                                                {categories.map((category) => (
                                                    <option key={category.id || category.id_kategori} value={category.id || category.id_kategori}>
                                                        {category.name || category.nama_kategori}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="date"
                                                value={filterDate}
                                                onChange={(e) =>
                                                    setFilterDate(e.target.value)
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <select
                                                value={filterPayment}
                                                onChange={(e) =>
                                                    setFilterPayment(e.target.value)
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Produk
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kategori
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Qty
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Harga Satuan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Metode
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tanggal
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kasir
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTransactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                                        Tidak ada data transaksi
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredTransactions.map((transaction) => {
                                                    const firstItem = transaction.items?.[0];
                                                    return (
                                                        <tr
                                                            key={transaction.id}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {firstItem?.product || "Unknown"}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {firstItem?.variant || "Default"}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {firstItem?.category && firstItem.category !== '-' ? (
                                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                        {firstItem.category}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {transaction.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatCurrency(
                                                                    firstItem?.unit_price || 0
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {formatCurrency(
                                                                    transaction.total || 0
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        transaction.payment_method === "Tunai" || transaction.payment_method === "Cash"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : transaction.payment_method === "QRIS"
                                                                            ? "bg-blue-100 text-blue-800"
                                                                            : "bg-purple-100 text-purple-800"
                                                                    }`}
                                                                >
                                                                    {transaction.payment_method || "Tunai"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(transaction.date)}
                                                                <br />
                                                                {transaction.time}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {transaction.cashier || "Admin"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button
                                                                    onClick={() => handleViewDetail(transaction.id)}
                                                                    disabled={loadingDetail}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {loadingDetail ? "Loading..." : "Lihat Detail"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Detail Modal */}
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

export default SalesReport;
