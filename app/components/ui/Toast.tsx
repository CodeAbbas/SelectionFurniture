'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="toast-container">
      <div className="toast-content">
        <span>{message}</span>
        <button onClick={onClose} className="toast-close">×</button>
      </div>
      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #333;
          color: #fff;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease;
          max-width: 90%;
        }
        .toast-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .toast-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}