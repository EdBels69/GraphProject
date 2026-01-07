import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Test Title" value="100" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should display change with up trend', () => {
    render(<StatCard title="Test" value="100" change="+10" trend="up" icon="📈" />)
    
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('📈')).toBeInTheDocument()
  })

  it('should display change with down trend', () => {
    render(<StatCard title="Test" value="100" change="-10" trend="down" icon="📉" />)
    
    expect(screen.getByText('-10')).toBeInTheDocument()
  })

  it('should apply correct color classes', () => {
    const { container } = render(<StatCard title="Test" value="100" color="blue" />)
    
    expect(container.firstChild).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-900')
  })
})
