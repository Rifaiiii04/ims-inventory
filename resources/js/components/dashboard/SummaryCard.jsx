import React from "react";

function SummaryCard({ title, value, icon, color = "green", trend, alert }) {
    const colorClasses = {
        green: {
            bg: "bg-gradient-to-br from-green-50 to-green-100",
            text: "text-green-600",
            border: "border-green-200",
            shadow: "shadow-green-100",
        },
        blue: {
            bg: "bg-gradient-to-br from-blue-50 to-blue-100",
            text: "text-blue-600",
            border: "border-blue-200",
            shadow: "shadow-blue-100",
        },
        red: {
            bg: "bg-gradient-to-br from-red-50 to-red-100",
            text: "text-red-600",
            border: "border-red-200",
            shadow: "shadow-red-100",
        },
        yellow: {
            bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
            text: "text-yellow-600",
            border: "border-yellow-200",
            shadow: "shadow-yellow-100",
        },
        purple: {
            bg: "bg-gradient-to-br from-purple-50 to-purple-100",
            text: "text-purple-600",
            border: "border-purple-200",
            shadow: "shadow-purple-100",
        },
    };

    const colors = colorClasses[color];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
                        {title}
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                        {value}
                    </h3>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-4 text-green-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22"
                                />
                            </svg>
                            <p className="text-xs md:text-sm text-gray-600 font-medium">
                                {trend}
                            </p>
                        </div>
                    )}
                    {alert && (
                        <div className="mt-2 md:mt-3 flex items-center gap-2 text-red-600 text-xs md:text-sm font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-200 animate-pulse">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-4 md:size-5 flex-shrink-0"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                            <span className="truncate">{alert}</span>
                        </div>
                    )}
                </div>
                <div
                    className={`p-3 md:p-4 rounded-xl ${colors.bg} ${colors.text} border-2 ${colors.border} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default SummaryCard;
