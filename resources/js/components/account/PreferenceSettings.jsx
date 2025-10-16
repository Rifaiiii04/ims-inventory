import React, { useState } from "react";

function PreferenceSettings({ preferences, onUpdate }) {
    const [settings, setSettings] = useState(preferences);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        setSettings((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        onUpdate({ [name]: newValue });
    };

    const handleThemeChange = (theme) => {
        setSettings((prev) => ({ ...prev, theme }));
        onUpdate({ theme });
    };

    const handleLanguageChange = (language) => {
        setSettings((prev) => ({ ...prev, language }));
        onUpdate({ language });
    };

    return (
        <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Tema Tampilan
                            </h3>
                            <p className="text-sm text-gray-500">
                                Pilih tema yang nyaman untuk mata
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleThemeChange("light")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                settings.theme === "light"
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-yellow-600"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">
                                        Mode Terang
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Tema terang untuk siang hari
                                    </div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleThemeChange("dark")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                settings.theme === "dark"
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
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
                                            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">
                                        Mode Gelap
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Tema gelap untuk malam hari
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Language Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-5 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c.17 0 .34.01.51.03m-6 0a48.474 48.474 0 0 0-6 .371m0 0c-.17 0-.34.01-.51.03m6 0a48.474 48.474 0 0 1 6-.371m0 0c.17 0 .34.01.51.03m-6 0a48.474 48.474 0 0 0-6 .371m0 0c-.17 0-.34.01-.51.03"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Bahasa
                            </h3>
                            <p className="text-sm text-gray-500">
                                Pilih bahasa antarmuka aplikasi
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleLanguageChange("id")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                settings.language === "id"
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-sm">
                                        🇮🇩
                                    </span>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">
                                        Bahasa Indonesia
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Bahasa resmi Indonesia
                                    </div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleLanguageChange("en")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                settings.language === "en"
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">
                                        🇺🇸
                                    </span>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">
                                        English
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        International language
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-5 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
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
                                Kelola notifikasi yang ingin diterima
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {/* WhatsApp Notification */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-green-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">
                                    Notifikasi WhatsApp
                                </div>
                                <div className="text-sm text-gray-500">
                                    Terima notifikasi via WhatsApp
                                </div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="whatsappNotification"
                                checked={settings.whatsappNotification}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Email Notification */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-blue-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                    />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">
                                    Notifikasi Email
                                </div>
                                <div className="text-sm text-gray-500">
                                    Terima notifikasi via email
                                </div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="emailNotification"
                                checked={settings.emailNotification}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-red-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">
                                    Alert Stok Menipis
                                </div>
                                <div className="text-sm text-gray-500">
                                    Notifikasi ketika stok hampir habis
                                </div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="lowStockAlert"
                                checked={settings.lowStockAlert}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Daily Report */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-purple-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">
                                    Laporan Harian
                                </div>
                                <div className="text-sm text-gray-500">
                                    Terima laporan harian otomatis
                                </div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="dailyReport"
                                checked={settings.dailyReport}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => onUpdate(settings)}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    Simpan Pengaturan
                </button>
            </div>
        </div>
    );
}

export default PreferenceSettings;
