import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
    ShoppingCartIcon,
    CreditCardIcon,
    ClockIcon,
    ChartBarIcon,
} from "./sidebar/Icons";
import { getFilteredMenu } from "./sidebar/menuConfig";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [openMenus, setOpenMenus] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeRoute, setActiveRoute] = useState(location.pathname);

    // Toggle specific menu with useCallback
    const toggleMenu = useCallback((menuId) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuId]: !prev[menuId],
        }));
    }, []);

    // Toggle sidebar collapse with proper state management
    const toggleSidebar = useCallback(() => {
        setIsCollapsed((prev) => {
            const newCollapsedState = !prev;
            // Tutup semua submenu saat collapse
            if (newCollapsedState) {
                setOpenMenus({});
            }
            return newCollapsedState;
        });
    }, []);

    // Update active route when location changes
    useEffect(() => {
        setActiveRoute(location.pathname);
    }, [location.pathname]);

    // Handle navigation with useCallback
    const handleNavigate = useCallback((path) => {
        navigate(path);
        setActiveRoute(path);
    }, [navigate]);

    // Handle logout
    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    // Icon mapping with memoization
    const iconMap = useMemo(() => ({
        DashboardIcon: <DashboardIcon />,
        ProductIcon: <ProductIcon />,
        StockIcon: <StockIcon />,
        ShoppingBagIcon: <ShoppingBagIcon />,
        ReportIcon: <ReportIcon />,
        ShoppingCartIcon: <ShoppingCartIcon />,
        CreditCardIcon: <CreditCardIcon />,
        ClockIcon: <ClockIcon />,
        ChartBarIcon: <ChartBarIcon />,
    }), []);

    // Render menu items based on config with memoization
    const menuItems = useMemo(() => {
        if (!user) return [];

        // Check if route is active
        const isRouteActive = (path) => {
            return activeRoute === path;
        };

        // Check if any submenu item is active
        const isSubmenuActive = (submenu) => {
            if (!Array.isArray(submenu)) return false;
            return submenu.some((item) => isRouteActive(item.path));
        };

        // Get filtered menu based on user level
        const filteredMenus = getFilteredMenu(user?.level || "admin");
        if (!Array.isArray(filteredMenus) || filteredMenus.length === 0) {
            return [];
        }

        const items = [];

        filteredMenus.forEach((menu) => {
            if (!menu || !menu.id) return;

            // Render menu element
            if (menu.type === "single" && menu.path) {
                items.push(
                    <MenuItem
                        key={`menu-${menu.id}`}
                        icon={iconMap[menu.icon]}
                        label={menu.label}
                        onClick={() => handleNavigate(menu.path)}
                        isCollapsed={isCollapsed}
                        isActive={isRouteActive(menu.path)}
                    />
                );
            } else if (menu.type === "submenu" && Array.isArray(menu.submenu)) {
                items.push(
                    <MenuItemWithSubmenu
                        key={`menu-${menu.id}`}
                        icon={iconMap[menu.icon]}
                        label={menu.label}
                        isOpen={openMenus[menu.id] || false}
                        onToggle={() => toggleMenu(menu.id)}
                        isCollapsed={isCollapsed}
                        isActive={isSubmenuActive(menu.submenu)}
                    >
                        {menu.submenu.map((subItem) => {
                            if (!subItem || !subItem.id) return null;
                            return (
                                <SubMenuItem
                                    key={`submenu-${subItem.id}`}
                                    icon={iconMap[subItem.icon]}
                                    label={subItem.label}
                                    onClick={() => handleNavigate(subItem.path)}
                                    isActive={isRouteActive(subItem.path)}
                                />
                            );
                        })}
                    </MenuItemWithSubmenu>
                );
            }
        });

        return items;
    }, [user, isCollapsed, openMenus, activeRoute, handleNavigate, toggleMenu, iconMap]);

    return (
        <>
            <div
                className={`bg-white border border-gray-200/50 rounded-2xl h-full overflow-x-hidden overflow-y-auto transition-all duration-300 relative shadow-xl ${
                    isCollapsed ? "w-16 lg:w-20" : "w-full sm:w-72 lg:w-80"
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
                        <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-200/50">
                            <h1 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Main Menu
                            </h1>
                        </div>
                    )}

                    <ul
                        className={`flex flex-col justify-start items-start pb-20 sm:pb-6 space-y-2 sm:space-y-3 ${
                            isCollapsed ? "px-2" : "px-2 sm:px-3"
                        }`}
                    >
                        {menuItems}
                    </ul>

                    {/* User Profile Section */}
                    {!isCollapsed && user && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-200/50 bg-white">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                    {user.nama_user
                                        ? user.nama_user.charAt(0).toUpperCase()
                                        : "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                                        {user.nama_user || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.level === "admin"
                                            ? "Administrator"
                                            : "Kasir"}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
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
