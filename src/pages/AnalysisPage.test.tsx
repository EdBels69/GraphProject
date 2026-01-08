import * as RTL from '@testing-library/react'
const { render, fireEvent, waitFor } = RTL as any
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toast } from 'sonner'
import axios from 'axios'
import AnalysisPage from './AnalysisPage'

vi.mock('sonner')
vi.mock('axios')

describe('AnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render analysis steps', () => {
    const { getByText } = render(<AnalysisPage />)

    expect(getByText('Извлечение сущностей')).toBeInTheDocument()
    expect(getByText('Выявление взаимодействий')).toBeInTheDocument()
    expect(getByText('Графовый анализ')).toBeInTheDocument()
  })

  it('should start analysis when clicking start button', async () => {
    const { getByText } = render(<AnalysisPage />)

    const startButton = getByText('🚀 Начать анализ')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Анализ запущен')
    })
  })

  it('should pause analysis when clicking pause button', () => {
    const { getByText } = render(<AnalysisPage />)

    const startButton = getByText('🚀 Начать анализ')
    fireEvent.click(startButton)

    const pauseButton = getByText('⏸️ Пауза')
    fireEvent.click(pauseButton)

    expect(toast.info).toHaveBeenCalledWith('Анализ приостановлен')
  })

  it('should resume analysis when clicking continue button', () => {
    const { getByText } = render(<AnalysisPage />)

    const startButton = getByText('🚀 Начать анализ')
    fireEvent.click(startButton)

    const pauseButton = getByText('⏸️ Пауза')
    fireEvent.click(pauseButton)

    const continueButton = getByText('▶️ Продолжить')
    fireEvent.click(continueButton)

    expect(toast.info).toHaveBeenCalledWith('Анализ продолжен')
  })

  it('should export analysis results', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { success: true, data: { test: 'data' } }
    })

    const { getByText } = render(<AnalysisPage />)

    const exportButton = getByText('📥 Экспорт')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Результаты успешно экспортированы')
    })
  })
})
