'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />
    };

    const colors = {
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
        warning: 'border-yellow-200 bg-yellow-50',
        info: 'border-blue-200 bg-blue-50'
    };

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className={`border rounded-lg shadow-lg p-4 ${colors[type]}`}>
                <div className="flex items-start gap-3">
                    {icons[type]}
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{title}</h4>
                        {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(() => onClose(id), 300);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message?: string;
        duration?: number;
    }>;
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={onClose}
                />
            ))}
        </div>
    );
}
