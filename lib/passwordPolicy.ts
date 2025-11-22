/**
 * Password Policy Validator
 * Enforces strong password requirements for government standards
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  // Minimum length 8 characters
  if (password.length < 8) {
    errors.push('Password minimal 8 karakter')
  }

  // Maximum length check (prevent DOS)
  if (password.length > 128) {
    errors.push('Password maksimal 128 karakter')
  }

  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf besar (A-Z)')
  }

  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf kecil (a-z)')
  }

  // Must contain number
  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 angka (0-9)')
  }

  // Must contain special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 karakter spesial (!@#$%^&* dll)')
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty123',
    'admin123', 'letmein', 'welcome123', 'passw0rd'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password terlalu umum dan mudah ditebak')
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password tidak boleh mengandung karakter berulang lebih dari 2 kali')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate password strength score
 */
export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0

  // Length score
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  // Character variety
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15

  // Determine label and color
  let label = 'Sangat Lemah'
  let color = 'red'

  if (score >= 40 && score < 60) {
    label = 'Lemah'
    color = 'orange'
  } else if (score >= 60 && score < 80) {
    label = 'Sedang'
    color = 'yellow'
  } else if (score >= 80 && score < 100) {
    label = 'Kuat'
    color = 'lightgreen'
  } else if (score >= 100) {
    label = 'Sangat Kuat'
    color = 'green'
  }

  return { score: Math.min(score, 100), label, color }
}
