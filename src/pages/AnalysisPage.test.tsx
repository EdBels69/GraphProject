import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
    render(<AnalysisPage />)
    
    expect(screen.getByText('Извлечение сущностей')).toBeInTheDocument()
    expect(screen.getByText('Выявление взаимодействий')).toBeInTheDocument()
    expect(screen.getByText('Графовый анализ')).toBeInTheDocument()
  })

  it('should start analysis when clicking start button', async () => {
    render(<AnalysisPage />)
    
    const startButton = screen.getByText('🚀 Начать анализ')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Анализ запущен')
    })
  })

  it('should pause analysis when clicking pause button', () => {
    render(<AnalysisPage />)
    
    const startButton = screen.getByText('🚀 Начать анализ')
    fireEvent.click(startButton)
    
    const pauseButton = screen.getByText('⏸️ Пауза')
    fireEvent.click(pauseButton)
    
    expect(toast.info).toHaveBeenCalledWith('Анализ приостановлен')
  })

  it('should resume analysis when clicking continue button', () => {
    render(<AnalysisPage />)
    
    const startButton = screen.getByText('🚀 Начать анализ')
    fireEvent.click(startButton)
    
    const pauseButton = screen.getByText('⏸️ Пауза')
    fireEvent.click(pauseButton)
    
    const continueButton = screen.getByText('▶️ Продолжить')
    fireEvent.click(continueButton)
    
    expect(toast.info).toHaveBeenCalledWith('Анализ продолжен')
  })

  it('should export analysis results', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { success: true, data: { test: 'data' } }
    })
    
    render(<AnalysisPage />)
    
    const exportButton = screen.getByText('📥 Экспорт')
    fireEvent.click(exportButton)
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Результаты успешно экспортированы')
    })
  })
})
