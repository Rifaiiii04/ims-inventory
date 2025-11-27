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

    // Fetch low stock items and settings
    useEffect(() => {
        fetchLowStockItems();
        fetchNotificationSettings();
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
            const response = await axios.get("/api/notifications/settings", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.data.success) {
                setNotificationEnabled(response.data.data.notification_enabled);
            }
        } catch (err) {
            console.error("Error fetching notification settings:", err);
            // Default to enabled if error
            setNotificationEnabled(true);
        } finally {
            setLoadingSettings(false);
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationManagement;
