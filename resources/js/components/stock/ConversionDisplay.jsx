import React from "react";

function ConversionDisplay({ item }) {
    if (!item.conversion) return null;

    return (
        <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-blue-600"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                </svg>
                <span className="text-xs font-semibold text-blue-700">
                    Konversi Produksi
                </span>
            </div>
            <div className="text-sm text-gray-700">
                <div className="flex items-center justify-between">
                    <span className="font-medium">Input:</span>
                    <span className="text-blue-600 font-bold">
                        {item.quantity} {item.unit}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="font-medium">Output:</span>
                    <span className="text-green-600 font-bold">
                        {item.conversion}
                    </span>
                </div>
                {item.dailyNeed && (
                    <div className="flex items-center justify-between mt-1">
                        <span className="font-medium">Kebutuhan Harian:</span>
                        <span className="text-orange-600 font-bold">
                            {item.dailyNeed} {item.unit}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConversionDisplay;
