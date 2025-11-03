import React from "react";

function TopBar({
    title,
    subtitle,
    buttonText,
    buttonIcon,
    onButtonClick,
    showLiveIndicator = true,
    buttonColor = "green",
    buttonVariant = "primary",
    showSearch = false,
    searchValue = "",
    onSearchChange = null,
    searchPlaceholder = "Cari...",
}) {
    const getButtonStyles = () => {
        const baseStyles =
            "px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2";

        if (buttonVariant === "primary") {
            if (buttonColor === "green") {
                return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`;
            } else if (buttonColor === "blue") {
                return `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700`;
            } else if (buttonColor === "red") {
                return `${baseStyles} bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700`;
            } else if (buttonColor === "purple") {
                return `${baseStyles} bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700`;
            }
        } else if (buttonVariant === "secondary") {
            return `${baseStyles} bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
        }

        return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`;
    };

    return (
        <div className="bg-gradient-to-r from-white to-gray-50 shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                        {title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                        {subtitle}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {showSearch && (
                        <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) =>
                                    onSearchChange &&
                                    onSearchChange(e.target.value)
                                }
                                placeholder={searchPlaceholder}
                                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                            />
                            {searchValue && (
                                <button
                                    onClick={() =>
                                        onSearchChange && onSearchChange("")
                                    }
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg
                                        className="h-4 w-4 text-gray-400 hover:text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                    {showLiveIndicator && (
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                                Live Updates
                            </span>
                            <span className="text-xs text-gray-500 font-medium sm:hidden">
                                Live
                            </span>
                        </div>
                    )}
                    {buttonText && (
                        <button
                            onClick={onButtonClick}
                            className={`${getButtonStyles()} order-2 sm:order-3 w-full sm:w-auto justify-center`}
                        >
                            {buttonIcon && (
                                <div className="w-5 h-5">{buttonIcon}</div>
                            )}
                            <span className="hidden sm:inline">
                                {buttonText}
                            </span>
                            <span className="sm:hidden">Tambah</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TopBar;
