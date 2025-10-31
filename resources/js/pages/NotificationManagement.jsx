import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import NotificationTable from "../components/notification/NotificationTable";
import NotificationFormModal from "../components/notification/NotificationFormModal";
import { useNotification } from "../hooks/useNotification";

function NotificationManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    // Use notification hook for real data
    const {
        notifications: notificationData,
        loading,
        error,
        createNotification,
        updateNotification,
        deleteNotification,
        markAsRead,
        markAllAsRead,
        refreshData,
    } = useNotification();

    // Handle tambah notifikasi baru
    const handleAddNotification = async (newNotification) => {
        const result = await createNotification(newNotification);
        if (result.success) {
            setShowFormModal(false);
            alert(result.message);
        } else {
            alert(`Error: ${result.message}`);
        }
    };

    // Handle edit notifikasi
    const handleEditNotification = (notification) => {
        setEditingNotification(notification);
        setShowFormModal(true);
    };

    // Handle update notifikasi
    const handleUpdateNotification = async (updatedNotification) => {
        const result = await updateNotification(
            editingNotification.id,
            updatedNotification
        );
        if (result.success) {
            setShowFormModal(false);
            setEditingNotification(null);
            alert(result.message);
        } else {
            alert(`Error: ${result.message}`);
        }
    };

    // Handle delete notifikasi
    const handleDeleteNotification = async (id) => {
        if (
            window.confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")
        ) {
            const result = await deleteNotification(id);
            if (result.success) {
                alert(result.message);
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    };

    // Handle toggle status
    const handleToggleStatus = async (id) => {
        const notification = notificationData.find((n) => n.id === id);
        if (notification) {
            const updatedData = {
                aktif: notification.status === "active" ? false : true,
            };
            const result = await updateNotification(id, updatedData);
            if (result.success) {
                alert(result.message);
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    };

    // Handle mark as read
    const handleMarkAsRead = async (id) => {
        const result = await markAsRead(id);
        if (result.success) {
            alert(result.message);
        } else {
            alert(`Error: ${result.message}`);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        const result = await markAllAsRead();
        if (result.success) {
            alert(result.message);
        } else {
            alert(`Error: ${result.message}`);
        }
    };

    // Calculate statistics
    const activeNotifications =
        notificationData?.filter((n) => n.status === "active").length || 0;
    const totalNotifications = notificationData?.length || 0;
    const unreadNotifications =
        notificationData?.filter((n) => n.status === "unread").length || 0;

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
                        title="Kelola Notifikasi"
                        subtitle="Manajemen notifikasi sistem"
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                Memuat data notifikasi...
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
                        title="Kelola Notifikasi"
                        subtitle="Manajemen notifikasi sistem"
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Terjadi Kesalahan
                            </h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => refreshData()}
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
                    title="Kelola Notifikasi"
                    subtitle="Manajemen notifikasi sistem"
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFormModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center gap-2"
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
                                Tambah Notifikasi
                            </button>
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 flex items-center gap-2"
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
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Tandai Semua Dibaca
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Total Notifikasi
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {totalNotifications}
                            </h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Aktif
                            </p>
                            <h3 className="text-2xl font-bold text-green-600">
                                {activeNotifications}
                            </h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 uppercase">
                                Belum Dibaca
                            </p>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {unreadNotifications}
                            </h3>
                        </div>
                    </div>

                    {/* Notification Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <NotificationTable
                            notifications={notificationData || []}
                            onEdit={handleEditNotification}
                            onDelete={handleDeleteNotification}
                            onToggleStatus={handleToggleStatus}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <NotificationFormModal
                    notification={editingNotification}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingNotification(null);
                    }}
                    onSubmit={
                        editingNotification
                            ? handleUpdateNotification
                            : handleAddNotification
                    }
                />
            )}
        </div>
    );
}

export default NotificationManagement;
