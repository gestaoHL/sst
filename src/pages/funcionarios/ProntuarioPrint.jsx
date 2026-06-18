function PrintSection({ title, rows, headers, renderRow }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-[12px] uppercase tracking-wide border-b border-gray-400 pb-1 mb-2">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[10px] text-gray-400 italic">Nenhum registro.</p>
      ) : (
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((h) => (
                <th key={h} className="text-left px-2 py-1 border border-gray-300 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {renderRow(r).map((cell, j) => (
                  <td key={j} className="px-2 py-1 border border-gray-300">{cell ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function ProntuarioPrint({ func, asos, epis, treinamentos, afastamentos }) {
  if (!func) return null

  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

  return (
    <div className="hidden print:block p-8 text-[11px] text-black font-sans">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-black">
        <div>
          <p className="text-[16px] font-bold">METRÔ-DF — Saúde e Segurança do Trabalho</p>
          <p className="text-[13px] font-semibold mt-0.5">Prontuário Individual do Funcionário</p>
        </div>
        <div className="text-right text-[10px] text-gray-500">
          <p>Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Dados cadastrais */}
      <div className="mb-5 p-3 border border-gray-300 rounded">
        <p className="font-bold text-[11px] uppercase tracking-wide mb-2">Dados Cadastrais</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Nome Completo', func.nome_completo],
            ['Matrícula', func.matricula],
            ['Função', func.funcao || '—'],
            ['Setor', func.setor || '—'],
            ['Admissão', func.data_admissao ? fmt(func.data_admissao) : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] text-gray-500 uppercase">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ASOs */}
      <PrintSection
        title="Exames Médicos (ASO)"
        rows={asos}
        headers={['Data', 'Tipo', 'Médico Responsável', 'Próximo Exame']}
        renderRow={(r) => [
          fmt(r.data_aso),
          r.tipo_exame || '—',
          r.medico_responsavel || '—',
          r.data_proximo_aso ? fmt(r.data_proximo_aso) : '—',
        ]}
      />

      {/* EPIs */}
      <PrintSection
        title="EPIs Recebidos"
        rows={epis}
        headers={['EPI', 'CA', 'Quantidade', 'Data de Entrega']}
        renderRow={(r) => [
          r.epi_item?.nome || '—',
          r.epi_item?.ca || '—',
          r.quantidade,
          r.data_entrega ? fmt(r.data_entrega) : '—',
        ]}
      />

      {/* Treinamentos */}
      <PrintSection
        title="Treinamentos"
        rows={treinamentos}
        headers={['Treinamento', 'NR', 'Data', 'Válido até']}
        renderRow={(r) => {
          const d = r.treinamento?.data_realizacao
          const m = r.treinamento?.validade_meses
          const fmt = (dt) => dt ? new Date(dt + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
          const valido = d && m
            ? new Date(new Date(d).setMonth(new Date(d).getMonth() + m)).toLocaleDateString('pt-BR')
            : '—'
          return [r.treinamento?.nome || '—', r.treinamento?.nr_vinculada || '—', d ? fmt(d) : '—', valido]
        }}
      />

      {/* Afastamentos */}
      <PrintSection
        title="Afastamentos"
        rows={afastamentos}
        headers={['Tipo', 'CID-10', 'Início', 'Retorno', 'Dias']}
        renderRow={(r) => [
          r.tipo || '—',
          r.cid10 || '—',
          r.data_inicio ? fmt(r.data_inicio) : '—',
          r.data_fim ? fmt(r.data_fim) : 'Em curso',
          r.dias_afastados ?? '—',
        ]}
      />

      {/* Assinaturas */}
      <div className="mt-10 pt-6 border-t border-gray-300 grid grid-cols-2 gap-16">
        {['Responsável SST', 'Funcionário'].map((label) => (
          <div key={label} className="text-center">
            <div className="h-10" />
            <div className="border-t border-black pt-1 text-[10px]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
