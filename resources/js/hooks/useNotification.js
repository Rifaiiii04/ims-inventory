import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const useNotification = () => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get("/api/notifications");

            if (response.data.success) {
                setNotifications(response.data.data);
            } else {
                setError(
                    response.data.message || "Gagal mengambil data notifikasi"
                );
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengambil data notifikasi"
            );
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const createNotification = async (notificationData) => {
        try {
            const response = await axios.post(
                "/api/notifications",
                notificationData
            );

            if (response.data.success) {
                await fetchNotifications(); // Refresh data
                return { success: true, message: "Notifikasi berhasil dibuat" };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal membuat notifikasi",
                };
            }
        } catch (err) {
            console.error("Error creating notification:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat membuat notifikasi",
            };
        }
    };

    const updateNotification = async (id, notificationData) => {
        try {
            const response = await axios.put(
                `/api/notifications/${id}`,
                notificationData
            );

            if (response.data.success) {
                await fetchNotifications(); // Refresh data
                return {
                    success: true,
                    message: "Notifikasi berhasil diperbarui",
                };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal memperbarui notifikasi",
                };
            }
        } catch (err) {
            console.error("Error updating notification:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat memperbarui notifikasi",
            };
        }
    };

    const deleteNotification = async (id) => {
        try {
            const response = await axios.delete(`/api/notifications/${id}`);

            if (response.data.success) {
                await fetchNotifications(); // Refresh data
                return {
                    success: true,
                    message: "Notifikasi berhasil dihapus",
                };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal menghapus notifikasi",
                };
            }
        } catch (err) {
            console.error("Error deleting notification:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menghapus notifikasi",
            };
        }
    };

    const markAsRead = async (id) => {
        try {
            const response = await axios.put(`/api/notifications/${id}/read`);

            if (response.data.success) {
                await fetchNotifications(); // Refresh data
                return {
                    success: true,
                    message: "Notifikasi ditandai sebagai dibaca",
                };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal menandai notifikasi",
                };
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menandai notifikasi",
            };
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await axios.put(
                "/api/notifications/mark-all-read"
            );

            if (response.data.success) {
                await fetchNotifications(); // Refresh data
                return {
                    success: true,
                    message: "Semua notifikasi ditandai sebagai dibaca",
                };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message ||
                        "Gagal menandai semua notifikasi",
                };
            }
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menandai semua notifikasi",
            };
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        error,
        fetchNotifications,
        createNotification,
        updateNotification,
        deleteNotification,
        markAsRead,
        markAllAsRead,
        refreshData: fetchNotifications,
    };
};
