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
        <div className="bg-gradient-to-r from-white to-gray-50 shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {title}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    {showLiveIndicator && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-500 font-medium">
                                Live Updates
                            </span>
                        </div>
                    )}
                    {buttonText && (
                        <button
                            onClick={onButtonClick}
                            className={getButtonStyles()}
                        >
                            {buttonIcon && (
                                <div className="w-5 h-5">{buttonIcon}</div>
                            )}
                            {buttonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TopBar;
