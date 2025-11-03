import React from "react";

function MobileSidebarToggle({ isMobileMenuOpen, setIsMobileMenuOpen }) {
    return (
        <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden fixed top-4 right-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
            aria-label="Toggle mobile menu"
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
    );
}

export default MobileSidebarToggle;

