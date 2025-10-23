import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ProfileDashboard from "../components/account/ProfileDashboard";
import CashierManagement from "../components/account/CashierManagement";
import PreferenceSettings from "../components/account/PreferenceSettings";
import { useAuth } from "../contexts/AuthContext";

function AccountManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Get user level from AuthContext
    const { user } = useAuth();

    // Check if user has admin access
    const isAdmin = user?.level === "admin";

    // If not admin, redirect or show access denied
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Akses Ditolak
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Hanya administrator yang dapat mengakses halaman ini.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    // Data user profile - menggunakan data real dari user yang login
    const [profileData, setProfileData] = useState({
        id: user?.id || 1,
        name: user?.nama_user || "User",
        email: user?.email || "",
        role: user?.level === "admin" ? "Administrator" : "Kasir",
        phone: "+62 812-3456-7890", // Default phone
        avatar: null,
        joinDate: "2024-01-01", // Default join date
        lastLogin: new Date().toLocaleString("id-ID"), // Current time
        status: "Online",
    });

    // Data preferensi
    const [preferences, setPreferences] = useState({
        theme: "light",
        language: "id",
        whatsappNotification: true,
        emailNotification: true,
        lowStockAlert: true,
        dailyReport: true,
    });

    // Update profile data when user changes
    useEffect(() => {
        if (user) {
            const newProfileData = {
                id: user.id || 1,
                name: user.nama_user || "User",
                email: user.email || "",
                role: user.level === "admin" ? "Administrator" : "Kasir",
                phone: "+62 812-3456-7890", // Default phone
                avatar: null,
                joinDate: "2024-01-01", // Default join date
                lastLogin: new Date().toLocaleString("id-ID"), // Current time
                status: "Online",
            };
            setProfileData(newProfileData);
        }
    }, [user]);

    // Filter tabs based on user level
    const getTabs = () => {
        const allTabs = [
            { id: "profile", label: "Profile", icon: "👤" },
            { id: "cashier", label: "Manajemen Kasir", icon: "👥" },
            { id: "preferences", label: "Pengaturan", icon: "⚙️" },
        ];

        // For kasir, hide cashier management
        if (user?.level === "kasir") {
            return allTabs.filter((tab) => tab.id !== "cashier");
        }

        return allTabs;
    };

    const tabs = getTabs();

    const handleUpdateProfile = (updatedProfile) => {
        setProfileData({ ...profileData, ...updatedProfile });
    };

    const handleUpdatePreferences = (updatedPreferences) => {
        setPreferences({ ...preferences, ...updatedPreferences });
    };

    return (
        <>
            <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
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
                        title="Manajemen Akun"
                        subtitle="Kelola profil, akun kasir, dan pengaturan sistem"
                        showLiveIndicator={true}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Tab Navigation */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 mb-6 overflow-hidden">
                            <div className="flex">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                                            activeTab === tab.id
                                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-lg">
                                                {tab.icon}
                                            </span>
                                            <span>{tab.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-6">
                            {activeTab === "profile" && (
                                <ProfileDashboard
                                    profile={profileData}
                                    onUpdate={handleUpdateProfile}
                                />
                            )}

                            {activeTab === "cashier" && <CashierManagement />}

                            {activeTab === "preferences" && (
                                <PreferenceSettings
                                    preferences={preferences}
                                    onUpdate={handleUpdatePreferences}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AccountManagement;
