import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input, Select } from '../../components/ui/FormControl'
import Button from '../../components/ui/Button'

const SETORES = [
  'Operação', 'Manutenção', 'Administração', 'Segurança', 'Tecnologia',
  'Recursos Humanos', 'Financeiro', 'Jurídico', 'Comunicação', 'Outro',
]

export default function FuncionarioForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    matricula: '',
    nome_completo: '',
    funcao: '',
    setor: '',
    data_admissao: '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function salvar() {
    if (!form.matricula || !form.nome_completo) {
      setErro('Matrícula e nome completo são obrigatórios.')
      return
    }
    setSaving(true)
    setErro(null)
    const { error } = await supabase.from('funcionario').insert({
      ...form,
      data_admissao: form.data_admissao || null,
    })
    setSaving(false)
    if (error) {
      if (error.code === '23505') setErro('Matrícula já cadastrada.')
      else setErro('Erro ao salvar: ' + error.message)
    } else {
      onSaved()
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Matrícula"
          value={form.matricula}
          onChange={(e) => set('matricula', e.target.value)}
          placeholder="Ex: 001234"
        />
        <Input
          label="Data de Admissão"
          type="date"
          value={form.data_admissao}
          onChange={(e) => set('data_admissao', e.target.value)}
        />
      </div>

      <Input
        label="Nome Completo"
        value={form.nome_completo}
        onChange={(e) => set('nome_completo', e.target.value)}
        placeholder="Nome completo do funcionário"
      />

      <Input
        label="Função / Cargo"
        value={form.funcao}
        onChange={(e) => set('funcao', e.target.value)}
        placeholder="Ex: Operador de Trem"
      />

      <Select
        label="Setor"
        value={form.setor}
        onChange={(e) => set('setor', e.target.value)}
      >
        <option value="">— selecione —</option>
        {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>

      {erro && (
        <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>
      )}

      <div className="flex gap-2 justify-end mt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" icon="user-plus" onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Cadastrar Funcionário'}
        </Button>
      </div>
    </>
  )
}
