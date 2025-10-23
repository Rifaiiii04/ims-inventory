import React from "react";

function InputModeToggle({ inputMode, onModeChange }) {
    return (
        <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                    type="button"
                    onClick={() => onModeChange("manual")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        inputMode === "manual"
                            ? "bg-white text-green-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                        Input Manual
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange("photo")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        inputMode === "photo"
                            ? "bg-white text-green-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        Upload Foto Struk
                    </div>
                </button>
            </div>
        </div>
    );
}

export default InputModeToggle;
