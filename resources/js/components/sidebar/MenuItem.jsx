import React from "react";

function MenuItem({
    icon,
    label,
    onClick,
    isActive = false,
    isCollapsed = false,
}) {
    return (
        <li
            className={`group relative w-full ${
                isCollapsed ? "flex justify-center" : ""
            }`}
            onClick={onClick}
            title={isCollapsed ? label : ""}
        >
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 hover:shadow-md"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
            >
                {/* Active indicator */}
                {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}

                {/* Icon */}
                <div
                    className={`transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                >
                    {icon}
                </div>

                {/* Label */}
                {!isCollapsed && (
                    <span
                        className={`font-medium transition-all duration-200 ${
                            isActive
                                ? "text-white font-semibold"
                                : "group-hover:font-semibold"
                        }`}
                    >
                        {label}
                    </span>
                )}

                {/* Hover effect indicator */}
                {!isActive && !isCollapsed && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-0 bg-green-500 rounded-full transition-all duration-200 group-hover:h-6"></div>
                )}
            </div>
        </li>
    );
}

export default MenuItem;
