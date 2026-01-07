import { useState, useEffect } from 'react'

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  type: 'url' | 'doi' | 'pmid' | 'bibliographic';
}

export interface ArticleInput {
  value: string;
  type: 'url' | 'doi' | 'pmid' | 'bibliographic';
}

const URL_PATTERN = /^https?:\/\/.+\..+/
const DOI_PATTERN = /^10\.\d{4,}(?:\/\d+)?/
const PMID_PATTERN = /^\d+$/
const BIBLIOGRAPHIC_PATTERNS = [
  /^.+\s*\(\d{4}\)\s*[A-Za-z]/,
  /^.+\s*et\s+al\./,
  /^.+\s*\d{4}/
]

export function validateArticleInput(input: string, type: ArticleInput['type']): ValidationResult {
  const trimmed = input.trim()
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Поле не может быть пустым'
    }
  }

  switch (type) {
    case 'url':
      if (!URL_PATTERN.test(trimmed)) {
        return {
          isValid: false,
          error: 'Неверный формат URL. Пример: https://example.com/article'
        }
      }
      try {
        new URL(trimmed)
      } catch {
        return {
          isValid: false,
          error: 'Неверный формат URL'
        }
      }
      return { isValid: true, error: null }
    
    case 'doi':
      if (!DOI_PATTERN.test(trimmed)) {
        return {
          isValid: false,
          error: 'Неверный формат DOI. Пример: 10.1234/example'
        }
      }
      return { isValid: true, error: null }
    
    case 'pmid':
      if (!PMID_PATTERN.test(trimmed)) {
        return {
          isValid: false,
          error: 'Неверный формат PMID. Должен содержать только цифры'
        }
      }
      return { isValid: true, error: null }
    
    case 'bibliographic':
      const isValid = BIBLIOGRAPHIC_PATTERNS.some(pattern => pattern.test(trimmed))
      if (!isValid) {
        return {
          isValid: false,
          error: 'Неверный библиографический формат. Пример: Smith J. (2024) Article title'
        }
      }
      return { isValid: true, error: null }
    
    default:
      return { isValid: true, error: null }
  }
}

export function validateArticleInputs(inputs: ArticleInput[]): ValidationResult[] {
  return inputs.map(input => validateArticleInput(input.value, input.type))
}

export function getArticleInputType(input: string): ArticleInput['type'] {
  const trimmed = input.trim()
  
  if (DOI_PATTERN.test(trimmed)) return 'doi'
  if (PMID_PATTERN.test(trimmed)) return 'pmid'
  if (URL_PATTERN.test(trimmed)) return 'url'
  return 'bibliographic'
}

export interface InputValidationProps {
  value: string
  onChange: (value: string) => void
  onValidate?: (isValid: boolean, error: string | null) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  error?: string | null
  showError?: boolean
}

export default function InputValidation({
  value,
  onChange,
  onValidate,
  placeholder,
  disabled,
  label,
  error,
  showError = true
}: InputValidationProps) {
  const [internalError, setInternalError] = useState<string | null>(error || null)
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    if (error !== undefined) {
      setInternalError(error)
    }
  }, [error])

  const handleChange = (newValue: string) => {
    onChange(newValue)
    setIsTouched(true)
    
    const validation = validateArticleInput(newValue, {
      value: newValue,
      type: getArticleInputType(newValue)
    })
    
    setInternalError(validation.error)
    onValidate?.(validation.isValid, validation.error)
  }

  const inputType = getArticleInputType(value)

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          internalError && showError
            ? 'border-red-500 focus:ring-red-500'
            : isTouched
            ? 'border-gray-300'
            : 'border-gray-200'
        }`}
      />
      {internalError && showError && isTouched && (
        <p className="text-sm text-red-600 mt-1">
          {internalError}
        </p>
      )}
      {inputType === 'url' && (
        <p className="text-xs text-gray-500 mt-1">
          Поддерживается формат: https://...
        </p>
      )}
      {inputType === 'doi' && (
        <p className="text-xs text-gray-500 mt-1">
          Поддерживается формат: 10.1234/example
        </p>
      )}
      {inputType === 'pmid' && (
        <p className="text-xs text-gray-500 mt-1">
          Поддерживается формат: только цифры
        </p>
      )}
    </div>
  )
}
