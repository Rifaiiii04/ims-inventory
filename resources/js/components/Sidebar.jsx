import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarHeader from "./sidebar/SidebarHeader";
import MenuItem from "./sidebar/MenuItem";
import MenuItemWithSubmenu from "./sidebar/MenuItemWithSubmenu";
import SubMenuItem from "./sidebar/SubMenuItem";
import SidebarToggle from "./sidebar/SidebarToggle";
import {
    DashboardIcon,
    ProductIcon,
    StockIcon,
    ShoppingBagIcon,
    ReportIcon,
} from "./sidebar/Icons";
import { menuConfig } from "./sidebar/menuConfig";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeRoute, setActiveRoute] = useState(location.pathname);

    // Toggle specific menu
    const toggleMenu = (menuId) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    };

    // Toggle sidebar collapse
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        // Tutup semua submenu saat collapse
        if (!isCollapsed) {
            setOpenMenus({});
        }
    };

    // Update active route when location changes
    useEffect(() => {
        setActiveRoute(location.pathname);
    }, [location.pathname]);

    // Handle navigation
    const handleNavigate = (path) => {
        navigate(path);
        setActiveRoute(path);
    };

    // Check if route is active
    const isRouteActive = (path) => {
        return activeRoute === path;
    };

    // Check if any submenu item is active
    const isSubmenuActive = (submenu) => {
        return submenu.some((item) => isRouteActive(item.path));
    };

    // Icon mapping
    const iconMap = {
        DashboardIcon: <DashboardIcon />,
        ProductIcon: <ProductIcon />,
        StockIcon: <StockIcon />,
        ShoppingBagIcon: <ShoppingBagIcon />,
        ReportIcon: <ReportIcon />,
    };

    // Render menu items based on config
    const renderMenuItems = () => {
        return menuConfig.map((menu, index) => {
            const menuElement = (() => {
                if (menu.type === "single") {
                    return (
                        <MenuItem
                            key={menu.id}
                            icon={iconMap[menu.icon]}
                            label={menu.label}
                            onClick={() => handleNavigate(menu.path)}
                            isCollapsed={isCollapsed}
                            isActive={isRouteActive(menu.path)}
                        />
                    );
                }

                if (menu.type === "submenu") {
                    return (
                        <MenuItemWithSubmenu
                            key={menu.id}
                            icon={iconMap[menu.icon]}
                            label={menu.label}
                            isOpen={openMenus[menu.id] || false}
                            onToggle={() => toggleMenu(menu.id)}
                            isCollapsed={isCollapsed}
                            isActive={isSubmenuActive(menu.submenu)}
                        >
                            {menu.submenu.map((subItem) => (
                                <SubMenuItem
                                    key={subItem.id}
                                    icon={iconMap[subItem.icon]}
                                    label={subItem.label}
                                    onClick={() => handleNavigate(subItem.path)}
                                    isActive={isRouteActive(subItem.path)}
                                />
                            ))}
                        </MenuItemWithSubmenu>
                    );
                }

                return null;
            })();

            // Add dividers between main menu sections
            if (!isCollapsed) {
                if (index === 0) {
                    // After Dashboard
                    return (
                        <React.Fragment key={`${menu.id}-with-divider`}>
                            {menuElement}
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3"></div>
                        </React.Fragment>
                    );
                } else if (index === 1) {
                    // After Manajemen Product
                    return (
                        <React.Fragment key={`${menu.id}-with-divider`}>
                            {menuElement}
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3"></div>
                        </React.Fragment>
                    );
                }
            }

            return menuElement;
        });
    };

    return (
        <>
            <div
                className={`bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200/50 rounded-2xl h-full overflow-x-hidden overflow-y-auto transition-all duration-300 relative shadow-xl backdrop-blur-sm ${
                    isCollapsed ? "w-20" : "w-full md:w-80"
                }`}
            >
                {/* Toggle Button */}
                <SidebarToggle
                    isCollapsed={isCollapsed}
                    onToggle={toggleSidebar}
                />

                <div className="w-full h-full">
                    <SidebarHeader
                        title="IMS Admin"
                        subtitle="Welcome"
                        isCollapsed={isCollapsed}
                    />

                    {!isCollapsed && (
                        <div className="px-6 py-3 border-b border-gray-200/50">
                            <h1 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Main Menu
                            </h1>
                        </div>
                    )}

                    <ul
                        className={`flex flex-col justify-start items-start pb-6 space-y-3 ${
                            isCollapsed ? "px-2" : "px-3"
                        }`}
                    >
                        {renderMenuItems()}
                    </ul>

                    {/* User Profile Section */}
                    {!isCollapsed && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    A
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        Admin User
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        admin@angkringan.com
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate("/")}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Sidebar;
