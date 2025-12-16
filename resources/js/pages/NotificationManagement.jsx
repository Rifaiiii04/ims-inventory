import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useStock } from "../hooks/useStock";
import { ManagementPageSkeleton } from "../components/common/SkeletonLoader";
import MobileSidebarToggle from "../components/sidebar/MobileSidebarToggle";
import axios from "axios";

function NotificationManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingNotification, setSendingNotification] = useState(false);
    const [notificationEnabled, setNotificationEnabled] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [expiredPredictions, setExpiredPredictions] = useState([]);
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [generatingPredictions, setGeneratingPredictions] = useState(false);
    const [selectedPredictions, setSelectedPredictions] = useState([]);
    const [deletingPredictions, setDeletingPredictions] = useState(false);

    // Fetch low stock items and settings
    useEffect(() => {
        fetchLowStockItems();
        fetchNotificationSettings();
        fetchExpiredPredictions();
    }, []);

    const fetchLowStockItems = async () => {
        try {
            setLoading(true);
            setError(null);
            // Use the route that definitely exists
            const response = await axios.get("/api/stocks/low-stock/alerts");
            if (response.data.success) {
                setLowStockItems(response.data.data || []);
            } else {
                setError(response.data.message || "Gagal mengambil data");
            }
        } catch (err) {
            console.error("Error fetching low stock items:", err);
            if (err.response?.status === 401) {
                setError("Anda harus login terlebih dahulu");
            } else if (err.response?.status === 404) {
                setError(
                    "Endpoint tidak ditemukan. Pastikan server sudah restart."
                );
            } else {
                setError("Terjadi kesalahan saat mengambil data");
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch notification settings
    const fetchNotificationSettings = async () => {
        try {
            setLoadingSettings(true);
            // Check if token exists before making request
            const token =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");
            if (!token) {
                // No token, use default
                setNotificationEnabled(true);
                return;
            }
            // Use axios default headers (set by AuthContext)
            const response = await axios.get("/api/notifications/settings");
            if (response.data.success) {
                setNotificationEnabled(response.data.data.notification_enabled);
            }
        } catch (err) {
            console.error("Error fetching notification settings:", err);
            // Default to enabled if error (including 401 - not logged in or token expired)
            setNotificationEnabled(true);
        } finally {
            setLoadingSettings(false);
        }
    };

    // Fetch expired predictions
    const fetchExpiredPredictions = async () => {
        try {
            setLoadingPredictions(true);
            const response = await axios.get(
                "/api/notifications/expired-predictions"
            );
            if (response.data.success) {
                setExpiredPredictions(response.data.data || []);
                setSelectedPredictions([]); // Reset selection
            }
        } catch (err) {
            console.error("Error fetching expired predictions:", err);
        } finally {
            setLoadingPredictions(false);
        }
    };

    // Handle delete single prediction
    const handleDeletePrediction = async (id, namaBahan) => {
        if (!window.confirm(`Hapus prediksi expired untuk "${namaBahan}"?`)) {
            return;
        }

        try {
            setDeletingPredictions(true);
            const response = await axios.delete(
                `/api/notifications/expired-predictions/${id}`
            );
            if (response.data.success) {
                alert("Prediksi expired berhasil dihapus");
                fetchExpiredPredictions(); // Refresh list
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.error("Error deleting prediction:", err);
            alert("Terjadi kesalahan saat menghapus prediksi expired");
        } finally {
            setDeletingPredictions(false);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedPredictions.length === 0) {
            alert("Pilih prediksi yang akan dihapus terlebih dahulu");
            return;
        }

        if (
            !window.confirm(
                `Hapus ${selectedPredictions.length} prediksi expired yang dipilih?`
            )
        ) {
            return;
        }

        try {
            setDeletingPredictions(true);
            const response = await axios.post(
                "/api/notifications/expired-predictions/bulk-delete",
                { ids: selectedPredictions }
            );
            if (response.data.success) {
                alert(
                    `Berhasil menghapus ${response.data.data.deleted_count} prediksi expired`
                );
                fetchExpiredPredictions(); // Refresh list
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.error("Error bulk deleting predictions:", err);
            alert("Terjadi kesalahan saat menghapus prediksi expired");
        } finally {
            setDeletingPredictions(false);
        }
    };

    // Handle delete all
    const handleDeleteAll = async () => {
        if (
            !window.confirm(
                `Hapus SEMUA prediksi expired? Tindakan ini tidak dapat dibatalkan!`
            )
        ) {
            return;
        }

        try {
            setDeletingPredictions(true);
            const response = await axios.post(
                "/api/notifications/expired-predictions/delete-all",
                { confirm: true }
            );
            if (response.data.success) {
                const deletedCount = response.data.deleted_count || 0;
                alert(
                    `Berhasil menghapus semua prediksi expired (${deletedCount} data)`
                );
                fetchExpiredPredictions(); // Refresh list
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.error("Error deleting all predictions:", err);
            if (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) {
                alert(`Error: ${err.response.data.message}`);
            } else {
                alert(
                    "Terjadi kesalahan saat menghapus semua prediksi expired"
                );
            }
        } finally {
            setDeletingPredictions(false);
        }
    };

    // Handle checkbox selection
    const handleSelectPrediction = (id) => {
        setSelectedPredictions((prev) =>
            prev.includes(id)
                ? prev.filter((predId) => predId !== id)
                : [...prev, id]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedPredictions.length === expiredPredictions.length) {
            setSelectedPredictions([]);
        } else {
            setSelectedPredictions(
                expiredPredictions.map((p) => p.id_prediksi)
            );
        }
    };

    // Handle generate expired predictions
    const handleGenerateExpiredPredictions = async () => {
        if (
            !window.confirm(
                "Generate prediksi expired untuk semua bahan? Proses ini mungkin memakan waktu beberapa menit."
            )
        ) {
            return;
        }

        try {
            setGeneratingPredictions(true);
            const response = await axios.post(
                "/api/notifications/generate-expired-predictions"
            );
            if (response.data.success) {
                const data = response.data.data;
                let message = `Prediksi expired berhasil di-generate!\n`;
                message += `Berhasil: ${data.berhasil}\n`;
                message += `Gagal: ${data.gagal}`;
                if (data.dilewati && data.dilewati > 0) {
                    message += `\nDilewati: ${data.dilewati} (sudah memiliki prediksi)`;
                }
                alert(message);
                fetchExpiredPredictions(); // Refresh predictions
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.error("Error generating expired predictions:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Terjadi kesalahan saat generate prediksi expired";
            const errorDetails =
                err.response?.data?.error || err.response?.data?.details || "";
            alert(
                `Error: ${errorMessage}${
                    errorDetails ? `\n\nDetail: ${errorDetails}` : ""
                }`
            );
        } finally {
            setGeneratingPredictions(false);
        }
    };

    // Handle send notification manually
    const handleSendNotification = async () => {
        // Cek apakah notifikasi diaktifkan
        if (!notificationEnabled) {
            alert(
                "Notifikasi dinonaktifkan. Silakan aktifkan terlebih dahulu di halaman Pengaturan > Pengaturan Notifikasi."
            );
            return;
        }

        if (lowStockItems.length === 0) {
            alert("Tidak ada stok yang menipis untuk dikirim notifikasi");
            return;
        }

        if (
            !window.confirm(
                `Kirim notifikasi untuk ${lowStockItems.length} item yang stoknya menipis?`
            )
        ) {
            return;
        }

        try {
            setSendingNotification(true);
            // Kirim dengan force=true untuk skip pengecekan settings (manual send)
            const response = await axios.post(
                "/api/stocks/batch-notification",
                {
                    force: true,
                }
            );
            if (response.data.success) {
                alert(
                    `Notifikasi berhasil dikirim untuk ${
                        response.data.data?.length || 0
                    } item`
                );
                fetchLowStockItems(); // Refresh data
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.error("Error sending notification:", err);
            alert("Terjadi kesalahan saat mengirim notifikasi");
        } finally {
            setSendingNotification(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);
    };

    // Format number without unnecessary .00
    const formatNumber = (num) => {
        // If number is an integer, return without decimals
        if (Number.isInteger(num)) {
            return num.toString();
        }
        // If number has decimals, remove trailing zeros
        return parseFloat(num.toFixed(2)).toString();
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <MobileSidebarToggle
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

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
                    title="Kelola Notifikasi"
                    subtitle="Monitor dan kirim notifikasi stok menipis"
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Loading State */}
                    {loading && !error && (
                        <ManagementPageSkeleton title="Kelola Notifikasi" />
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchLowStockItems}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && !error && (
                        <>
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                        Notifikasi Stok Menipis
                                    </h2>
                                    <p className="text-gray-600">
                                        Notifikasi otomatis dikirim ketika stok
                                        bahan di bawah batas minimum
                                    </p>
                                    {!notificationEnabled &&
                                        !loadingSettings && (
                                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-700 flex items-center gap-2">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        />
                                                    </svg>
                                                    <span>
                                                        Notifikasi
                                                        dinonaktifkan. Aktifkan
                                                        terlebih dahulu di{" "}
                                                        <strong>
                                                            Pengaturan &gt;
                                                            Pengaturan
                                                            Notifikasi
                                                        </strong>{" "}
                                                        untuk mengirim
                                                        notifikasi.
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={
                                            handleGenerateExpiredPredictions
                                        }
                                        disabled={generatingPredictions}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {generatingPredictions ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                    />
                                                </svg>
                                                Generate Prediksi Expired
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSendNotification}
                                        disabled={
                                            sendingNotification ||
                                            lowStockItems.length === 0 ||
                                            !notificationEnabled ||
                                            loadingSettings
                                        }
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative"
                                        title={
                                            !notificationEnabled
                                                ? "Notifikasi dinonaktifkan. Aktifkan terlebih dahulu di halaman Pengaturan."
                                                : ""
                                        }
                                    >
                                        {sendingNotification ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Mengirim...
                                            </>
                                        ) : !notificationEnabled ? (
                                            <>
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                                    />
                                                </svg>
                                                Notifikasi Dinonaktifkan
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                    />
                                                </svg>
                                                Kirim Notifikasi Sekarang
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                            Cara Kerja Notifikasi
                                        </h3>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>
                                                • Notifikasi otomatis dikirim
                                                ketika stok bahan{" "}
                                                <strong>
                                                    di bawah batas minimum
                                                </strong>{" "}
                                                (min_stok)
                                            </li>
                                            <li>
                                                • Batas minimum stok diatur di
                                                halaman{" "}
                                                <strong>
                                                    "Pengelolaan Stok"
                                                </strong>
                                            </li>
                                            <li>
                                                • Notifikasi dikirim ke WhatsApp
                                                melalui n8n setiap kali stok
                                                menipis
                                            </li>
                                            <li>
                                                • Terdapat cooldown 5 menit
                                                untuk mencegah spam notifikasi
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 uppercase">
                                        Total Item Menipis
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {lowStockItems.length}
                                    </h3>
                                </div>
                                <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 uppercase">
                                        Total Kekurangan
                                    </p>
                                    <h3 className="text-2xl font-bold text-red-600">
                                        {formatNumber(
                                            lowStockItems.reduce(
                                                (sum, item) =>
                                                    sum + (item.shortage || 0),
                                                0
                                            )
                                        )}
                                    </h3>
                                </div>
                                <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 uppercase">
                                        Nilai Restock
                                    </p>
                                    <h3 className="text-2xl font-bold text-green-600">
                                        {formatPrice(
                                            lowStockItems.reduce(
                                                (sum, item) =>
                                                    sum +
                                                    (item.shortage || 0) *
                                                        (item.buyPrice || 0),
                                                0
                                            )
                                        )}
                                    </h3>
                                </div>
                            </div>

                            {/* Low Stock Items Table */}
                            {lowStockItems.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="gradient-to-br from-red-50 to-orange-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Nama Bahan
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Kategori
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Stok Saat Ini
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Batas Minimum
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Kekurangan
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Harga Beli
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {lowStockItems.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: {item.id}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-bold text-red-600">
                                                                {
                                                                    item.currentStock
                                                                }{" "}
                                                                {item.unit}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-semibold text-gray-700">
                                                                {item.minStock}{" "}
                                                                {item.unit}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-bold text-red-600">
                                                                {formatNumber(
                                                                    item.shortage
                                                                )}{" "}
                                                                {item.unit}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-semibold text-gray-700">
                                                                {formatPrice(
                                                                    item.buyPrice
                                                                )}{" "}
                                                                {item.unit}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        Semua Stok Cukup
                                    </h3>
                                    <p className="text-gray-600">
                                        Tidak ada bahan yang stoknya menipis
                                        saat ini. Semua stok berada di atas
                                        batas minimum.
                                    </p>
                                </div>
                            )}

                            {/* Expired Predictions Section */}
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Prediksi Expired Bahan
                                    </h2>
                                    <div className="flex gap-2">
                                        {selectedPredictions.length > 0 && (
                                            <button
                                                onClick={handleBulkDelete}
                                                disabled={deletingPredictions}
                                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                                Hapus (
                                                {selectedPredictions.length})
                                            </button>
                                        )}
                                        {expiredPredictions.length > 0 && (
                                            <button
                                                onClick={handleDeleteAll}
                                                disabled={deletingPredictions}
                                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                                Hapus Semua
                                            </button>
                                        )}
                                        <button
                                            onClick={fetchExpiredPredictions}
                                            disabled={loadingPredictions}
                                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        >
                                            {loadingPredictions
                                                ? "Loading..."
                                                : "Refresh"}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Prediksi kapan bahan akan expired
                                    menggunakan AI (gemma3:1b)
                                </p>

                                {loadingPredictions ? (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">
                                            Memuat prediksi expired...
                                        </p>
                                    </div>
                                ) : expiredPredictions.length > 0 ? (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-br from-purple-50 to-purple-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selectedPredictions.length ===
                                                                        expiredPredictions.length &&
                                                                    expiredPredictions.length >
                                                                        0
                                                                }
                                                                onChange={
                                                                    handleSelectAll
                                                                }
                                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                            />
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Nama Bahan
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Kategori
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Prediksi Expired
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Alasan
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Confidence
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Dibuat
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                            Aksi
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {expiredPredictions.map(
                                                        (prediction) => {
                                                            const expiredDate =
                                                                new Date(
                                                                    prediction.tanggal_prediksi_expired
                                                                );
                                                            const today =
                                                                new Date();
                                                            const daysUntilExpired =
                                                                Math.ceil(
                                                                    (expiredDate -
                                                                        today) /
                                                                        (1000 *
                                                                            60 *
                                                                            60 *
                                                                            24)
                                                                );
                                                            const isExpiringSoon =
                                                                daysUntilExpired <=
                                                                7;
                                                            const isExpired =
                                                                daysUntilExpired <
                                                                0;

                                                            return (
                                                                <tr
                                                                    key={
                                                                        prediction.id_prediksi
                                                                    }
                                                                    className={`hover:bg-gray-50 transition-colors ${
                                                                        isExpired
                                                                            ? "bg-red-50"
                                                                            : isExpiringSoon
                                                                            ? "bg-yellow-50"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedPredictions.includes(
                                                                                prediction.id_prediksi
                                                                            )}
                                                                            onChange={() =>
                                                                                handleSelectPrediction(
                                                                                    prediction.id_prediksi
                                                                                )
                                                                            }
                                                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-semibold text-gray-900">
                                                                            {
                                                                                prediction.nama_bahan
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                            {
                                                                                prediction.kategori
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-semibold">
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                <span
                                                                                    className={
                                                                                        isExpired
                                                                                            ? "text-red-600"
                                                                                            : isExpiringSoon
                                                                                            ? "text-yellow-600"
                                                                                            : "text-gray-700"
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        prediction.tanggal_prediksi_expired
                                                                                    }
                                                                                </span>
                                                                                {isExpired ? (
                                                                                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                                                                                        Expired ({Math.abs(daysUntilExpired)} hari lalu)
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                        isExpiringSoon
                                                                                            ? "bg-yellow-100 text-yellow-700"
                                                                                            : daysUntilExpired <= 30
                                                                                            ? "bg-orange-100 text-orange-700"
                                                                                            : "bg-green-100 text-green-700"
                                                                                    }`}>
                                                                                        {daysUntilExpired} hari lagi
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="text-sm text-gray-700 max-w-md">
                                                                            {
                                                                                prediction.alasan_prediksi
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                                <div
                                                                                    className={`h-2 rounded-full ${
                                                                                        prediction.confidence_score >=
                                                                                        80
                                                                                            ? "bg-green-500"
                                                                                            : prediction.confidence_score >=
                                                                                              60
                                                                                            ? "bg-yellow-500"
                                                                                            : "bg-red-500"
                                                                                    }`}
                                                                                    style={{
                                                                                        width: `${prediction.confidence_score}%`,
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                            <span className="text-sm font-semibold text-gray-700">
                                                                                {
                                                                                    prediction.confidence_score
                                                                                }

                                                                                %
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm text-gray-500">
                                                                            {new Date(
                                                                                prediction.created_at
                                                                            ).toLocaleDateString(
                                                                                "id-ID"
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            {
                                                                                prediction.created_by
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeletePrediction(
                                                                                    prediction.id_prediksi,
                                                                                    prediction.nama_bahan
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                deletingPredictions
                                                                            }
                                                                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                                            title="Hapus prediksi"
                                                                        >
                                                                            <svg
                                                                                className="w-4 h-4"
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
                                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                                />
                                                                            </svg>
                                                                            Hapus
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            Belum Ada Prediksi Expired
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Klik tombol "Generate Prediksi
                                            Expired" untuk membuat prediksi
                                            kapan bahan akan expired menggunakan
                                            AI.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationManagement;
