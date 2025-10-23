import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set axios default header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get('/api/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    } else {
                        // Token invalid, remove it
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
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

            const response = await axios.post('/api/auth/login', credentials);

            if (response.data.success) {
                const { user: userData, token: authToken } = response.data.data;
                
                // Store token in localStorage
                localStorage.setItem('token', authToken);
                setToken(authToken);
                setUser(userData);
                
                return { success: true, data: response.data.data };
            } else {
                setError(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post('/api/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API call success
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setError(null);
        }
    };

    const refreshToken = async () => {
        try {
            const response = await axios.post('/api/auth/refresh');
            if (response.data.success) {
                const newToken = response.data.data.token;
                localStorage.setItem('token', newToken);
                setToken(newToken);
                return { success: true, token: newToken };
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
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
        isAdmin: user?.level === 'admin',
        isCashier: user?.level === 'kasir',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
