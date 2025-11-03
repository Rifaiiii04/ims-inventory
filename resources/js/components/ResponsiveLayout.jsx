import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileSidebarToggle from "./sidebar/MobileSidebarToggle";

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
            <MobileSidebarToggle
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

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
