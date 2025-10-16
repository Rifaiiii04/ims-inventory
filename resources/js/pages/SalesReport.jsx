import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
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
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filterProduct, setFilterProduct] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterPayment, setFilterPayment] = useState("");

    // Data penjualan berdasarkan observasi Kedai Angkringan Prasmanan
    const [salesData, setSalesData] = useState({
        summary: {
            totalTransactions: 89,
            totalRevenue: 1250000,
            totalProductsSold: 156,
            topProduct: "Ayam Bakar",
        },
        transactions: [
            {
                id: 1,
                product: "Ayam Bakar",
                category: "Makanan",
                variant: "Porsi",
                quantity: 2,
                unitPrice: 17000,
                totalPrice: 34000,
                paymentMethod: "Tunai",
                date: "2024-01-15",
                time: "10:30",
                cashier: "Admin",
            },
            {
                id: 2,
                product: "Nasi",
                category: "Makanan",
                variant: "Porsi",
                quantity: 2,
                unitPrice: 5000,
                totalPrice: 10000,
                paymentMethod: "Tunai",
                date: "2024-01-15",
                time: "10:30",
                cashier: "Admin",
            },
            {
                id: 3,
                product: "Es Teh Manis",
                category: "Minuman",
                variant: "Gelas",
                quantity: 2,
                unitPrice: 5000,
                totalPrice: 10000,
                paymentMethod: "QRIS",
                date: "2024-01-15",
                time: "11:15",
                cashier: "Staff1",
            },
            {
                id: 4,
                product: "Lele Goreng",
                category: "Makanan",
                variant: "Porsi",
                quantity: 1,
                unitPrice: 10000,
                totalPrice: 10000,
                paymentMethod: "Tunai",
                date: "2024-01-15",
                time: "12:00",
                cashier: "Admin",
            },
            {
                id: 5,
                product: "Tusukan (Sate-satean)",
                category: "Makanan",
                variant: "Tusuk",
                quantity: 5,
                unitPrice: 3000,
                totalPrice: 15000,
                paymentMethod: "QRIS",
                date: "2024-01-15",
                time: "12:30",
                cashier: "Staff1",
            },
        ],
        weeklyData: {
            totalRevenue: 8750000,
            totalTransactions: 98,
            chartData: [
                {
                    day: "Sen",
                    revenue: 1200000,
                    transactions: 15,
                    name: "Senin",
                },
                {
                    day: "Sel",
                    revenue: 1500000,
                    transactions: 18,
                    name: "Selasa",
                },
                {
                    day: "Rab",
                    revenue: 1800000,
                    transactions: 22,
                    name: "Rabu",
                },
                {
                    day: "Kam",
                    revenue: 1600000,
                    transactions: 20,
                    name: "Kamis",
                },
                {
                    day: "Jum",
                    revenue: 2000000,
                    transactions: 25,
                    name: "Jumat",
                },
                {
                    day: "Sab",
                    revenue: 2200000,
                    transactions: 28,
                    name: "Sabtu",
                },
                {
                    day: "Min",
                    revenue: 1900000,
                    transactions: 24,
                    name: "Minggu",
                },
            ],
        },
        monthlyData: {
            totalRevenue: 35000000,
            totalTransactions: 420,
            chartData: [
                {
                    week: "Minggu 1",
                    revenue: 8000000,
                    transactions: 95,
                    name: "Minggu 1",
                },
                {
                    week: "Minggu 2",
                    revenue: 9000000,
                    transactions: 110,
                    name: "Minggu 2",
                },
                {
                    week: "Minggu 3",
                    revenue: 8500000,
                    transactions: 105,
                    name: "Minggu 3",
                },
                {
                    week: "Minggu 4",
                    revenue: 9500000,
                    transactions: 110,
                    name: "Minggu 4",
                },
            ],
        },
        productPerformance: [
            {
                product: "Ayam Bakar",
                totalSold: 45,
                totalRevenue: 765000,
                topVariant: "Porsi",
                margin: 35,
            },
            {
                product: "Nasi",
                totalSold: 89,
                totalRevenue: 445000,
                topVariant: "Porsi",
                margin: 25,
            },
            {
                product: "Es Teh Manis",
                totalSold: 67,
                totalRevenue: 335000,
                topVariant: "Gelas",
                margin: 30,
            },
            {
                product: "Lele Goreng",
                totalSold: 28,
                totalRevenue: 280000,
                topVariant: "Porsi",
                margin: 20,
            },
            {
                product: "Tusukan (Sate-satean)",
                totalSold: 45,
                totalRevenue: 135000,
                topVariant: "Tusuk",
                margin: 25,
            },
            {
                product: "Nila Goreng",
                totalSold: 15,
                totalRevenue: 270000,
                topVariant: "Porsi",
                margin: 30,
            },
        ],
        paymentMethods: {
            Tunai: { count: 45, total: 675000, percentage: 54.0 },
            QRIS: { count: 25, total: 375000, percentage: 30.0 },
            Transfer: { count: 19, total: 200000, percentage: 16.0 },
        },
    });

    // Filter data
    const filteredTransactions = salesData.transactions.filter(
        (transaction) => {
            const matchesProduct = transaction.product
                .toLowerCase()
                .includes(filterProduct.toLowerCase());
            const matchesCategory =
                filterCategory === "" ||
                transaction.category === filterCategory;
            const matchesDate =
                filterDate === "" || transaction.date === filterDate;
            const matchesPayment =
                filterPayment === "" ||
                transaction.paymentMethod === filterPayment;
            return (
                matchesProduct &&
                matchesCategory &&
                matchesDate &&
                matchesPayment
            );
        }
    );

    // Get unique values for filters
    const categories = [
        ...new Set(salesData.transactions.map((t) => t.category)),
    ];
    const paymentMethods = [
        ...new Set(salesData.transactions.map((t) => t.paymentMethod)),
    ];

    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setShowFormModal(true);
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setShowFormModal(true);
    };

    const handleDeleteTransaction = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
            setSalesData({
                ...salesData,
                transactions: salesData.transactions.filter((t) => t.id !== id),
            });
        }
    };

    const handleSaveTransaction = (transactionData) => {
        if (editingTransaction) {
            // Update existing transaction
            setSalesData({
                ...salesData,
                transactions: salesData.transactions.map((t) =>
                    t.id === editingTransaction.id
                        ? { ...transactionData, id: editingTransaction.id }
                        : t
                ),
            });
        } else {
            // Add new transaction
            const newTransaction = {
                ...transactionData,
                id: Math.max(...salesData.transactions.map((t) => t.id)) + 1,
            };
            setSalesData({
                ...salesData,
                transactions: [...salesData.transactions, newTransaction],
            });
        }
        setShowFormModal(false);
        setEditingTransaction(null);
    };

    return (
        <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500"
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
                    subtitle="Analisis penjualan dan transaksi lengkap"
                    showLiveIndicator={true}
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Tab Navigation */}
                    <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="flex flex-wrap">
                            <button
                                onClick={() => setActiveTab("daily")}
                                className={`px-6 py-3 font-semibold text-sm transition-colors ${
                                    activeTab === "daily"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Harian
                            </button>
                            <button
                                onClick={() => setActiveTab("weekly")}
                                className={`px-6 py-3 font-semibold text-sm transition-colors ${
                                    activeTab === "weekly"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Mingguan
                            </button>
                            <button
                                onClick={() => setActiveTab("monthly")}
                                className={`px-6 py-3 font-semibold text-sm transition-colors ${
                                    activeTab === "monthly"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Bulanan
                            </button>
                            <button
                                onClick={() => setActiveTab("products")}
                                className={`px-6 py-3 font-semibold text-sm transition-colors ${
                                    activeTab === "products"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Per Produk
                            </button>
                            <button
                                onClick={() => setActiveTab("payments")}
                                className={`px-6 py-3 font-semibold text-sm transition-colors ${
                                    activeTab === "payments"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Metode Pembayaran
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Total Transaksi
                            </p>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {salesData.summary.totalTransactions}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Transaksi
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Total Omzet
                            </p>
                            <h3 className="text-2xl font-bold text-green-600">
                                Rp{" "}
                                {salesData.summary.totalRevenue.toLocaleString(
                                    "id-ID"
                                )}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Rupiah</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Produk Terjual
                            </p>
                            <h3 className="text-2xl font-bold text-purple-600">
                                {salesData.summary.totalProductsSold}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Item</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Produk Terlaris
                            </p>
                            <h3 className="text-xl font-bold text-orange-600">
                                {salesData.summary.topProduct}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Terpopuler
                            </p>
                        </div>
                    </div>

                    {/* Filter & Action Buttons */}
                    <div className="mb-6 bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Filter Produk
                                </label>
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={filterProduct}
                                    onChange={(e) =>
                                        setFilterProduct(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Filter Kategori
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) =>
                                        setFilterCategory(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Filter Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) =>
                                        setFilterDate(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Metode Bayar
                                </label>
                                <select
                                    value={filterPayment}
                                    onChange={(e) =>
                                        setFilterPayment(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Semua Metode</option>
                                    {paymentMethods.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleAddTransaction}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="size-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4.5v15m7.5-7.5h-15"
                                        />
                                    </svg>
                                    Tambah Transaksi
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="size-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                </svg>
                                Export Excel
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="size-4"
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
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === "daily" && (
                        <div className="space-y-6">
                            {/* Daily Transactions Table */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
                                <div className="bg-gradient-to-r from-blue-50 via-white to-green-50 px-6 py-5 border-b border-gray-200/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="w-5 h-5 text-white"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    Tabel Laporan Harian
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {
                                                        filteredTransactions.length
                                                    }{" "}
                                                    transaksi hari ini
                                                </p>
                                            </div>
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
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            Tanggal & Waktu
                                                        </span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>Nama Produk</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>Kategori</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>Jumlah</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            Harga Satuan
                                                        </span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>Total Harga</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            Metode Bayar
                                                        </span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span>Aksi</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200/50">
                                            {filteredTransactions.map(
                                                (item, index) => (
                                                    <tr
                                                        key={item.id}
                                                        className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                                                            index % 2 === 0
                                                                ? "bg-white"
                                                                : "bg-gray-50/30"
                                                        }`}
                                                    >
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-green-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                                                                    {item.id}
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-gray-600 font-medium">
                                                                        {
                                                                            item.date
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm font-bold text-gray-800">
                                                                        {
                                                                            item.time
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div>
                                                                <div className="font-bold text-gray-800 text-sm">
                                                                    {
                                                                        item.product
                                                                    }
                                                                </div>
                                                                {item.variant && (
                                                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg mt-1 inline-block">
                                                                        {
                                                                            item.variant
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-center">
                                                                {item.quantity}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-bold text-gray-800">
                                                                Rp{" "}
                                                                {item.unitPrice.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                per unit
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-bold text-green-600">
                                                                Rp{" "}
                                                                {item.totalPrice.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                total
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span
                                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${
                                                                    item.paymentMethod ===
                                                                    "Tunai"
                                                                        ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200"
                                                                        : item.paymentMethod ===
                                                                          "QRIS"
                                                                        ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-200"
                                                                        : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-200"
                                                                }`}
                                                            >
                                                                {
                                                                    item.paymentMethod
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditTransaction(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                                    title="Edit"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        stroke="currentColor"
                                                                        className="size-4 group-hover/btn:scale-110 transition-transform"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteTransaction(
                                                                            item.id
                                                                        )
                                                                    }
                                                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                                    title="Hapus"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        stroke="currentColor"
                                                                        className="size-4 group-hover/btn:scale-110 transition-transform"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Empty State */}
                                {filteredTransactions.length === 0 && (
                                    <div className="text-center py-16 px-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-10 text-gray-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                                            Belum ada transaksi
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                            Mulai catat penjualan Anda dengan
                                            menambahkan transaksi pertama
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            <span>
                                                Klik tombol "Tambah Transaksi"
                                                untuk memulai
                                            </span>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "weekly" && (
                        <div className="space-y-6">
                            {/* Weekly Summary */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    Rekap Mingguan
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            Rp{" "}
                                            {salesData.weeklyData.totalRevenue.toLocaleString(
                                                "id-ID"
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Total Omzet
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {
                                                salesData.weeklyData
                                                    .totalTransactions
                                            }
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Total Transaksi
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            Rp{" "}
                                            {(
                                                salesData.weeklyData
                                                    .totalRevenue / 7
                                            ).toLocaleString("id-ID")}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Rata-rata Harian
                                        </p>
                                    </div>
                                </div>

                                {/* Weekly Chart */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-700 mb-3">
                                        Grafik Penjualan Mingguan
                                    </h4>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <LineChart
                                                data={
                                                    salesData.weeklyData
                                                        .chartData
                                                }
                                                margin={{
                                                    top: 20,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 20,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#e5e7eb"
                                                />
                                                <XAxis
                                                    dataKey="day"
                                                    stroke="#6b7280"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#6b7280"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) =>
                                                        `Rp ${(
                                                            value / 1000000
                                                        ).toFixed(1)}M`
                                                    }
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor:
                                                            "white",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        boxShadow:
                                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                    formatter={(
                                                        value,
                                                        name
                                                    ) => [
                                                        `Rp ${value.toLocaleString(
                                                            "id-ID"
                                                        )}`,
                                                        name === "revenue"
                                                            ? "Omzet"
                                                            : "Transaksi",
                                                    ]}
                                                    labelFormatter={(label) =>
                                                        `Hari: ${label}`
                                                    }
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    dot={{
                                                        fill: "#3b82f6",
                                                        strokeWidth: 2,
                                                        r: 6,
                                                    }}
                                                    activeDot={{
                                                        r: 8,
                                                        stroke: "#3b82f6",
                                                        strokeWidth: 2,
                                                    }}
                                                    name="Omzet"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "monthly" && (
                        <div className="space-y-6">
                            {/* Monthly Summary */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    Rekap Bulanan
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            Rp{" "}
                                            {salesData.monthlyData.totalRevenue.toLocaleString(
                                                "id-ID"
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Total Omzet
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {
                                                salesData.monthlyData
                                                    .totalTransactions
                                            }
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Total Transaksi
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            Rp{" "}
                                            {(
                                                salesData.monthlyData
                                                    .totalRevenue / 4
                                            ).toLocaleString("id-ID")}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Rata-rata Mingguan
                                        </p>
                                    </div>
                                </div>

                                {/* Monthly Chart */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-700 mb-3">
                                        Grafik Penjualan Bulanan
                                    </h4>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <LineChart
                                                data={
                                                    salesData.monthlyData
                                                        .chartData
                                                }
                                                margin={{
                                                    top: 20,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 20,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#e5e7eb"
                                                />
                                                <XAxis
                                                    dataKey="week"
                                                    stroke="#6b7280"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#6b7280"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) =>
                                                        `Rp ${(
                                                            value / 1000000
                                                        ).toFixed(1)}M`
                                                    }
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor:
                                                            "white",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        boxShadow:
                                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                    formatter={(
                                                        value,
                                                        name
                                                    ) => [
                                                        `Rp ${value.toLocaleString(
                                                            "id-ID"
                                                        )}`,
                                                        name === "revenue"
                                                            ? "Omzet"
                                                            : "Transaksi",
                                                    ]}
                                                    labelFormatter={(label) =>
                                                        `Periode: ${label}`
                                                    }
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#10b981"
                                                    strokeWidth={3}
                                                    dot={{
                                                        fill: "#10b981",
                                                        strokeWidth: 2,
                                                        r: 6,
                                                    }}
                                                    activeDot={{
                                                        r: 8,
                                                        stroke: "#10b981",
                                                        strokeWidth: 2,
                                                    }}
                                                    name="Omzet"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "products" && (
                        <div className="space-y-6">
                            {/* Product Performance Table */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
                                <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 px-6 py-5 border-b border-gray-200/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="w-5 h-5 text-white"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    Performa Produk
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {
                                                        salesData
                                                            .productPerformance
                                                            .length
                                                    }{" "}
                                                    produk dianalisis
                                                </p>
                                            </div>
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
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>Nama Produk</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            Total Terjual
                                                        </span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>Total Omzet</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            Varian Terlaris
                                                        </span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <span>Margin (%)</span>
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200/50">
                                            {salesData.productPerformance.map(
                                                (product, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30 transition-all duration-200 ${
                                                            index % 2 === 0
                                                                ? "bg-white"
                                                                : "bg-gray-50/30"
                                                        }`}
                                                    >
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-200 rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm">
                                                                    {product.product
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-800 text-sm">
                                                                        {
                                                                            product.product
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        Produk #
                                                                        {index +
                                                                            1}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-center">
                                                                {
                                                                    product.totalSold
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                unit terjual
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-bold text-green-600">
                                                                Rp{" "}
                                                                {product.totalRevenue.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                total omzet
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 shadow-sm">
                                                                {
                                                                    product.topVariant
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm">
                                                                {product.margin}
                                                                %
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Empty State */}
                                {salesData.productPerformance.length === 0 && (
                                    <div className="text-center py-16 px-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-10 text-gray-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                                            Belum ada data produk
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                            Mulai catat penjualan untuk melihat
                                            performa produk
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            <span>
                                                Data akan muncul setelah ada
                                                transaksi
                                            </span>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "payments" && (
                        <div className="space-y-6">
                            {/* Payment Methods Summary */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
                                <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-6 py-5 border-b border-gray-200/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="w-5 h-5 text-white"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    Statistik Metode Pembayaran
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {
                                                        Object.keys(
                                                            salesData.paymentMethods
                                                        ).length
                                                    }{" "}
                                                    metode pembayaran
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-gray-500 font-medium">
                                                Live
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        {Object.entries(
                                            salesData.paymentMethods
                                        ).map(([method, data], index) => (
                                            <div
                                                key={method}
                                                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                            >
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                        <span className="text-2xl">
                                                            {method === "Tunai"
                                                                ? "💵"
                                                                : method ===
                                                                  "QRIS"
                                                                ? "📱"
                                                                : "🏦"}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-lg capitalize text-gray-800 mb-3">
                                                        {method}
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-3xl font-bold text-indigo-600 mb-1">
                                                                {data.count}
                                                            </p>
                                                            <p className="text-sm text-gray-500 font-medium">
                                                                Transaksi
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-bold text-green-600 mb-1">
                                                                Rp{" "}
                                                                {data.total.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-500 font-medium">
                                                                Total Omzet
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                                                                    style={{
                                                                        width: `${data.percentage}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-700">
                                                                {
                                                                    data.percentage
                                                                }
                                                                % dari total
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pie Chart */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200/50">
                                    <div className="text-center mb-6">
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                                            Distribusi Metode Pembayaran
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            Persentase penggunaan setiap metode
                                            pembayaran
                                        </p>
                                    </div>
                                    <div className="flex flex-col lg:flex-row items-center gap-6">
                                        <div className="w-full lg:w-1/2">
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={Object.entries(
                                                            salesData.paymentMethods
                                                        ).map(
                                                            ([
                                                                method,
                                                                data,
                                                            ]) => ({
                                                                name:
                                                                    method
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() +
                                                                    method.slice(
                                                                        1
                                                                    ),
                                                                value: data.percentage,
                                                                count: data.count,
                                                                total: data.total,
                                                            })
                                                        )}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({
                                                            name,
                                                            value,
                                                        }) =>
                                                            `${name}: ${value}%`
                                                        }
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {Object.entries(
                                                            salesData.paymentMethods
                                                        ).map(
                                                            (
                                                                [method, data],
                                                                index
                                                            ) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        method ===
                                                                        "tunai"
                                                                            ? "#10b981"
                                                                            : method ===
                                                                              "qris"
                                                                            ? "#3b82f6"
                                                                            : "#8b5cf6"
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(
                                                            value,
                                                            name,
                                                            props
                                                        ) => [
                                                            `${value}%`,
                                                            "Persentase",
                                                        ]}
                                                        labelFormatter={(
                                                            label,
                                                            payload
                                                        ) => {
                                                            if (
                                                                payload &&
                                                                payload[0]
                                                            ) {
                                                                return `${
                                                                    payload[0]
                                                                        .payload
                                                                        .name
                                                                }: ${
                                                                    payload[0]
                                                                        .payload
                                                                        .count
                                                                } transaksi (Rp ${payload[0].payload.total.toLocaleString(
                                                                    "id-ID"
                                                                )})`;
                                                            }
                                                            return label;
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="w-full lg:w-1/2">
                                            <div className="space-y-4">
                                                {Object.entries(
                                                    salesData.paymentMethods
                                                ).map(
                                                    ([method, data], index) => (
                                                        <div
                                                            key={method}
                                                            className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <div
                                                                        className="w-6 h-6 rounded-xl shadow-sm"
                                                                        style={{
                                                                            backgroundColor:
                                                                                method ===
                                                                                "tunai"
                                                                                    ? "#10b981"
                                                                                    : method ===
                                                                                      "qris"
                                                                                    ? "#3b82f6"
                                                                                    : "#8b5cf6",
                                                                        }}
                                                                    ></div>
                                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-gray-200"></div>
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-gray-800 capitalize text-sm">
                                                                        {method}
                                                                    </span>
                                                                    <div className="text-xs text-gray-500">
                                                                        {method ===
                                                                        "Tunai"
                                                                            ? "Pembayaran Tunai"
                                                                            : method ===
                                                                              "QRIS"
                                                                            ? "Pembayaran Digital"
                                                                            : "Transfer Bank"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-gray-800 mb-1">
                                                                    {
                                                                        data.percentage
                                                                    }
                                                                    %
                                                                </div>
                                                                <div className="text-sm text-gray-500 font-medium">
                                                                    {data.count}{" "}
                                                                    transaksi
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    Rp{" "}
                                                                    {data.total.toLocaleString(
                                                                        "id-ID"
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Empty State */}
                                {Object.keys(salesData.paymentMethods)
                                    .length === 0 && (
                                    <div className="text-center py-16 px-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="size-10 text-gray-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                                            Belum ada data pembayaran
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                            Mulai catat transaksi untuk melihat
                                            statistik metode pembayaran
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            <span>
                                                Data akan muncul setelah ada
                                                transaksi
                                            </span>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <TransactionFormModal
                    transaction={editingTransaction}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingTransaction(null);
                    }}
                    onSave={handleSaveTransaction}
                />
            )}
        </div>
    );
}

// Form Modal Component
function TransactionFormModal({ transaction, onClose, onSave }) {
    const [formData, setFormData] = useState({
        product: "",
        category: "",
        variant: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
        paymentMethod: "",
        date: "",
        time: "",
        cashier: "",
    });

    React.useEffect(() => {
        if (transaction) {
            setFormData({
                product: transaction.product || "",
                category: transaction.category || "",
                variant: transaction.variant || "",
                quantity: transaction.quantity || "",
                unitPrice: transaction.unitPrice || "",
                totalPrice: transaction.totalPrice || "",
                paymentMethod: transaction.paymentMethod || "",
                date: transaction.date || "",
                time: transaction.time || "",
                cashier: transaction.cashier || "",
            });
        } else {
            // Set default values for new transaction
            setFormData({
                product: "",
                category: "",
                variant: "",
                quantity: "",
                unitPrice: "",
                totalPrice: "",
                paymentMethod: "Tunai",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toTimeString().slice(0, 5),
                cashier: "Admin",
            });
        }
    }, [transaction]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-calculate total price
        if (name === "quantity" || name === "unitPrice") {
            const qty =
                name === "quantity"
                    ? parseInt(value) || 0
                    : parseInt(formData.quantity) || 0;
            const price =
                name === "unitPrice"
                    ? parseInt(value) || 0
                    : parseInt(formData.unitPrice) || 0;
            setFormData((prev) => ({
                ...prev,
                totalPrice: (qty * price).toString(),
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {transaction
                                ? "Edit Transaksi"
                                : "Tambah Transaksi Baru"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Produk *
                            </label>
                            <input
                                type="text"
                                name="product"
                                value={formData.product}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                <option value="Makanan">Makanan</option>
                                <option value="Minuman">Minuman</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Varian
                            </label>
                            <input
                                type="text"
                                name="variant"
                                value={formData.variant}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jumlah *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga Satuan (Rp) *
                            </label>
                            <input
                                type="number"
                                name="unitPrice"
                                value={formData.unitPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total Harga (Rp) *
                            </label>
                            <input
                                type="number"
                                name="totalPrice"
                                value={formData.totalPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm bg-gray-50"
                                required
                                min="0"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Metode Pembayaran *
                            </label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                            >
                                <option value="">Pilih Metode</option>
                                <option value="Tunai">Tunai</option>
                                <option value="QRIS">QRIS</option>
                                <option value="Transfer">Transfer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tanggal *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Waktu *
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kasir *
                            </label>
                            <input
                                type="text"
                                name="cashier"
                                value={formData.cashier}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 font-semibold shadow-lg text-sm"
                        >
                            {transaction ? "Update" : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SalesReport;
