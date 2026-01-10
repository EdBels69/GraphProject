import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FileUploader } from '../components/FileUploader'
import '@testing-library/jest-dom'

describe('FileUploader', () => {
    it('should render upload area with instructions in English', () => {
        const onFileUpload = vi.fn()
        const { getByText } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} />
        )

        expect(getByText(/INITIALIZE_UPLOAD/)).toBeInTheDocument()
        expect(getByText(/Click to select or drag & drop file/)).toBeInTheDocument()
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

    it('should show syncing status when isLoading is true', () => {
        const onFileUpload = vi.fn()
        const { getByText } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={true} />
        )

        expect(getByText('SYNCING_DATA...')).toBeInTheDocument()
        expect(getByText('Processing neural pathways')).toBeInTheDocument()
    })

    it('should show error message when error prop is provided', () => {
        const onFileUpload = vi.fn()
        const { getByText } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} error="FILE_TOO_LARGE" />
        )

        expect(getByText('FILE_TOO_LARGE')).toBeInTheDocument()
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

    it('should accept specified file types', () => {
        const onFileUpload = vi.fn()
        const { container } = render(
            <FileUploader onFileUpload={onFileUpload} isLoading={false} />
        )

        const input = container.querySelector('input[type="file"]')!
        expect(input).toHaveAttribute('accept', '.csv,.json,.bib,.txt')
    })
})
