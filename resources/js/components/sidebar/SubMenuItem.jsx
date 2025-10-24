import React from "react";

function SubMenuItem({ icon, label, onClick, isActive = false }) {
    return (
        <li className="w-full">
            <div
                className={`group relative flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-200 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg ${
                    isActive
                        ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 font-semibold shadow-sm border-l-4 border-green-500"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:text-green-700 hover:font-medium"
                }`}
                onClick={onClick}
            >
                {/* Active indicator */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-r-full"></div>
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
                <span
                    className={`transition-all duration-200 text-sm sm:text-base ${
                        isActive
                            ? "text-green-700 font-semibold"
                            : "group-hover:font-medium"
                    }`}
                >
                    {label}
                </span>

                {/* Hover effect indicator */}
                {!isActive && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-0 bg-green-500 rounded-full transition-all duration-200 group-hover:h-4"></div>
                )}
            </div>
        </li>
    );
}

export default SubMenuItem;
