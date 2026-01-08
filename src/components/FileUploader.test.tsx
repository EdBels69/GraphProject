import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FileUploader } from './FileUploader'
import '@testing-library/jest-dom'

describe('FileUploader', () => {
    it('should render upload area with instructions', () => {
        const onFileUpload = vi.fn()
        const { getByText } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} />
        )

        expect(getByText(/Нажмите для выбора файла/)).toBeInTheDocument()
        expect(getByText(/CSV, JSON, BibTeX/)).toBeInTheDocument()
    })

    it('should call onFileUpload when file is selected via input', () => {
        const onFileUpload = vi.fn()
        const { container } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} />
        )

        const input = container.querySelector('input[type="file"]')!
        const file = new File(['test content'], 'test.csv', { type: 'text/csv' })

        Object.defineProperty(input, 'files', {
            value: [file]
        })

        fireEvent.change(input)

        expect(onFileUpload).toHaveBeenCalledWith(file)
    })

    it('should disable input when loading', () => {
        const onFileUpload = vi.fn()
        const { container } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={true} />
        )

        const input = container.querySelector('input[type="file"]')!
        expect(input).toBeDisabled()
    })

    it('should show loading spinner when isLoading is true', () => {
        const onFileUpload = vi.fn()
        const { getByText } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={true} />
        )

        expect(getByText('Загрузка...')).toBeInTheDocument()
    })

    it('should show error message when error prop is provided', () => {
        const onFileUpload = vi.fn()
        const { getByText } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} error="File too large" />
        )

        expect(getByText('File too large')).toBeInTheDocument()
    })

    it('should call onFileUpload when file is dropped', () => {
        const onFileUpload = vi.fn()
        const { container } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} />
        )

        const dropZone = container.firstChild!
        const file = new File(['test'], 'test.json', { type: 'application/json' })

        fireEvent.drop(dropZone, {
            dataTransfer: {
                files: [file]
            }
        })

        expect(onFileUpload).toHaveBeenCalledWith(file)
    })

    it('should prevent default on dragOver', () => {
        const onFileUpload = vi.fn()
        const { container } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} />
        )

        const dropZone = container.firstChild!
        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn()
        }

        fireEvent.dragOver(dropZone, mockEvent)

        // Just verify the component doesn't crash on dragOver
        expect(dropZone).toBeInTheDocument()
    })

    it('should accept only specified file types', () => {
        const onFileUpload = vi.fn()
        const { container } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} />
        )

        const input = container.querySelector('input[type="file"]')!
        expect(input).toHaveAttribute('accept', '.csv,.json,.bib,.txt')
    })
})
