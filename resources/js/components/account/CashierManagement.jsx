import React, { useState, useEffect } from "react";
import CashierFormModal from "./CashierFormModal";
import { useCashier } from "../../hooks/useCashier";

function CashierManagement() {
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCashier, setEditingCashier] = useState(null);

    // Use cashier hook for real data
    const {
        cashiers,
        statistics,
        loading,
        error,
        createCashier,
        updateCashier,
        deleteCashier,
        refreshData
    } = useCashier();

    const handleEdit = (cashier) => {
        setEditingCashier(cashier);
        setShowFormModal(true);
    };

    const handleAdd = () => {
        setEditingCashier(null);
        setShowFormModal(true);
    };

    const handleSave = async (cashierData) => {
        if (editingCashier) {
            const result = await updateCashier(editingCashier.id, cashierData);
            if (result.success) {
                setShowFormModal(false);
                setEditingCashier(null);
            } else {
                alert(result.message);
            }
        } else {
            const result = await createCashier(cashierData);
            if (result.success) {
                setShowFormModal(false);
                setEditingCashier(null);
            } else {
                alert(result.message);
            }
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus kasir ini?")) {
            const result = await deleteCashier(id);
            if (!result.success) {
                alert(result.message);
            }
        }
    };

    const getStatusBadge = (status) => {
        return status === "aktif"
            ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm"
            : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm";
    };

    const getStatusIcon = (status) => {
        return status === "aktif" ? "🟢" : "🔴";
    };

    const getStatusText = (status) => {
        return status === "aktif" ? "Aktif" : "Nonaktif";
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
                    <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-600">Memuat data kasir...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Terjadi Kesalahan</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={refreshData}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
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
                                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Manajemen Akun Kasir
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {statistics ? `${statistics.total_cashiers} akun kasir terdaftar` : `${cashiers.length} akun kasir terdaftar`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
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
                            Tambah Kasir
                        </button>
                    </div>
                </div>

                {/* Cashier List - Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>Kasir</span>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>Kontak</span>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>Status</span>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>Terakhir Login</span>
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
                            {cashiers.map((cashier, index) => (
                                <tr
                                    key={cashier.id}
                                    className={`group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                                        index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50/30"
                                    }`}
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {cashier.nama_user
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">
                                                    {cashier.nama_user}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {cashier.level}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm text-gray-800">
                                            {cashier.email || '-'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {cashier.username}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {getStatusIcon(cashier.status)}
                                            </span>
                                            <span
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(
                                                    cashier.status
                                                )}`}
                                            >
                                                {getStatusText(cashier.status)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm text-gray-700">
                                            {cashier.updated_at ? new Date(cashier.updated_at).toLocaleDateString('id-ID') : "Belum pernah"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() =>
                                                    handleEdit(cashier)
                                                }
                                                className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                title="Edit"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
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
                                                className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                title="Reset Password"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="size-4 group-hover/btn:scale-110 transition-transform"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(cashier.id)
                                                }
                                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group/btn"
                                                title="Hapus"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-gray-200/50">
                    {cashiers.map((cashier, index) => (
                        <div
                            key={cashier.id}
                            className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {cashier.nama_user.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">
                                            {cashier.nama_user}
                                        </h4>
                                        <div className="text-xs text-gray-500">
                                            {cashier.level}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">
                                            {getStatusIcon(cashier.status)}
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                                cashier.status
                                            )}`}
                                        >
                                            {getStatusText(cashier.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-gray-500 text-xs mb-1">
                                    Email:
                                </div>
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                    {cashier.email || '-'}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-gray-500 text-xs mb-1">
                                    Username:
                                </div>
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                    {cashier.username}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-gray-500 text-xs mb-1">
                                    Terakhir Update:
                                </div>
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                    {cashier.updated_at ? new Date(cashier.updated_at).toLocaleDateString('id-ID') : "Belum pernah"}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(cashier)}
                                    className="flex-1 py-2.5 text-green-600 bg-green-50 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors"
                                >
                                    Edit
                                </button>
                                <button className="flex-1 py-2.5 text-orange-600 bg-orange-50 rounded-xl text-xs font-semibold hover:bg-orange-100 transition-colors">
                                    Reset Pass
                                </button>
                                <button
                                    onClick={() => handleDelete(cashier.id)}
                                    className="flex-1 py-2.5 text-red-600 bg-red-50 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {cashiers.length === 0 && (
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
                                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                            Belum ada akun kasir
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                            Mulai tambahkan akun kasir untuk mengelola akses
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span>
                                Klik tombol "Tambah Kasir" untuk memulai
                            </span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <CashierFormModal
                    cashier={editingCashier}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingCashier(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default CashierManagement;
