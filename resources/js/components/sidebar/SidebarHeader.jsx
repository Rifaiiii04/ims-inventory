import React from "react";

function SidebarHeader({
    title = "IMS Admin",
    subtitle = "Welcome",
    isCollapsed = false,
}) {
    if (isCollapsed) {
        // Collapsed view: Tampilkan lingkaran dengan inisial dan status indicator
        return (
            <div className="flex flex-col justify-center items-center w-20 h-24 border-b border-gray-200/50 bg-gradient-to-br from-green-50 to-green-100">
                <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                        {title.charAt(0)}
                    </div>
                    {/* Online status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
            </div>
        );
    }

    // Expanded view: Tampilkan full header dengan modern design
    return (
        <div className="flex flex-col justify-center items-center w-full h-32 bg-gradient-to-br from-green-50 via-white to-green-50 border-b border-gray-200/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-200 rounded-full translate-y-8 -translate-x-8 opacity-30"></div>

            <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                        {title.charAt(0)}
                    </div>
                    <div className="text-left">
                        <h1 className="text-sm font-medium text-gray-600">
                            {subtitle}
                        </h1>
                        <h2 className="text-xl font-bold text-gray-800">
                            {title}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Online</span>
                </div>
            </div>
        </div>
    );
}

export default SidebarHeader;
