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

test('status vence_30 tem classe bg-orange-50', () => {
  render(<Badge status="vence_30">30 dias</Badge>)
  expect(screen.getByText('30 dias')).toHaveClass('bg-orange-50')
})

test('status vence_60 tem classe bg-yellow-50', () => {
  render(<Badge status="vence_60">60 dias</Badge>)
  expect(screen.getByText('60 dias')).toHaveClass('bg-yellow-50')
})

test('status vence_90 tem classe bg-blue-50', () => {
  render(<Badge status="vence_90">90 dias</Badge>)
  expect(screen.getByText('90 dias')).toHaveClass('bg-blue-50')
})

test('status sem_aso tem classe bg-gray-100', () => {
  render(<Badge status="sem_aso">Sem ASO</Badge>)
  expect(screen.getByText('Sem ASO')).toHaveClass('bg-gray-100')
})
