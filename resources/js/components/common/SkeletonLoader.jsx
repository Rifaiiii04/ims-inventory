import React from "react";

/**
 * Skeleton Loading Components
 * Provides various skeleton loaders for better UX
 */

// Skeleton Card for Summary Cards
export const SkeletonCard = ({ className = "" }) => (
    <div
        className={`bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-5 animate-pulse ${className}`}
    >
        <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
);

// Skeleton for Product Card
export const SkeletonProductCard = () => (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 md:p-5 animate-pulse">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto mb-3 md:mb-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 min-w-0">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="text-left md:text-right w-full md:w-auto pl-16 md:pl-0">
                <div className="h-6 bg-gray-200 rounded w-28 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    </div>
);

// Skeleton for Table Row
export const SkeletonTableRow = ({ columns = 5 }) => (
    <tr className="animate-pulse">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
        ))}
    </tr>
);

// Skeleton for Chart Container
export const SkeletonChart = ({ height = 300 }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div
            className="bg-gray-100 rounded-lg"
            style={{ height: `${height}px` }}
        ></div>
    </div>
);

// Skeleton for Dashboard
export const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>

        {/* Top Products Skeleton */}
        <div>
            <div className="h-6 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="space-y-3 md:space-y-4">
                <SkeletonProductCard />
                <SkeletonProductCard />
                <SkeletonProductCard />
            </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
        </div>
    </div>
);

// Generic Loading Spinner with better styling
export const LoadingSpinner = ({
    size = "md",
    text = "Memuat data...",
    className = "",
    fullScreen = false,
}) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    const content = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3`}
            ></div>
            {text && (
                <p className="text-gray-600 text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
};

// Inline Loading with shimmer effect
export const InlineLoader = ({ text = "Memuat..." }) => (
    <div className="flex items-center justify-center gap-2 py-4">
        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">{text}</span>
    </div>
);

// Page Loading Overlay
export const PageLoader = ({ text = "Memuat data..." }) => (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium text-lg">{text}</p>
            <p className="text-gray-500 text-sm mt-2">
                Mohon tunggu sebentar...
            </p>
        </div>
    </div>
);

export default LoadingSpinner;

