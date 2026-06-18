const TIPO_LABEL = {
  entrada_via:      'Entrada em Via (NR-10)',
  espaco_confinado: 'Espaço Confinado (NR-33)',
  altura:           'Trabalho em Altura (NR-35)',
  eletricidade:     'Eletricidade (NR-10)',
  geral:            'Permissão Geral / APR',
}

export default function PermissaoPrint({ data }) {
  if (!data) return null

  return (
    <div className="hidden print:block p-8 text-[11px] text-black font-sans">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-black">
        <div>
          <p className="text-[16px] font-bold">METRÔ-DF — Saúde e Segurança do Trabalho</p>
          <p className="text-[13px] font-semibold mt-0.5">Permissão de Trabalho / Análise Preliminar de Risco (APR)</p>
        </div>
        <div className="text-right text-[10px] text-gray-500">
          <p>Emitida em: {new Date().toLocaleDateString('pt-BR')}</p>
          <p>Nº: {data.id?.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Dados da PT */}
      <div className="mb-4 p-3 border border-gray-300 rounded">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Tipo de Permissão</p>
            <p className="font-semibold">{TIPO_LABEL[data.tipo] ?? data.tipo}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Status</p>
            <p className="font-semibold capitalize">{data.status}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Atividade a ser Executada</p>
            <p>{data.atividade}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Local / Área de Execução</p>
            <p>{data.local || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Início</p>
            <p>{data.data_inicio ? new Date(data.data_inicio).toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Término Previsto</p>
            <p>{data.data_fim ? new Date(data.data_fim).toLocaleString('pt-BR') : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Responsável SST</p>
            <p>{data.responsavel_sst || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">EPIs Requeridos</p>
            <p>{data.epis_requeridos || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 border border-gray-300 rounded">
          <p className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Riscos Identificados</p>
          <p>{data.riscos_identificados || '—'}</p>
        </div>
        <div className="p-3 border border-gray-300 rounded">
          <p className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Medidas de Controle</p>
          <p>{data.medidas_controle || '—'}</p>
        </div>
      </div>

      {/* Assinaturas */}
      <div className="mt-10 pt-6 border-t border-gray-300 grid grid-cols-3 gap-8">
        {['Emitente', 'Responsável SST', 'Aprovador'].map((label) => (
          <div key={label} className="text-center">
            <div className="h-12" />
            <div className="border-t border-black pt-1 text-[10px]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
