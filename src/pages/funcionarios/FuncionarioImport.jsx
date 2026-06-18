import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'

const COLUNAS_ESPERADAS = ['matricula', 'nome_completo', 'funcao', 'setor', 'data_admissao']

function normalizeHeader(h) {
  return String(h)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[\s_\-/]+/g, '_')
    .trim()
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (!raw.length) { resolve([]); return }

        const headerMap = {}
        Object.keys(raw[0]).forEach((h) => {
          const norm = normalizeHeader(h)
          COLUNAS_ESPERADAS.forEach((col) => {
            const colNorm = normalizeHeader(col)
            if (norm.includes(colNorm) || colNorm.includes(norm)) {
              headerMap[h] = col
            }
          })
          if (norm === 'nome' || norm === 'nome_completo') headerMap[h] = 'nome_completo'
          if (norm === 'matricula' || norm === 'mat') headerMap[h] = 'matricula'
          if (norm === 'cargo' || norm === 'funcao') headerMap[h] = 'funcao'
          if (norm === 'setor' || norm === 'area' || norm === 'departamento') headerMap[h] = 'setor'
          if (norm.includes('admis') || norm.includes('contrat')) headerMap[h] = 'data_admissao'
        })

        const rows = raw.map((r) => {
          const mapped = {}
          Object.entries(r).forEach(([h, v]) => {
            const col = headerMap[h]
            if (col) {
              if (col === 'data_admissao' && v) {
                if (v instanceof Date) {
                  mapped[col] = v.toISOString().slice(0, 10)
                } else {
                  const d = new Date(v)
                  mapped[col] = isNaN(d) ? '' : d.toISOString().slice(0, 10)
                }
              } else {
                mapped[col] = String(v).trim()
              }
            }
          })
          return mapped
        }).filter((r) => r.matricula && r.nome_completo)

        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export default function FuncionarioImport({ onImported, onCancel }) {
  const [rows, setRows]         = useState([])
  const [importing, setImporting] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro]         = useState(null)
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setErro(null)
    setResultado(null)
    try {
      const parsed = await parseExcel(file)
      if (!parsed.length) {
        setErro('Nenhuma linha válida encontrada. Verifique se a planilha tem as colunas: Matrícula, Nome Completo.')
        return
      }
      setRows(parsed)
    } catch {
      setErro('Erro ao ler o arquivo. Certifique-se de usar .xlsx ou .xls.')
    }
  }

  async function confirmarImport() {
    setImporting(true)
    setErro(null)

    const payload = rows.map((r) => ({
      matricula:     r.matricula,
      nome_completo: r.nome_completo,
      funcao:        r.funcao || null,
      setor:         r.setor || null,
      data_admissao: r.data_admissao || null,
    }))

    const { error, data } = await supabase
      .from('funcionario')
      .upsert(payload, { onConflict: 'matricula', ignoreDuplicates: false })
      .select('id')

    setImporting(false)

    if (error) {
      setErro('Erro ao importar: ' + error.message)
    } else {
      setResultado(data?.length ?? payload.length)
    }
  }

  if (resultado !== null) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <i className="fa-solid fa-circle-check text-2xl text-green-500" />
        </div>
        <p className="text-metro-text font-semibold text-[15px]">
          {resultado} funcionário{resultado !== 1 ? 's' : ''} importado{resultado !== 1 ? 's' : ''}!
        </p>
        <Button size="sm" icon="check" onClick={onImported}>Concluir</Button>
      </div>
    )
  }

  return (
    <>
      {/* Upload */}
      {rows.length === 0 && (
        <div className="flex flex-col gap-4">
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl px-6 py-10 flex flex-col items-center gap-3 cursor-pointer hover:border-metro-primary hover:bg-metro-primary/5 transition-colors"
          >
            <i className="fa-solid fa-file-excel text-3xl text-green-500" />
            <p className="text-[13px] font-semibold text-metro-text">Clique para selecionar o arquivo</p>
            <p className="text-[11px] text-metro-muted">Formatos aceitos: .xlsx, .xls</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />

          <div className="bg-blue-50 rounded-lg px-4 py-3">
            <p className="text-[11px] text-blue-700 font-semibold mb-1">
              <i className="fa-solid fa-circle-info mr-1" />Colunas esperadas na planilha:
            </p>
            <p className="text-[11px] text-blue-600 font-mono">
              Matrícula | Nome Completo | Função | Setor | Data Admissão
            </p>
            <p className="text-[10px] text-blue-500 mt-1">
              Os nomes das colunas são flexíveis — "Nome", "Cargo", "Área" também são reconhecidos.
            </p>
          </div>

          {erro && (
            <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Prévia */}
      {rows.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-metro-text">
              <i className="fa-solid fa-table text-metro-primary mr-2" />
              {rows.length} linha{rows.length !== 1 ? 's' : ''} encontrada{rows.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => { setRows([]); setErro(null) }}
              className="text-[11px] text-metro-muted hover:text-metro-primary bg-transparent border-none cursor-pointer"
            >
              <i className="fa-solid fa-rotate-left mr-1" />Trocar arquivo
            </button>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-auto max-h-64">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {['Matrícula', 'Nome Completo', 'Função', 'Setor', 'Admissão'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-metro-muted font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-slate-50">
                    <td className="px-3 py-1.5 font-mono text-metro-muted">{r.matricula}</td>
                    <td className="px-3 py-1.5 font-semibold text-metro-text">{r.nome_completo}</td>
                    <td className="px-3 py-1.5 text-metro-muted">{r.funcao || '—'}</td>
                    <td className="px-3 py-1.5 text-metro-muted">{r.setor || '—'}</td>
                    <td className="px-3 py-1.5 text-metro-muted">
                      {r.data_admissao
                        ? new Date(r.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {rows.length > 50 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-center text-metro-muted text-[10px]">
                      … e mais {rows.length - 50} linhas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-metro-muted bg-amber-50 px-3 py-2 rounded-md">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 mr-1" />
            Matrículas já existentes serão <strong>atualizadas</strong>. Novas serão criadas.
          </p>

          {erro && (
            <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
            <Button size="sm" icon="file-import" onClick={confirmarImport} disabled={importing}>
              {importing ? 'Importando...' : `Importar ${rows.length} funcionários`}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
