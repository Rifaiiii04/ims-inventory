import React, { useState, useEffect } from "react";

function CashierFormModal({ cashier, onClose, onSave }) {
    const [formData, setFormData] = useState({
        username: "",
        nama_user: "",
        email: "",
        password: "",
        status: "aktif",
    });

    useEffect(() => {
        if (cashier) {
            setFormData({
                username: cashier.username || "",
                nama_user: cashier.nama_user || "",
                email: cashier.email || "",
                password: "",
                status: cashier.status || "aktif",
            });
        }
    }, [cashier]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.username && formData.nama_user) {
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
                                {cashier ? "Edit Kasir" : "Tambah Kasir"}
                            </h2>
                            <p className="text-green-50 text-sm">
                                {cashier
                                    ? "Perbarui data kasir"
                                    : "Tambahkan kasir baru"}
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
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Masukkan username"
                                required
                            />
                        </div>

                        {/* Nama User */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Lengkap{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nama_user"
                                value={formData.nama_user}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="kasir@angkringan.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password{" "}
                                {!cashier && (
                                    <span className="text-red-500">*</span>
                                )}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder={
                                    cashier
                                        ? "Kosongkan jika tidak ingin mengubah"
                                        : "Masukkan password"
                                }
                                required={!cashier}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status Akun
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="status"
                                    value="aktif"
                                    checked={formData.status === "aktif"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Aktif
                                </span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="status"
                                    value="nonaktif"
                                    checked={formData.status === "nonaktif"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Nonaktif
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Password Info */}
                    {!cashier && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 text-blue-600"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-800 mb-1">
                                        Informasi Password
                                    </h4>
                                    <p className="text-sm text-blue-700">
                                        Password default akan dikirim ke email
                                        kasir. Kasir dapat mengubah password
                                        setelah login pertama kali.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                            {cashier ? "Update Kasir" : "Tambah Kasir"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CashierFormModal;
