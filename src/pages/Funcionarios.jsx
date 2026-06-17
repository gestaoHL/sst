import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Funcionarios() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('vw_situacao_funcionario')
      .select('*')
      .order('nome_completo')
      .then(({ data }) => {
        setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h2 style={{ fontSize: 16 }}>Funcionarios</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Matricula</th><th>Nome</th><th>Funcao</th>
            <th>Setor</th><th>Ultimo ASO</th><th>Situacao</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.funcionario_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{r.matricula}</td>
              <td>{r.nome_completo}</td>
              <td>{r.funcao}</td>
              <td>{r.setor}</td>
              <td>{r.ultimo_aso ?? '-'}</td>
              <td>{r.situacao}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6}>Nenhum funcionario cadastrado ainda.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
