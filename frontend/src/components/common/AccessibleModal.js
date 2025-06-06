import React, { useEffect, useRef, useCallback, memo } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

// ✅ Hook para gerenciar foco
const useFocusTrap = (isOpen, containerRef) => {
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // ✅ Salvar elemento com foco anterior
    previousFocus.current = document.activeElement;

    // ✅ Focar no container do modal
    if (containerRef.current) {
      containerRef.current.focus();
    }

    // ✅ Função para capturar Tab
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      
      // ✅ Restaurar foco anterior
      if (previousFocus.current && previousFocus.current.focus) {
        previousFocus.current.focus();
      }
    };
  }, [isOpen, containerRef]);
};

// ✅ Hook para controle de scroll do body
const useBodyScrollLock = (isOpen) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);
};

// ✅ Hook para escape key
const useEscapeKey = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
};

// ✅ Componente Backdrop
const ModalBackdrop = memo(({ onClick, className = '' }) => (
  <div
    className={`fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm ${className}`}
    onClick={onClick}
    aria-hidden="true"
  />
));

// ✅ Cabeçalho do Modal
const ModalHeader = memo(({ 
  title, 
  subtitle, 
  onClose, 
  closeButtonRef,
  hideCloseButton = false,
  icon: Icon,
  headerClassName = ''
}) => (
  <div className={`flex items-start justify-between p-6 border-b ${headerClassName}`}>
    <div className="flex items-center space-x-3">
      {Icon && (
        <Icon size={24} className="text-blue-600 flex-shrink-0" aria-hidden="true" />
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-900" id="modal-title">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1" id="modal-subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    
    {!hideCloseButton && (
      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
        aria-label="Fechar modal"
        type="button"
      >
        <X size={20} />
      </button>
    )}
  </div>
));

// ✅ Conteúdo do Modal
const ModalContent = memo(({ children, className = '' }) => (
  <div className={`p-6 ${className}`} role="document">
    {children}
  </div>
));

// ✅ Footer do Modal
const ModalFooter = memo(({ 
  children, 
  className = '',
  primaryAction,
  secondaryAction,
  loading = false
}) => {
  if (!children && !primaryAction && !secondaryAction) return null;

  return (
    <div className={`px-6 py-4 border-t bg-gray-50 ${className}`}>
      {children || (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                secondaryAction.className || ''
              }`}
            >
              {secondaryAction.label}
            </button>
          )}
          
          {primaryAction && (
            <button
              type={primaryAction.type || 'button'}
              onClick={primaryAction.onClick}
              disabled={loading || primaryAction.disabled}
              className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 ${
                primaryAction.className || ''
              }`}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

// ✅ Componente Modal Principal
const AccessibleModal = memo(({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  icon,
  hideCloseButton = false,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  primaryAction,
  secondaryAction,
  loading = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  role = 'dialog'
}) => {
  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // ✅ Hooks para acessibilidade
  useFocusTrap(isOpen, containerRef);
  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen && closeOnEscape, onClose);

  // ✅ Handler para clique no backdrop
  const handleBackdropClick = useCallback((e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  // ✅ Sizes predefinidos
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  // ✅ IDs para ARIA
  const titleId = title ? 'modal-title' : undefined;
  const subtitleId = subtitle ? 'modal-subtitle' : undefined;
  const describedBy = ariaDescribedby || subtitleId;

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <ModalBackdrop onClick={closeOnBackdropClick ? onClose : undefined} />
      
      <div
        ref={containerRef}
        className={`relative bg-white rounded-lg shadow-xl max-h-screen overflow-hidden w-full ${sizeClasses[size]} ${className}`}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {/* ✅ Indicador de loading global */}
        {loading && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              <span className="text-sm text-gray-600">Processando...</span>
            </div>
          </div>
        )}

        <div className="flex flex-col max-h-screen">
          {/* ✅ Header */}
          {title && (
            <ModalHeader
              title={title}
              subtitle={subtitle}
              onClose={onClose}
              closeButtonRef={closeButtonRef}
              hideCloseButton={hideCloseButton}
              icon={icon}
              headerClassName={headerClassName}
            />
          )}

          {/* ✅ Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <ModalContent className={contentClassName}>
              {children}
            </ModalContent>
          </div>

          {/* ✅ Footer */}
          <ModalFooter
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            loading={loading}
            className={footerClassName}
          />
        </div>
      </div>
    </div>
  );

  // ✅ Render via portal para melhor acessibilidade
  return createPortal(modalContent, document.body);
});

// ✅ Hook para controle de modal
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
};

// ✅ HOC para modal context
export const withModal = (Component) => {
  return function ModalEnabledComponent(props) {
    const modal = useModal();
    return <Component {...props} modal={modal} />;
  };
};

// ✅ Variantes pré-configuradas
export const ConfirmationModal = memo((props) => (
  <AccessibleModal
    size="sm"
    icon={props.icon}
    primaryAction={{
      label: props.confirmLabel || 'Confirmar',
      onClick: props.onConfirm,
      className: props.destructive ? 'bg-red-600 hover:bg-red-700' : ''
    }}
    secondaryAction={{
      label: props.cancelLabel || 'Cancelar',
      onClick: props.onCancel || props.onClose
    }}
    {...props}
  />
));

export const AlertModal = memo((props) => (
  <AccessibleModal
    size="sm"
    primaryAction={{
      label: props.okLabel || 'OK',
      onClick: props.onOk || props.onClose
    }}
    hideCloseButton={true}
    closeOnBackdropClick={false}
    closeOnEscape={false}
    {...props}
  />
));

export const FormModal = memo((props) => (
  <AccessibleModal
    size="md"
    primaryAction={{
      label: props.submitLabel || 'Salvar',
      onClick: props.onSubmit,
      type: 'submit'
    }}
    secondaryAction={{
      label: props.cancelLabel || 'Cancelar',
      onClick: props.onCancel || props.onClose
    }}
    {...props}
  />
));

// ✅ Display names
ModalBackdrop.displayName = 'ModalBackdrop';
ModalHeader.displayName = 'ModalHeader';
ModalContent.displayName = 'ModalContent';
ModalFooter.displayName = 'ModalFooter';
AccessibleModal.displayName = 'AccessibleModal';
ConfirmationModal.displayName = 'ConfirmationModal';
AlertModal.displayName = 'AlertModal';
FormModal.displayName = 'FormModal';

export default AccessibleModal;