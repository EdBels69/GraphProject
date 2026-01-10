import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatCard } from '../components/StatCard'
import { Activity } from 'lucide-react'
import '@testing-library/jest-dom'

describe('StatCard', () => {
  it('should render title and value in Bio-Digital style', () => {
    const { getByText } = render(<StatCard title="TEST_METRIC" value="100" />)

    expect(getByText('TEST_METRIC')).toBeInTheDocument()
    expect(getByText('100')).toBeInTheDocument()
  })

  it('should display change with up trend', () => {
    const { getByText } = render(<StatCard title="Test" value="100" change="+10%" trend="up" icon={Activity} />)

    expect(getByText('+10%')).toBeInTheDocument()
  })

  it('should display change with down trend', () => {
    const { getByText } = render(<StatCard title="Test" value="100" change="-5%" trend="down" />)

    expect(getByText('-5%')).toBeInTheDocument()
  })

  it('should apply correct color glow classes', () => {
    const { container } = render(<StatCard title="Test" value="100" color="acid" />)

    expect(container.firstChild).toHaveClass('shadow-glow-acid/10')
  })
})
