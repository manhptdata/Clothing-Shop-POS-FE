import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-surface rounded-xl shadow-lg flex flex-col border border-outline/10 transform transition-all max-h-[90vh]`}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-lg border-b border-outline/10">
            {title && (
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {title}
              </h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-lg overflow-y-auto font-body-md text-body-md text-on-surface">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-lg border-t border-outline/10 bg-surface-container-low/50 rounded-b-xl flex justify-end gap-sm">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
