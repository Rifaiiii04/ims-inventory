import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Check both localStorage and sessionStorage for token
    const [token, setToken] = useState(
        localStorage.getItem("token") || sessionStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set axios default header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get("/api/auth/me");
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    } else {
                        // Token invalid, remove it from both storages
                        localStorage.removeItem("token");
                        sessionStorage.removeItem("token");
                        setToken(null);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    // Remove token from both storages
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);

            // Extract rememberMe from credentials
            const { rememberMe, ...loginData } = credentials;

            const response = await axios.post("/api/auth/login", loginData);

            if (response.data.success) {
                const { user: userData, token: authToken } = response.data.data;

                // Clear both storages first
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");

                // Store token based on rememberMe preference
                if (rememberMe) {
                    // Remember Me = true → localStorage (persisten, tetap ada setelah browser close)
                    localStorage.setItem("token", authToken);
                } else {
                    // Remember Me = false → sessionStorage (terhapus saat tab/browser close)
                    sessionStorage.setItem("token", authToken);
                }

                setToken(authToken);
                setUser(userData);

                return { success: true, data: response.data.data };
            } else {
                setError(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Terjadi kesalahan saat login";
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post("/api/auth/logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear local state regardless of API call success
            // Clear from both storages
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setError(null);
        }
    };

    const refreshToken = async () => {
        try {
            const response = await axios.post("/api/auth/refresh");
            if (response.data.success) {
                const newToken = response.data.data.token;

                // Check where the old token was stored to maintain rememberMe preference
                const wasInLocalStorage =
                    localStorage.getItem("token") !== null;

                // Clear both storages
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");

                // Store new token in the same storage as before
                if (wasInLocalStorage) {
                    localStorage.setItem("token", newToken);
                } else {
                    sessionStorage.setItem("token", newToken);
                }

                setToken(newToken);
                return { success: true, token: newToken };
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            logout(); // Force logout if refresh fails
        }
        return { success: false };
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        logout,
        refreshToken,
        clearError,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.level === "admin",
        isCashier: user?.level === "kasir",
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
