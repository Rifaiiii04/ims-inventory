import React, { useState } from "react";

function ProfileDashboard({ profile, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(profile);

    const handleEdit = () => {
        setEditData(profile);
        setIsEditing(true);
    };

    const handleSave = () => {
        onUpdate(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(profile);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEditData({ ...editData, avatar: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 via-white to-blue-50 px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                                    {profile.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt="Profile"
                                            className="w-full h-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        profile.name.charAt(0)
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-green-600 transition-colors">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-4 h-4 text-white"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                            />
                                        </svg>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editData.name}
                                            onChange={handleChange}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    ) : (
                                        profile.name
                                    )}
                                </h2>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-sm font-semibold">
                                        {profile.role}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">
                                            {profile.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    Bergabung sejak{" "}
                                    {new Date(
                                        profile.joinDate
                                    ).toLocaleDateString("id-ID")}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                        />
                                    </svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                    {profile.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nomor Telepon
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            ) : (
                                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                    {profile.phone}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Terakhir Login
                            </label>
                            <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                {profile.lastLogin}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status Akun
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-600 font-semibold">
                                    Aktif
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
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
                                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                Ubah Password
                            </h3>
                            <p className="text-sm text-gray-500">
                                Update password untuk keamanan
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
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
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                Verifikasi Akun
                            </h3>
                            <p className="text-sm text-gray-500">
                                Status: Terverifikasi
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
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
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                Aktivitas Terbaru
                            </h3>
                            <p className="text-sm text-gray-500">
                                Login: {profile.lastLogin}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileDashboard;
