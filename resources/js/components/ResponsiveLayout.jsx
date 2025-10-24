import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

function ResponsiveLayout({
    children,
    title,
    subtitle,
    showTopBar = true,
    className = "",
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
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

            {/* Sidebar */}
            <div
                className={`fixed lg:relative lg:block z-40 transition-transform duration-300 h-full ${
                    isMobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="h-full p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 lg:bg-transparent">
                    <Sidebar />
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {showTopBar && (
                    <TopBar
                        title={title}
                        subtitle={subtitle}
                        onMenuClick={() =>
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                        }
                    />
                )}

                {/* Content */}
                <div className={`flex-1 overflow-y-auto ${className}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default ResponsiveLayout;
