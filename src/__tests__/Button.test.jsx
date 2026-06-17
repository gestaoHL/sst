import { render, screen } from '@testing-library/react'
import Button from '../components/ui/Button'

test('renderiza texto do botão', () => {
  render(<Button>Salvar</Button>)
  expect(screen.getByText('Salvar')).toBeInTheDocument()
})

test('variante primary tem classe bg-metro-primary', () => {
  render(<Button variant="primary">OK</Button>)
  expect(screen.getByText('OK')).toHaveClass('bg-metro-primary')
})

test('variante outline tem borda metro-primary', () => {
  render(<Button variant="outline">Cancelar</Button>)
  expect(screen.getByText('Cancelar')).toHaveClass('border-metro-primary')
})

test('renderiza ícone quando prop icon fornecida', () => {
  render(<Button icon="plus">Novo</Button>)
  expect(document.querySelector('.fa-plus')).toBeInTheDocument()
})

test('variante ghost tem classe bg-transparent', () => {
  render(<Button variant="ghost">Ghost</Button>)
  expect(screen.getByText('Ghost')).toHaveClass('bg-transparent')
})

test('tamanho sm tem classe px-3', () => {
  render(<Button size="sm">Pequeno</Button>)
  expect(screen.getByText('Pequeno')).toHaveClass('px-3')
})

test('tamanho md tem classe px-4', () => {
  render(<Button size="md">Médio</Button>)
  expect(screen.getByText('Médio')).toHaveClass('px-4')
})

test('ícone tem classes fa-solid e fa-plus', () => {
  render(<Button icon="plus">Novo</Button>)
  const icon = document.querySelector('.fa-solid.fa-plus')
  expect(icon).toBeInTheDocument()
})

test('renderiza ícone e texto juntos', () => {
  render(<Button icon="plus">Salvar</Button>)
  expect(screen.getByText('Salvar')).toBeInTheDocument()
  expect(document.querySelector('.fa-plus')).toBeInTheDocument()
})
