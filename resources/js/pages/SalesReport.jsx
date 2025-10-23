import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useSalesReport } from "../hooks/useSalesReport";
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
        exportExcel,
        exportPDF,
    } = useSalesReport();

    // Handle filter changes
    const handleFilterChange = () => {
        fetchSalesReport({
            product: filterProduct,
            category: filterCategory,
            date: filterDate,
            payment: filterPayment,
            period: activeTab,
        });
    };

    // Handle export functions
    const handleExportExcel = async () => {
        const result = await exportExcel({
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
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Laporan Penjualan"
                        subtitle="Analisis data penjualan dan performa produk"
                        onMenuClick={() =>
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                        }
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                Memuat data laporan...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Laporan Penjualan"
                        subtitle="Analisis data penjualan dan performa produk"
                        onMenuClick={() =>
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                        }
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
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Laporan Penjualan"
                        subtitle="Analisis data penjualan dan performa produk"
                        onMenuClick={() =>
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                        }
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
            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <TopBar
                    title="Laporan Penjualan"
                    subtitle="Analisis data penjualan dan performa produk"
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Period Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Periode Laporan
                        </h3>
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            {[
                                { key: "daily", label: "Harian" },
                                { key: "weekly", label: "Mingguan" },
                                { key: "monthly", label: "Bulanan" },
                            ].map((period) => (
                                <button
                                    key={period.key}
                                    onClick={() => {
                                        setActiveTab(period.key);
                                        handleFilterChange();
                                    }}
                                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === period.key
                                            ? "bg-white text-green-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Filter Laporan
                        </h3>
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
                                    <option value="">Semua Produk</option>
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
                                        setFilterCategory(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
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
                                    <option value="">Semua Metode</option>
                                    <option value="Tunai">Tunai</option>
                                    <option value="QRIS">QRIS</option>
                                    <option value="Transfer">Transfer</option>
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
                        <div className="flex justify-end mt-4 space-x-3">
                            <button
                                onClick={handleExportExcel}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Export Excel
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg
                                        className="w-6 h-6 text-green-600"
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
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Transaksi
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salesData.summary
                                            ?.total_transactions || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg
                                        className="w-6 h-6 text-blue-600"
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
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Pendapatan
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(
                                            salesData.summary?.total_revenue ||
                                                0
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg
                                        className="w-6 h-6 text-yellow-600"
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
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Produk Terjual
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salesData.summary
                                            ?.total_products_sold || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg
                                        className="w-6 h-6 text-purple-600"
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
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Produk Terlaris
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {salesData.summary?.top_product ||
                                            "Tidak ada data"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Revenue Chart */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Grafik Pendapatan{" "}
                                    {activeTab === "daily"
                                        ? "Harian"
                                        : activeTab === "weekly"
                                        ? "Mingguan"
                                        : "Bulanan"}
                                </h3>
                                <div className="text-sm text-gray-500">
                                    Periode:{" "}
                                    {activeTab === "daily"
                                        ? "Harian"
                                        : activeTab === "weekly"
                                        ? "Mingguan"
                                        : "Bulanan"}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesData.chart_data || []}>
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
                                                : name === "transactions"
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Performa Produk
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
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
                                    <Bar dataKey="revenue" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Additional Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Category Performance */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Performa Kategori
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
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
                                            `${name} ${(percent * 100).toFixed(
                                                0
                                            )}%`
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
                                                        index % COLORS.length
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Metode Pembayaran
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={salesData.payment_methods || []}
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Transaksi Terbaru
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                                            ID
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                                            Tanggal
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                                            Total
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                                            Metode
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                                            Kasir
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.recent_transactions?.map(
                                        (transaction) => (
                                            <tr
                                                key={transaction.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    #{transaction.id}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {transaction.date}{" "}
                                                    {transaction.time}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        transaction.total
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {transaction.payment_method}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {transaction.cashier}
                                                </td>
                                            </tr>
                                        )
                                    ) || (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="py-8 text-center text-gray-500"
                                            >
                                                Tidak ada data transaksi
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SalesReport;
