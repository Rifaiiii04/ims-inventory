import React from "react";

function QuickActionButton({ icon, label, onClick, variant = "primary" }) {
    const variantClasses = {
        primary:
            "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl border-2 border-green-500",
        secondary:
            "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-white text-gray-700 border-2 border-gray-300 hover:border-green-500 shadow-md hover:shadow-lg",
        outline:
            "bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-white text-green-600 border-2 border-green-500 hover:border-green-600 shadow-md hover:shadow-lg",
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center md:justify-start gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl transition-all duration-300 font-semibold text-sm md:text-base hover:scale-105 active:scale-95 ${variantClasses[variant]}`}
        >
            <div className="flex-shrink-0">{icon}</div>
            <span className="truncate">{label}</span>
        </button>
    );
}

export default QuickActionButton;
