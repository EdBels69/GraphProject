import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatCard } from './StatCard'
import '@testing-library/jest-dom'

describe('StatCard', () => {
  it('should render title and value', () => {
    const { getByText } = render(<StatCard title="Test Title" value="100" />)

    expect(getByText('Test Title')).toBeInTheDocument()
    expect(getByText('100')).toBeInTheDocument()
  })

  it('should display change with up trend', () => {
    const { getByText } = render(<StatCard title="Test" value="100" change="+10" trend="up" icon="📈" />)

    expect(getByText('+10')).toBeInTheDocument()
    expect(getByText('📈')).toBeInTheDocument()
  })

  it('should display change with down trend', () => {
    const { getByText } = render(<StatCard title="Test" value="100" change="-10" trend="down" icon="📉" />)

    expect(getByText('-10')).toBeInTheDocument()
  })

  it('should apply correct color classes', () => {
    const { container } = render(<StatCard title="Test" value="100" color="blue" />)

    expect(container.firstChild).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-900')
  })
})
