const crypto = require('crypto');

// Security Testing & Vulnerability Scanner
const securityTester = {
  // SQL Injection Detection
  detectSQLInjection: (input) => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
      /(UNION|OR|AND)\s+\d+\s*=\s*\d+/i,
      /['"]\s*(OR|AND)\s*['"]\d+['"]\s*=\s*['"]\d+['"]*/i,
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
  },

  // XSS Detection
  detectXSS: (input) => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
    ];
    return xssPatterns.some(pattern => pattern.test(input));
  },

  // Input Sanitization
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  // Password Strength Checker
  checkPasswordStrength: (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return {
      score,
      strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong',
      checks,
    };
  },

  // Security Headers Validator
  validateSecurityHeaders: (headers) => {
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
    ];
    
    const missing = requiredHeaders.filter(header => !headers[header]);
    return {
      valid: missing.length === 0,
      missing,
    };
  },

  // JWT Token Validator
  validateJWT: (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  // Automated Security Scan
  performSecurityScan: async (req) => {
    const results = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      vulnerabilities: [],
    };

    // Check for common attack patterns
    const body = JSON.stringify(req.body);
    const query = JSON.stringify(req.query);
    
    if (securityTester.detectSQLInjection(body + query)) {
      results.vulnerabilities.push('SQL_INJECTION_ATTEMPT');
    }
    
    if (securityTester.detectXSS(body + query)) {
      results.vulnerabilities.push('XSS_ATTEMPT');
    }

    // Check headers
    const headerValidation = securityTester.validateSecurityHeaders(req.headers);
    if (!headerValidation.valid) {
      results.vulnerabilities.push('MISSING_SECURITY_HEADERS');
    }

    return results;
  },
};

module.exports = securityTester;