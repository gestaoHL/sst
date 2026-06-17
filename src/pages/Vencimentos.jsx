import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const cor = {
  vencido: '#c0392b',
  vence_30: '#e67e22',
  vence_60: '#d4ac0d',
  vence_90: '#2980b9',
  sem_aso: '#7f8c8d',
}

export default function Vencimentos() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    supabase
      .from('vw_vencimentos')
      .select('*')
      .then(({ data, error }) => {
        if (error) setErro(error.message)
        else setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Carregando...</p>
  if (erro) return <p style={{ color: 'red' }}>Erro: {erro}</p>

  return (
    <div>
      <h2 style={{ fontSize: 16 }}>Exames vencendo / vencidos</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Matricula</th><th>Nome</th><th>Funcao</th>
            <th>Proximo</th><th>Dias</th><th>Situacao</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.funcionario_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{r.matricula}</td>
              <td>{r.nome_completo}</td>
              <td>{r.funcao}</td>
              <td>{r.data_proximo ?? '-'}</td>
              <td>{r.dias_para_vencer ?? '-'}</td>
              <td>
                <span style={{ color: '#fff', background: cor[r.situacao] ?? '#555', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                  {r.situacao}
                </span>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6}>Nada vencendo nos proximos 90 dias.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
