import { render, screen } from '@testing-library/react'
import Badge from '../components/ui/Badge'

test('renderiza texto do badge', () => {
  render(<Badge status="vencido">Vencido</Badge>)
  expect(screen.getByText('Vencido')).toBeInTheDocument()
})

test('status vencido tem classe bg-red-50', () => {
  render(<Badge status="vencido">Vencido</Badge>)
  expect(screen.getByText('Vencido')).toHaveClass('bg-red-50')
})

test('status ok tem classe bg-green-50', () => {
  render(<Badge status="ok">Regular</Badge>)
  expect(screen.getByText('Regular')).toHaveClass('bg-green-50')
})

test('status desconhecido usa classe padrão cinza', () => {
  render(<Badge status="outro">Outro</Badge>)
  expect(screen.getByText('Outro')).toHaveClass('bg-gray-100')
})
