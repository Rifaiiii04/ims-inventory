import React, { useState, useEffect } from "react";
import axios from "axios";

function NotificationFormModal({ notification, onClose, onSave }) {
    const [formData, setFormData] = useState({
        id_bahan: "",
        jadwal: "",
        aktif: true,
    });

    const [bahanList, setBahanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const schedules = [
        { value: "harian", label: "Harian" },
        { value: "mingguan", label: "Mingguan" },
        { value: "real-time", label: "Real-time" },
    ];

    // Fetch bahan list from API
    useEffect(() => {
        const fetchBahan = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                    "/api/compositions/ingredients/list"
                );
                console.log("API Response:", response.data);
                if (response.data.success) {
                    setBahanList(response.data.data);
                    console.log("Bahan list set:", response.data.data);
                } else {
                    setError(
                        response.data.message || "Gagal mengambil data bahan"
                    );
                }
            } catch (error) {
                console.error("Error fetching bahan:", error);
                setError("Terjadi kesalahan saat mengambil data bahan");
            } finally {
                setLoading(false);
            }
        };

        fetchBahan();
    }, []);

    // Debug log untuk melihat state bahanList
    useEffect(() => {
        console.log("BahanList state:", bahanList);
        console.log("Loading state:", loading);
        console.log("Error state:", error);
    }, [bahanList, loading, error]);

    useEffect(() => {
        if (notification) {
            setFormData({
                id_bahan: notification.id_bahan || "",
                jadwal: notification.jadwal || "",
                aktif:
                    notification.aktif !== undefined
                        ? notification.aktif
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold mb-1">
                                {notification
                                    ? "Edit Notifikasi"
                                    : "Tambah Notifikasi"}
                            </h2>
                            <p className="text-green-50 text-sm">
                                {notification
                                    ? "Perbarui pengaturan notifikasi"
                                    : "Tambahkan notifikasi baru"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bahan */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Bahan{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="id_bahan"
                                value={formData.id_bahan}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                                disabled={loading}
                            >
                                <option value="">Pilih bahan</option>
                                {bahanList.map((bahan) => (
                                    <option
                                        key={bahan.id_bahan}
                                        value={bahan.id_bahan}
                                    >
                                        {bahan.nama_bahan}
                                    </option>
                                ))}
                            </select>
                            {loading && (
                                <p className="text-sm text-blue-500 mt-1">
                                    Memuat daftar bahan...
                                </p>
                            )}
                            {error && (
                                <p className="text-sm text-red-500 mt-1">
                                    {error}
                                </p>
                            )}
                            {!loading && !error && bahanList.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Tidak ada bahan tersedia
                                </p>
                            )}
                        </div>

                        {/* Display Min Stok dari Bahan */}
                        {formData.id_bahan && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-blue-600"
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
                                    <div>
                                        <p className="text-sm font-semibold text-blue-800">
                                            Batas Minimum Stok
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            {(() => {
                                                const selectedBahan =
                                                    bahanList.find(
                                                        (b) =>
                                                            b.id_bahan ==
                                                            formData.id_bahan
                                                    );
                                                return selectedBahan
                                                    ? `${selectedBahan.min_stok} ${selectedBahan.satuan}`
                                                    : "Tidak tersedia";
                                            })()}
                                        </p>
                                        <p className="text-xs text-blue-500 mt-1">
                                            Nilai ini diambil dari pengelolaan
                                            stok bahan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Jadwal Notifikasi */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jadwal Notifikasi{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="jadwal"
                                value={formData.jadwal}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">Pilih jadwal</option>
                                {schedules.map((schedule) => (
                                    <option
                                        key={schedule.value}
                                        value={schedule.value}
                                    >
                                        {schedule.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="aktif"
                            checked={formData.aktif}
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
