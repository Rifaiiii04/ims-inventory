import React, { useState, useEffect } from "react";
import axios from "axios";

function PreferenceSettings() {
    const [notificationEnabled, setNotificationEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notifications/settings', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                setNotificationEnabled(response.data.data.notification_enabled);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleNotification = async (enabled) => {
        try {
            setSaving(true);
            const response = await axios.put('/api/notifications/settings', {
                notification_enabled: enabled
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                setNotificationEnabled(enabled);
            } else {
                alert('Gagal memperbarui pengaturan');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Gagal memperbarui pengaturan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-5 border-b border-gray-200/50">
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
                                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Pengaturan Notifikasi
                            </h3>
                            <p className="text-sm text-gray-500">
                                Kelola pengaturan notifikasi stok
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-1">
                                Notifikasi Stok Menipis
                            </div>
                            <div className="text-sm text-gray-600">
                                {notificationEnabled 
                                    ? 'Notifikasi akan dikirim otomatis ke WhatsApp ketika stok bahan di bawah batas minimum'
                                    : 'Notifikasi dinonaktifkan. Tidak ada notifikasi yang akan dikirim'}
                            </div>
                        </div>
                        <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                    checked={notificationEnabled}
                                    onChange={(e) => handleToggleNotification(e.target.checked)}
                                    disabled={loading || saving}
                            />
                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`${notificationEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl p-4`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${notificationEnabled ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
                                {notificationEnabled ? (
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
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                ) : (
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
                                            d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">
                                    Status: {notificationEnabled ? 'Aktif' : 'Nonaktif'}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {notificationEnabled 
                                        ? 'Notifikasi otomatis dikirim ke WhatsApp melalui n8n'
                                        : 'Notifikasi dinonaktifkan. Aktifkan untuk menerima notifikasi stok menipis'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-blue-900 mb-3">
                                    Cara Kerja Notifikasi Stok
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                                        <span>Notifikasi <strong>otomatis dikirim</strong> ke WhatsApp melalui n8n ketika stok bahan <strong>di bawah batas minimum</strong> (min_stok)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                                        <span>Batas minimum stok diatur di halaman <strong>"Pengelolaan Stok"</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                                        <span>Notifikasi dikirim <strong>real-time</strong> setiap kali stok menipis setelah transaksi</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                                        <span>Terdapat <strong>cooldown 5 menit</strong> untuk mencegah spam notifikasi</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                                        <span>Untuk melihat dan mengirim notifikasi manual, kunjungi halaman <strong>"Kelola Notifikasi"</strong></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PreferenceSettings;
