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
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Kelola Notifikasi"
                        subtitle="Manajemen notifikasi sistem"
                        onMenuClick={() =>
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                        }
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
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar
                        title="Kelola Notifikasi"
                        subtitle="Manajemen notifikasi sistem"
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
        <>
            <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
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
                    className={`${
                        isMobileMenuOpen ? "block" : "hidden"
                    } md:block fixed md:relative inset-0 z-40`}
                >
                    <div className="h-full w-80">
                        <Sidebar />
                    </div>
                    {isMobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <TopBar
                        title="Kelola Notifikasi"
                        subtitle="Manajemen notifikasi stok dan jadwal alert"
                        buttonText="Tambah Notifikasi"
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
                        onButtonClick={() => setShowFormModal(true)}
                        buttonColor="blue"
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-600 mb-1">
                                            Total Notifikasi
                                        </p>
                                        <h3 className="text-2xl font-bold text-blue-700">
                                            {totalNotifications}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-blue-600"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-green-600 mb-1">
                                            Aktif
                                        </p>
                                        <h3 className="text-2xl font-bold text-green-700">
                                            {activeNotifications}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-green-600"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-600 mb-1">
                                            Belum Dibaca
                                        </p>
                                        <h3 className="text-2xl font-bold text-blue-700">
                                            {unreadNotifications}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-blue-600"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-purple-600 mb-1">
                                            Hari Ini
                                        </p>
                                        <h3 className="text-2xl font-bold text-purple-700">
                                            {
                                                notificationData.filter((n) =>
                                                    n.lastNotified?.includes(
                                                        "2024-01-15"
                                                    )
                                                ).length
                                            }
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-purple-600"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
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
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span>Tandai Semua Dibaca</span>
                                </button>
                                <button
                                    onClick={refreshData}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
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
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                    <span>Refresh</span>
                                </button>
                            </div>
                            <div className="text-sm text-gray-500">
                                Total: {totalNotifications} notifikasi
                            </div>
                        </div>

                        {/* Notification Table */}
                        <NotificationTable
                            data={notificationData}
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
                    onSave={
                        editingNotification
                            ? handleUpdateNotification
                            : handleAddNotification
                    }
                />
            )}
        </>
    );
}

export default NotificationManagement;
