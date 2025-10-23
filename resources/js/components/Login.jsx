import React, { useEffect } from "react";
import LoginForm from "./LoginForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DecorativeImage from "./DecorativeImage";
import foodImg from "../../assets/food.png";
import stockImg from "../../assets/stok.png";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated && !loading) {
            const from = location.state?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, loading, navigate, location]);

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render login form if already authenticated
    if (isAuthenticated) {
        return null;
    }

    const handleLogin = (credentials) => {
        console.log("Login Attempt:", credentials);
        // Navigation will be handled by useEffect when isAuthenticated changes
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}></div>
            </div>
            
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-green-500/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>

                {/* Login Form Container */}
                <div className="relative z-10 w-full max-w-md mx-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Welcome to{" "}
                                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                    IMS Admin
                                </span>
                            </h1>
                            <p className="text-gray-600 text-sm">Sign in to your account</p>
                        </div>

                        {/* Login Form */}
                        <LoginForm onSubmit={handleLogin} />
                    </div>
                </div>

                {/* Decorative Images - Hidden on mobile, visible on larger screens */}
                <div className="hidden lg:block absolute top-20 left-20 opacity-20">
                    <DecorativeImage
                        src={foodImg}
                        alt="Food decoration"
                        position="left"
                    />
                </div>
                <div className="hidden lg:block absolute bottom-20 right-20 opacity-20">
                    <DecorativeImage
                        src={stockImg}
                        alt="Stock decoration"
                        position="right"
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;
