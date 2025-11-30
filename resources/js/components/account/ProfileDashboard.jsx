import React from "react";

function ProfileDashboard({ profile }) {
    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 via-white to-blue-50 px-6 py-8">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
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

                            {/* Profile Info */}
                        <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {profile.name}
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
                                {new Date(profile.joinDate).toLocaleDateString("id-ID")}
                                </p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Lengkap
                            </label>
                            <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                {profile.name}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                {profile.email || "-"}
                                </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nomor Telepon
                            </label>
                                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                {profile.phone || "-"}
                                </p>
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role
                            </label>
                            <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                                {profile.role}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileDashboard;
