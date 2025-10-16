import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import NotificationTable from "../components/notification/NotificationTable";
import NotificationFormModal from "../components/notification/NotificationFormModal";

function NotificationManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    // Data notifikasi berdasarkan observasi
    const [notificationData, setNotificationData] = useState([
        {
            id: 1,
            productName: "Ayam Utuh",
            category: "Bahan Utama",
            minStockLimit: 2,
            notificationSchedule: "Harian",
            isActive: true,
            lastNotified: "2024-01-15 08:00",
            createdBy: "Admin",
            createdAt: "2024-01-10",
        },
        {
            id: 2,
            productName: "Beras",
            category: "Bahan Pokok",
            minStockLimit: 5,
            notificationSchedule: "Harian",
            isActive: true,
            lastNotified: "2024-01-15 08:00",
            createdBy: "Admin",
            createdAt: "2024-01-10",
        },
        {
            id: 3,
            productName: "Kangkung",
            category: "Sayuran",
            minStockLimit: 3,
            notificationSchedule: "2x Sehari",
            isActive: true,
            lastNotified: "2024-01-15 12:00",
            createdBy: "Staff1",
            createdAt: "2024-01-12",
        },
        {
            id: 4,
            productName: "Tempe Bumbu Kuning",
            category: "Bahan Pokok",
            minStockLimit: 10,
            notificationSchedule: "Harian",
            isActive: false,
            lastNotified: "2024-01-14 08:00",
            createdBy: "Admin",
            createdAt: "2024-01-08",
        },
        {
            id: 5,
            productName: "Lele",
            category: "Bahan Utama",
            minStockLimit: 5,
            notificationSchedule: "Harian",
            isActive: true,
            lastNotified: "2024-01-15 08:00",
            createdBy: "Admin",
            createdAt: "2024-01-10",
        },
    ]);

    // Handle tambah notifikasi baru
    const handleAddNotification = (newNotification) => {
        const notification = {
            ...newNotification,
            id: notificationData.length + 1,
            createdAt: new Date().toISOString().split("T")[0],
            createdBy: "Admin", // TODO: Get from auth
            lastNotified: null,
        };
        setNotificationData([...notificationData, notification]);
        setShowFormModal(false);
    };

    // Handle edit notifikasi
    const handleEditNotification = (notification) => {
        setEditingNotification(notification);
        setShowFormModal(true);
    };

    // Handle update notifikasi
    const handleUpdateNotification = (updatedNotification) => {
        setNotificationData(
            notificationData.map((notification) =>
                notification.id === updatedNotification.id
                    ? updatedNotification
                    : notification
            )
        );
        setShowFormModal(false);
        setEditingNotification(null);
    };

    // Handle delete notifikasi
    const handleDeleteNotification = (id) => {
        if (
            window.confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")
        ) {
            setNotificationData(
                notificationData.filter(
                    (notification) => notification.id !== id
                )
            );
        }
    };

    // Handle toggle status
    const handleToggleStatus = (id) => {
        setNotificationData(
            notificationData.map((notification) =>
                notification.id === id
                    ? { ...notification, isActive: !notification.isActive }
                    : notification
            )
        );
    };

    // Calculate statistics
    const activeNotifications = notificationData.filter(
        (n) => n.isActive
    ).length;
    const totalNotifications = notificationData.length;
    const urgentNotifications = notificationData.filter(
        (n) => n.isActive && n.minStockLimit <= 3
    ).length;

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

                            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-red-600 mb-1">
                                            Urgent
                                        </p>
                                        <h3 className="text-2xl font-bold text-red-700">
                                            {urgentNotifications}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-red-600"
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

                        {/* Notification Table */}
                        <NotificationTable
                            data={notificationData}
                            onEdit={handleEditNotification}
                            onDelete={handleDeleteNotification}
                            onToggleStatus={handleToggleStatus}
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
