import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from './ErrorBoundary'
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

    it('should render error UI when child throws error', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(getByText('Произошла ошибка')).toBeInTheDocument()
        expect(getByText(/попробуйте перезагрузить страницу/)).toBeInTheDocument()
    })

    it('should display error details in expandable section', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(getByText('Подробности ошибки')).toBeInTheDocument()
        expect(getByText(/Test error message/)).toBeInTheDocument()
    })

    it('should have reload button', () => {
        const { getByText } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        const reloadButton = getByText('Перезагрузить страницу')
        expect(reloadButton).toBeInTheDocument()
        expect(reloadButton.tagName).toBe('BUTTON')
    })

    it('should log error to console', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(console.error).toHaveBeenCalled()
    })
})
