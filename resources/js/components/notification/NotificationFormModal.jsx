import React, { useState, useEffect } from "react";

function NotificationFormModal({ notification, onClose, onSave }) {
    const [formData, setFormData] = useState({
        productName: "",
        category: "",
        minStockLimit: "",
        notificationSchedule: "",
        isActive: true,
    });

    const categories = [
        "Bahan Utama",
        "Bahan Pokok",
        "Bumbu & Rempah",
        "Sayuran",
        "Ikan Asin",
        "Minuman",
    ];

    const schedules = ["Harian", "2x Sehari", "Mingguan"];

    const products = [
        "Ayam Utuh",
        "Lele",
        "Nila",
        "Cumi",
        "Beras",
        "Tahu Bumbu Kuning",
        "Tempe Bumbu Kuning",
        "Tempe Bacem",
        "Tahu Bacem",
        "Bumbu Halus",
        "Rempah Kering",
        "Kangkung",
        "Terong",
        "Timun",
        "Ikan Asin Japuh",
        "Ikan Asin Peda",
        "Ikan Asin Pindang",
        "Teh",
        "Jeruk",
        "Es Batu",
    ];

    useEffect(() => {
        if (notification) {
            setFormData({
                productName: notification.productName || "",
                category: notification.category || "",
                minStockLimit: notification.minStockLimit || "",
                notificationSchedule: notification.notificationSchedule || "",
                isActive:
                    notification.isActive !== undefined
                        ? notification.isActive
                        : true,
            });
        }
    }, [notification]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            formData.productName &&
            formData.category &&
            formData.minStockLimit &&
            formData.notificationSchedule
        ) {
            onSave(formData);
        } else {
            alert("Mohon lengkapi semua field yang diperlukan");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 border-b border-gray-200 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {notification
                                        ? "Edit Notifikasi"
                                        : "Tambah Notifikasi Baru"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {notification
                                        ? "Update konfigurasi notifikasi"
                                        : "Konfigurasi notifikasi stok produk"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Produk{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">Pilih produk</option>
                                {products.map((product) => (
                                    <option key={product} value={product}>
                                        {product}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">Pilih kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Stock Limit */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Batas Minimum Stok{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="minStockLimit"
                                value={formData.minStockLimit}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Masukkan batas minimum"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Notifikasi akan muncul ketika stok di bawah
                                batas ini
                            </p>
                        </div>

                        {/* Notification Schedule */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jadwal Notifikasi{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="notificationSchedule"
                                value={formData.notificationSchedule}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">Pilih jadwal</option>
                                {schedules.map((schedule) => (
                                    <option key={schedule} value={schedule}>
                                        {schedule}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label className="text-sm font-semibold text-gray-700">
                            Aktifkan notifikasi
                        </label>
                        <span className="text-xs text-gray-500">
                            (Notifikasi akan dikirim sesuai jadwal)
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {notification
                                ? "Update Notifikasi"
                                : "Tambah Notifikasi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NotificationFormModal;
