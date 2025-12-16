import { useState, useCallback } from "react";
import Toast from "../components/common/Toast";

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(
        (message, type = "success", duration = 5000) => {
            const id = Date.now() + Math.random();
            const newToast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            // Auto remove after duration
            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        []
    );

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const ToastContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto"
                    style={{
                        transform: `translateY(${index * 10}px)`,
                    }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );

    return {
        showToast,
        removeToast,
        ToastContainer,
    };
};

export default useToast;
