import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from '../components/ErrorBoundary'
import '@testing-library/jest-dom'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error message')
    }
    return <div>No error</div>
}

describe('ErrorBoundary', () => {
    // Suppress console.error for cleaner test output
    const originalError = console.error

    beforeEach(() => {
        console.error = vi.fn()
    })

    afterEach(() => {
        console.error = originalError
    })

    it('should render children when there is no error', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <div>Test Child</div>
            </ErrorBoundary>
        )

        expect(getByText('Test Child')).toBeInTheDocument()
    })

    it('should render error UI in English when child throws error', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(getByText('SYSTEM_INTEGRITY_COMPROMISED')).toBeInTheDocument()
        expect(getByText(/unexpected neural collision/i)).toBeInTheDocument()
    })

    it('should display fault details in expandable section', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(getByText('FAULT_DETAILS_STREAM')).toBeInTheDocument()
        expect(getByText(/Test error message/)).toBeInTheDocument()
    })

    it('should have reboot button', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        const rebootButton = getByText('REBOOT_SESSION')
        expect(rebootButton).toBeInTheDocument()
        expect(rebootButton.tagName).toBe('BUTTON')
    })

    it('should log critical fault to console', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(console.error).toHaveBeenCalled()
    })
})
