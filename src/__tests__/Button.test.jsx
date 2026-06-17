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
