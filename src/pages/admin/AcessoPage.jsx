import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import { DataTable, Td } from '../../components/ui/Table'
import FilterBar, { SearchInput, FilterChip } from '../../components/ui/FilterBar'
import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Input, Select, Textarea } from '../../components/ui/FormControl'

const STATUS_LABEL = { pendente: 'Pendente', aprovado: 'Aprovado', rejeitado: 'Rejeitado' }
const STATUS_BADGE = { pendente: 'vence_30', aprovado: 'ok', rejeitado: 'vencido' }

const SETORES = ['Operação', 'Manutenção', 'Administração', 'Segurança', 'Tecnologia',
  'Recursos Humanos', 'Financeiro', 'Jurídico', 'Comunicação', 'Outro']

function gerarSenha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function NivelToggle({ value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold text-metro-muted uppercase tracking-wide mb-1.5">
        Nível de Acesso
      </label>
      <div className="flex gap-2">
        {[
          { val: false, label: 'Usuário', icon: 'user', desc: 'Acesso aos módulos operacionais' },
          { val: true,  label: 'Administrador', icon: 'user-shield', desc: 'Acesso total + gerenciar usuários' },
        ].map((opt) => (
          <button
            key={String(opt.val)}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`flex-1 p-3 rounded-lg border-2 text-left transition-colors cursor-pointer font-sans ${
              value === opt.val
                ? 'border-metro-primary bg-metro-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <i className={`fa-solid fa-${opt.icon} text-[12px] ${value === opt.val ? 'text-metro-primary' : 'text-metro-muted'}`} />
              <span className={`text-[12px] font-semibold ${value === opt.val ? 'text-metro-primary' : 'text-metro-text'}`}>
                {opt.label}
              </span>
            </div>
            <p className="text-[10px] text-metro-muted">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AcessoPage() {
  const [aba, setAba]           = useState('solicitacoes')
  const [rows, setRows]         = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filtro, setFiltro]     = useState('todos')
  const [selected, setSelected] = useState(null)
  const [panel, setPanel]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [erro, setErro]         = useState(null)
  const [credencial, setCredencial] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [rejObs, setRejObs]     = useState('')
  const [novoNivel, setNovoNivel] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([
      supabase.from('solicitacao_acesso').select('*').order('created_at', { ascending: false }),
      supabase.from('perfil').select('*').order('created_at', { ascending: false }),
    ]).then(([{ data: sol }, { data: perf }]) => {
      setRows(sol ?? [])
      setUsuarios(perf ?? [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.nome?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || r.status === filtro
    return matchSearch && matchFiltro
  })

  const filteredUsuarios = usuarios.filter((u) => {
    const q = search.toLowerCase()
    return !q || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  function abrirDetalhe(row) { setSelected(row); setErro(null); setPanel('detalhe') }

  function abrirAprovar(row) {
    setSelected(row); setNovoNivel(false); setErro(null); setPanel('aprovar')
  }

  function abrirRejeitar(row) { setSelected(row); setRejObs(''); setErro(null); setPanel('rejeitar') }

  function abrirEditar(row) {
    setSelected(row)
    setEditForm({ nome: row.nome, funcao: row.funcao || '', setor: row.setor || '', observacao_admin: row.observacao_admin || '' })
    setErro(null); setPanel('editar')
  }

  function abrirEditarUsuario(u) {
    setSelected(u)
    setEditForm({ nome: u.nome || '', email: u.email || '', is_admin: u.is_admin || false })
    setErro(null); setPanel('editarUsuario')
  }

  async function aprovar() {
    setSaving(true); setErro(null)
    const senha = gerarSenha()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: selected.email,
      password: senha,
      options: { data: { nome: selected.nome } },
    })

    if (signUpError && !signUpError.message.includes('already registered')) {
      setErro('Erro ao criar usuário: ' + signUpError.message)
      setSaving(false)
      return
    }

    const userId = signUpData?.user?.id
    if (userId) {
      await supabase.from('perfil').upsert({
        id: userId,
        nome: selected.nome,
        email: selected.email,
        is_admin: novoNivel,
      }, { onConflict: 'id' })
    }

    await supabase.from('solicitacao_acesso').update({
      status: 'aprovado',
      senha_temp: senha,
      reviewed_at: new Date().toISOString(),
    }).eq('id', selected.id)

    setSaving(false)
    setPanel('credencial')
    setCredencial({ email: selected.email, senha, nivel: novoNivel ? 'Administrador' : 'Usuário' })
    load()
  }

  async function rejeitar() {
    setSaving(true); setErro(null)
    const { error } = await supabase.from('solicitacao_acesso').update({
      status: 'rejeitado',
      observacao_admin: rejObs || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', selected.id)
    setSaving(false)
    if (error) { setErro('Erro: ' + error.message); return }
    setPanel(null); load()
  }

  async function salvarEdicao() {
    setSaving(true); setErro(null)
    const { error } = await supabase.from('solicitacao_acesso').update({
      nome: editForm.nome,
      funcao: editForm.funcao || null,
      setor: editForm.setor || null,
      observacao_admin: editForm.observacao_admin || null,
    }).eq('id', selected.id)
    setSaving(false)
    if (error) { setErro('Erro: ' + error.message); return }
    setPanel(null); load()
  }

  async function salvarUsuario() {
    setSaving(true); setErro(null)
    const { error } = await supabase.from('perfil').update({
      nome: editForm.nome,
      is_admin: editForm.is_admin,
    }).eq('id', selected.id)
    setSaving(false)
    if (error) { setErro('Erro: ' + error.message); return }
    setPanel(null); load()
  }

  const pendentes = rows.filter((r) => r.status === 'pendente').length

  const tabCls = (t) => `px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
    aba === t ? 'border-metro-primary text-metro-primary' : 'border-transparent text-metro-muted hover:text-metro-text'
  }`

  return (
    <div>
      <Topbar
        breadcrumb="Administração"
        title={<><i className="fa-solid fa-user-shield text-metro-primary mr-2" />Gerenciamento de Acesso</>}
      />
      <div className="p-6">
        {pendentes > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-500" />
            <p className="text-[13px] text-amber-800 font-semibold">
              {pendentes} solicitaç{pendentes === 1 ? 'ão pendente' : 'ões pendentes'} aguardando análise
            </p>
          </div>
        )}

        {/* Abas */}
        <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-xl px-2">
          <button className={tabCls('solicitacoes')} onClick={() => setAba('solicitacoes')}>
            <i className="fa-solid fa-inbox mr-2" />Solicitações
            {pendentes > 0 && (
              <span className="ml-2 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendentes}</span>
            )}
          </button>
          <button className={tabCls('usuarios')} onClick={() => setAba('usuarios')}>
            <i className="fa-solid fa-users mr-2" />Usuários ({usuarios.length})
          </button>
        </div>

        <FilterBar>
          <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Buscar por nome ou e-mail..." />
          {aba === 'solicitacoes' && (
            <div className="flex gap-2 flex-wrap">
              {['todos', 'pendente', 'aprovado', 'rejeitado'].map((s) => (
                <FilterChip key={s} active={filtro === s} onClick={() => setFiltro(s)}>
                  {s === 'todos' ? 'Todos' : STATUS_LABEL[s]}
                </FilterChip>
              ))}
            </div>
          )}
        </FilterBar>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden">

            {/* Tab Solicitações */}
            {aba === 'solicitacoes' && (
              loading ? <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p> : (
                <DataTable
                  headers={['Nome', 'E-mail', 'Função', 'Setor', 'Solicitado em', 'Status', '']}
                  empty="Nenhuma solicitação encontrada."
                >
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td><p className="font-semibold text-metro-text text-[13px]">{r.nome}</p></Td>
                      <Td className="text-[12px] text-metro-muted">{r.email}</Td>
                      <Td className="text-[12px] text-metro-muted">{r.funcao || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted">{r.setor || '—'}</Td>
                      <Td className="text-[12px] text-metro-muted">{new Date(r.created_at).toLocaleDateString('pt-BR')}</Td>
                      <Td><Badge status={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge></Td>
                      <Td>
                        <div className="flex gap-1">
                          <button onClick={() => abrirDetalhe(r)} title="Ver detalhes"
                            className="text-metro-muted hover:text-metro-primary p-1 bg-transparent border-none cursor-pointer">
                            <i className="fa-solid fa-eye text-xs" />
                          </button>
                          {r.status === 'pendente' && <>
                            <button onClick={() => abrirAprovar(r)} title="Aprovar"
                              className="text-green-500 hover:text-green-700 p-1 bg-transparent border-none cursor-pointer">
                              <i className="fa-solid fa-check text-xs" />
                            </button>
                            <button onClick={() => abrirRejeitar(r)} title="Rejeitar"
                              className="text-red-400 hover:text-red-600 p-1 bg-transparent border-none cursor-pointer">
                              <i className="fa-solid fa-xmark text-xs" />
                            </button>
                          </>}
                          <button onClick={() => abrirEditar(r)} title="Editar"
                            className="text-metro-muted hover:text-metro-primary p-1 bg-transparent border-none cursor-pointer">
                            <i className="fa-solid fa-pen text-xs" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </DataTable>
              )
            )}

            {/* Tab Usuários */}
            {aba === 'usuarios' && (
              loading ? <p className="px-5 py-8 text-center text-metro-muted text-sm">Carregando...</p> : (
                <DataTable
                  headers={['Nome', 'E-mail', 'Nível de Acesso', 'Cadastrado em', '']}
                  empty="Nenhum usuário cadastrado."
                >
                  {filteredUsuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <Td><p className="font-semibold text-metro-text text-[13px]">{u.nome || '—'}</p></Td>
                      <Td className="text-[12px] text-metro-muted">{u.email || '—'}</Td>
                      <Td>
                        <Badge status={u.is_admin ? 'vence_30' : 'ok'}>
                          {u.is_admin ? 'Administrador' : 'Usuário'}
                        </Badge>
                      </Td>
                      <Td className="text-[12px] text-metro-muted">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </Td>
                      <Td>
                        <button onClick={() => abrirEditarUsuario(u)} title="Editar"
                          className="text-metro-muted hover:text-metro-primary p-1 bg-transparent border-none cursor-pointer">
                          <i className="fa-solid fa-pen text-xs" />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </DataTable>
              )
            )}
          </div>

          {/* Panel Detalhe */}
          <SidePanel open={panel === 'detalhe'} title="Detalhes da Solicitação" icon="eye" onClose={() => setPanel(null)}>
            {selected && (
              <div className="flex flex-col gap-3">
                {[
                  ['Nome', selected.nome], ['E-mail', selected.email],
                  ['Função', selected.funcao || '—'], ['Setor', selected.setor || '—'],
                  ['Status', STATUS_LABEL[selected.status]],
                  ['Solicitado em', new Date(selected.created_at).toLocaleDateString('pt-BR')],
                  ['Revisado em', selected.reviewed_at ? new Date(selected.reviewed_at).toLocaleDateString('pt-BR') : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-metro-muted uppercase tracking-wide">{k}</span>
                    <span className="text-[13px] text-metro-text">{v}</span>
                  </div>
                ))}
                {selected.justificativa && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-metro-muted uppercase tracking-wide">Justificativa</span>
                    <p className="text-[13px] text-metro-text bg-slate-50 p-3 rounded-lg">{selected.justificativa}</p>
                  </div>
                )}
                {selected.senha_temp && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-metro-muted uppercase tracking-wide">Senha Temporária</span>
                    <p className="text-[13px] font-mono bg-slate-100 p-3 rounded-lg">{selected.senha_temp}</p>
                  </div>
                )}
                {selected.status === 'pendente' && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" icon="check" onClick={() => abrirAprovar(selected)}>Aprovar</Button>
                    <Button size="sm" variant="outline" icon="xmark" onClick={() => abrirRejeitar(selected)}>Rejeitar</Button>
                  </div>
                )}
              </div>
            )}
          </SidePanel>

          {/* Panel Aprovar */}
          <SidePanel open={panel === 'aprovar'} title="Aprovar Acesso" icon="check" onClose={() => setPanel(null)}>
            {selected && (
              <div className="flex flex-col gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-[13px] font-semibold text-green-800 mb-1">{selected.nome}</p>
                  <p className="text-[12px] text-green-600">{selected.email}</p>
                </div>
                <NivelToggle value={novoNivel} onChange={setNovoNivel} />
                <p className="text-[13px] text-metro-muted">
                  Será criado um usuário com senha temporária gerada automaticamente. Repasse as credenciais ao colaborador.
                </p>
                {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPanel(null)}>Cancelar</Button>
                  <Button size="sm" icon="check" onClick={aprovar} disabled={saving}>
                    {saving ? 'Criando usuário...' : 'Confirmar Aprovação'}
                  </Button>
                </div>
              </div>
            )}
          </SidePanel>

          {/* Panel Credencial */}
          <SidePanel open={panel === 'credencial'} title="Acesso Criado" icon="key" onClose={() => setPanel(null)}>
            {credencial && (
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-circle-check text-xl text-green-500" />
                </div>
                <p className="text-center text-[13px] text-metro-muted">
                  Usuário criado como <strong>{credencial.nivel}</strong>. Repasse as credenciais ao colaborador.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-metro-muted uppercase tracking-wide mb-1">E-mail</p>
                    <p className="text-[13px] font-mono text-metro-text">{credencial.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-metro-muted uppercase tracking-wide mb-1">Senha Temporária</p>
                    <p className="text-[15px] font-mono font-bold text-metro-navy bg-white border border-gray-200 px-3 py-2 rounded-md">{credencial.senha}</p>
                  </div>
                </div>
                <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                  <i className="fa-solid fa-triangle-exclamation mr-1" />
                  Esta senha não será exibida novamente. Anote antes de fechar.
                </p>
                <Button size="sm" icon="check" onClick={() => setPanel(null)}>Concluir</Button>
              </div>
            )}
          </SidePanel>

          {/* Panel Rejeitar */}
          <SidePanel open={panel === 'rejeitar'} title="Rejeitar Solicitação" icon="xmark" onClose={() => setPanel(null)}>
            {selected && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-[13px] font-semibold text-red-800 mb-1">{selected.nome}</p>
                  <p className="text-[12px] text-red-500">{selected.email}</p>
                </div>
                <Textarea label="Motivo da Rejeição (opcional)" value={rejObs}
                  onChange={(e) => setRejObs(e.target.value)}
                  placeholder="Informe o motivo para registro interno..." rows={4} />
                {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPanel(null)}>Cancelar</Button>
                  <Button size="sm" icon="xmark" onClick={rejeitar} disabled={saving}>
                    {saving ? 'Rejeitando...' : 'Confirmar Rejeição'}
                  </Button>
                </div>
              </div>
            )}
          </SidePanel>

          {/* Panel Editar Solicitação */}
          <SidePanel open={panel === 'editar'} title="Editar Solicitação" icon="pen" onClose={() => setPanel(null)}>
            {selected && (
              <div className="flex flex-col gap-1">
                <Input label="Nome" value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} />
                <Input label="Função" value={editForm.funcao} onChange={(e) => setEditForm((f) => ({ ...f, funcao: e.target.value }))} />
                <Select label="Setor" value={editForm.setor} onChange={(e) => setEditForm((f) => ({ ...f, setor: e.target.value }))}>
                  <option value="">— selecione —</option>
                  {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Textarea label="Observação Admin" value={editForm.observacao_admin}
                  onChange={(e) => setEditForm((f) => ({ ...f, observacao_admin: e.target.value }))} rows={3} />
                {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>}
                <div className="flex gap-2 justify-end mt-2">
                  <Button variant="outline" size="sm" onClick={() => setPanel(null)}>Cancelar</Button>
                  <Button size="sm" icon="floppy-disk" onClick={salvarEdicao} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            )}
          </SidePanel>

          {/* Panel Editar Usuário */}
          <SidePanel open={panel === 'editarUsuario'} title="Editar Usuário" icon="user-pen" onClose={() => setPanel(null)}>
            {selected && (
              <div className="flex flex-col gap-1">
                <div className="bg-slate-50 rounded-lg px-3 py-2 mb-2">
                  <p className="text-[10px] font-semibold text-metro-muted uppercase tracking-wide mb-0.5">E-mail</p>
                  <p className="text-[13px] text-metro-text font-mono">{selected.email}</p>
                </div>
                <Input label="Nome" value={editForm.nome}
                  onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} />
                <NivelToggle value={editForm.is_admin}
                  onChange={(v) => setEditForm((f) => ({ ...f, is_admin: v }))} />
                {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md">{erro}</p>}
                <div className="flex gap-2 justify-end mt-2">
                  <Button variant="outline" size="sm" onClick={() => setPanel(null)}>Cancelar</Button>
                  <Button size="sm" icon="floppy-disk" onClick={salvarUsuario} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            )}
          </SidePanel>
        </div>
      </div>
    </div>
  )
}
