import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

function LoginForm({ onSubmit }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loading, error, clearError } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        const result = await login({ username, password, rememberMe });

        if (result.success) {
            // Call the original onSubmit if provided (for backward compatibility)
            if (onSubmit) {
                onSubmit({ username, password });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
                <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                >
                    Username
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                        required
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                        required
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex">
                        <div className="shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700"
                    >
                        Remember me
                    </label>
                </div>
                <div className="text-sm">
                    <a
                        href="#"
                        className="font-medium text-green-600 hover:text-green-500 transition-colors"
                    >
                        Forgot password?
                    </a>
                </div>
            </div>

            {/* Login Button */}
            <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {loading ? (
                    <LoadingSpinner size="sm" text="" />
                ) : (
                    <>
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg
                                className="h-5 w-5 text-green-500 group-hover:text-green-400 transition-colors"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                        Sign in
                    </>
                )}
            </button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 text-center mb-2">
                    Demo Credentials:
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                    <p>
                        <span className="font-medium">Admin:</span> admin /
                        admin123
                    </p>
                    <p>
                        <span className="font-medium">Kasir:</span> kasir /
                        kasir123
                    </p>
                </div>
            </div>
        </form>
    );
}

export default LoginForm;
