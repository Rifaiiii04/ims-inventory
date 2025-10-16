import React from "react";
import { ChevronDownIcon } from "./Icons";

function MenuItemWithSubmenu({
    icon,
    label,
    isOpen,
    onToggle,
    children,
    isCollapsed = false,
    isActive = false,
}) {
    // Jika collapsed, render hanya icon (no submenu)
    if (isCollapsed) {
        return (
            <li className="w-full">
                <div
                    className={`group relative flex items-center justify-center cursor-pointer transition-all duration-200 py-3 px-2 rounded-xl ${
                        isActive
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                            : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 hover:shadow-md"
                    }`}
                    onClick={onToggle}
                    title={label}
                >
                    <div
                        className={`transition-transform duration-200 ${
                            isActive ? "scale-110" : "group-hover:scale-105"
                        }`}
                    >
                        {icon}
                    </div>
                </div>
            </li>
        );
    }

    // Expanded: show full menu with submenu
    return (
        <li className="w-full">
            {/* Main Menu Item */}
            <div
                className={`group relative flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 py-3 px-4 rounded-xl ${
                    isActive
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 hover:shadow-md"
                }`}
                onClick={onToggle}
            >
                {/* Active indicator */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}

                <div className="flex items-center gap-3">
                    <div
                        className={`transition-transform duration-200 ${
                            isActive ? "scale-110" : "group-hover:scale-105"
                        }`}
                    >
                        {icon}
                    </div>
                    <span
                        className={`font-medium transition-all duration-200 ${
                            isActive
                                ? "text-white font-semibold"
                                : "group-hover:font-semibold"
                        }`}
                    >
                        {label}
                    </span>
                </div>

                <div
                    className={`transition-all duration-200 ${
                        isOpen ? "rotate-180" : ""
                    } ${
                        isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-green-600"
                    }`}
                >
                    <ChevronDownIcon isOpen={isOpen} />
                </div>

                {/* Hover effect indicator */}
                {!isActive && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-0 bg-green-500 rounded-full transition-all duration-200 group-hover:h-6"></div>
                )}
            </div>

            {/* Submenu */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
            >
                <ul className="ml-6 space-y-1">{children}</ul>
            </div>
        </li>
    );
}

export default MenuItemWithSubmenu;
