import React from "react";

function SidebarToggle({ isCollapsed, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className="absolute -right-4 top-24 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200/50 rounded-full p-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-xl z-10 group"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            <div className="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`size-4 transition-all duration-300 ${
                        isCollapsed ? "rotate-180" : ""
                    } text-gray-600 group-hover:text-green-600`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                </svg>

                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
            </div>
        </button>
    );
}

export default SidebarToggle;
