import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Topbar from '../../components/layout/Topbar'
import { Card, KpiCard } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const SITUACAO_LABEL = {
  vencido:  'Vencido',
  vence_30: 'Vence em breve',
  vence_60: 'Vence em 60d',
  vence_90: 'Vence em 90d',
}

export default function Dashboard() {
  const [vencimentos, setVencimentos] = useState([])
  const [kpis, setKpis] = useState({ vencidos: 0, vence30: 0, episCaVencido: 0, acidenstesMes: 0 })

  useEffect(() => {
    supabase
      .from('vw_vencimentos')
      .select('*')
      .in('situacao', ['vencido', 'vence_30', 'vence_60'])
      .order('dias_para_vencer', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        const rows = data ?? []
        setVencimentos(rows)
        setKpis((k) => ({
          ...k,
          vencidos: rows.filter((r) => r.situacao === 'vencido').length,
          vence30:  rows.filter((r) => r.situacao === 'vence_30').length,
        }))
      })

    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
    supabase
      .from('acidente')
      .select('id', { count: 'exact', head: true })
      .gte('data_hora', inicioMes)
      .then(({ count }) => setKpis((k) => ({ ...k, acidenstesMes: count ?? 0 })))

    const hoje90 = new Date()
    hoje90.setDate(hoje90.getDate() + 90)
    supabase
      .from('epi_item')
      .select('id', { count: 'exact', head: true })
      .lt('validade_ca', hoje90.toISOString().slice(0, 10))
      .then(({ count }) => setKpis((k) => ({ ...k, episCaVencido: count ?? 0 })))
  }, [])

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard label="ASOs Vencidos"        value={kpis.vencidos}       sub="Exige ação imediata"     color="red" />
          <KpiCard label="ASOs Vencem em 30d"   value={kpis.vence30}        sub="Agendar exames"          color="amber" />
          <KpiCard label="EPIs com CA Vencendo" value={kpis.episCaVencido}  sub="Próximos 90 dias"        color="amber" />
          <KpiCard label="Acidentes no Mês"     value={kpis.acidenstesMes}  sub="Ocorrências registradas" color={kpis.acidenstesMes > 0 ? 'red' : 'green'} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            title="ASOs Críticos"
            icon="clock"
            action={
              <Link to="/saude/aso" className="text-xs text-metro-primary font-semibold hover:underline">
                Ver todos →
              </Link>
            }
          >
            {vencimentos.length === 0 ? (
              <p className="px-5 py-6 text-metro-muted text-sm text-center">
                Nenhum exame crítico nos próximos 60 dias.
              </p>
            ) : (
              vencimentos.map((r) => (
                <div key={r.funcionario_id} className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-metro-primary flex-shrink-0">
                    {r.nome_completo?.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-metro-text truncate">{r.nome_completo}</p>
                    <p className="text-[11px] text-metro-muted">{r.funcao}</p>
                  </div>
                  <Badge status={r.situacao}>{SITUACAO_LABEL[r.situacao] ?? r.situacao}</Badge>
                </div>
              ))
            )}
          </Card>

          <Card title="Acesso Rápido" icon="bolt">
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { to: '/saude/aso',           icon: 'file-medical',         label: 'ASO / Exames' },
                { to: '/seguranca/acidentes', icon: 'triangle-exclamation', label: 'Acidentes / CAT' },
                { to: '/epi',                 icon: 'helmet-safety',         label: 'Gestão de EPIs' },
                { to: '/treinamentos',        icon: 'graduation-cap',        label: 'Treinamentos' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-100 hover:border-metro-primary hover:bg-metro-bg transition-colors group"
                >
                  <i className={`fa-solid fa-${item.icon} text-metro-primary text-sm w-4 text-center`} />
                  <span className="text-[12px] font-semibold text-metro-text group-hover:text-metro-primary">{item.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
