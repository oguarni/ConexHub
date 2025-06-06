// utils/sanitizer.js - Proteção contra XSS
import DOMPurify from 'dompurify';

export class SecuritySanitizer {
  // ✅ Sanitizar HTML para prevenir XSS
  static sanitizeHTML(dirty) {
    if (typeof dirty !== 'string') return '';
    return DOMPurify.sanitize(dirty, { 
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
      ALLOWED_ATTR: ['class']
    });
  }

  // ✅ Sanitizar texto puro
  static sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/[<>]/g, '') // Remove < >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // ✅ Validar emoji/ícone de produto
  static sanitizeProductIcon(icon) {
    if (typeof icon !== 'string') return '📦';
    
    // Lista permitida de emojis/ícones
    const allowedIcons = ['📦', '⚙️', '🔧', '🏭', '🚛', '💼', '⚡', '🛠️', '🔩', '⛽'];
    
    // Se é emoji válido
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}]$/u;
    if (emojiRegex.test(icon) || allowedIcons.includes(icon)) {
      return icon;
    }
    
    return '📦'; // Default seguro
  }

  // ✅ Sanitizar dados de formulário
  static sanitizeFormData(formData) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        // Campos que podem ter formatação mínima
        if (['description', 'message', 'specifications'].includes(key)) {
          sanitized[key] = this.sanitizeHTML(value);
        } else {
          sanitized[key] = this.sanitizeText(value);
        }
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // ✅ Validar URLs
  static sanitizeURL(url) {
    if (!url || typeof url !== 'string') return '';
    
    try {
      const parsed = new URL(url);
      // Só permitir HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }
}

// ✅ Hook para sanitização automática
export const useSanitizedState = (initialValue = '') => {
  const [value, setValue] = React.useState(
    SecuritySanitizer.sanitizeText(initialValue)
  );

  const setSanitizedValue = React.useCallback((newValue) => {
    setValue(SecuritySanitizer.sanitizeText(newValue));
  }, []);

  return [value, setSanitizedValue];
};

export default SecuritySanitizer;