
// Input validation and sanitization utilities

// Sanitize input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

// Sanitize HTML content for display
export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') return '';
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;');
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: '' };
};

// Validate text length
export const validateLength = (text: string, min: number, max: number): boolean => {
  return text.length >= min && text.length <= max;
};

// Validate that input contains only alphanumeric characters and spaces
export const validateAlphanumeric = (text: string): boolean => {
  const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
  return alphanumericRegex.test(text);
};

// Validate job order details (allowing more characters but still secure)
export const validateJobOrderDetails = (details: string): boolean => {
  if (!details) return true; // Optional field
  if (details.length > 10000) return false; // Max length check
  // Allow alphanumeric, spaces, and common punctuation
  const allowedCharsRegex = /^[a-zA-Z0-9\s\.\,\!\?\-\(\)\[\]\:\;\/\\'"]+$/;
  return allowedCharsRegex.test(details);
};

// Rate limiting helper (client-side basic protection)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);
  
  if (!existing || now - existing.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return true;
  }
  
  if (existing.count >= maxAttempts) {
    return false;
  }
  
  existing.count++;
  return true;
};
