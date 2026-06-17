# SST Metro-DF — Plataforma Profissional de Saúde e Segurança do Trabalho

**Data:** 2026-06-17  
**Status:** Aprovado para implementação  
**Stack:** React 18 + Vite + Tailwind CSS + React Router v6 + Supabase

---

## 1. Visão Geral

Reescrita completa da plataforma SST do Metro-DF para cobrir todas as atribuições legais e operacionais de Saúde e Segurança do Trabalho de um metrô. A plataforma atual (3 abas, inline CSS, sem autenticação) será substituída por um sistema modular com 8 domínios funcionais, autenticação por perfis e design idêntico ao site oficial do Metro-DF.

**Objetivos:**
- Cumprir integralmente as obrigações do SESMT do Metro-DF (NR-1, NR-4, NR-6, NR-7, NR-9, NR-10, NR-12, NR-33, NR-35)
- Fornecer visão 360° de cada funcionário (prontuário SST completo)
- Oferecer dashboard com KPIs operacionais para SESMT e gestores de setor
- Manter identidade visual do Metro-DF em 100% da interface

---

## 2. Stack Técnica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | React 18 + Vite | Mantém base existente |
| Estilo | Tailwind CSS + tokens Metro-DF | Design system exato do site oficial |
| Roteamento | React Router v6 | Necessário para 12+ rotas |
| Ícones | Font Awesome 6 (CDN) | Já usado no metro.df.gov.br |
| Tipografia | Inter (Google Fonts) | Fonte oficial do site Metro-DF |
| Backend | Supabase (Postgres + Auth + RLS) | Mantém base existente |
| Estado global | React Context (auth) | Escopo adequado — sem Zustand/Redux |

### Design Tokens Metro-DF

```js
// tailwind.config.js
colors: {
  'metro-navy':    '#183C72',  // sidebar, footer, headers de form
  'metro-primary': '#506F9B',  // botões, links, ícones ativos
  'metro-dark':    '#3A5275',  // hover de botões primários
  'metro-accent':  '#FEB538',  // borda ativa na sidebar, destaques
  'metro-orange':  '#FF8C00',  // avisos, badges âmbar
  'metro-text':    '#3F3F3F',  // texto principal
  'metro-muted':   '#767676',  // texto secundário
  'metro-bg':      '#FAFAFA',  // fundo geral
}
fontFamily: { sans: ['Inter', 'sans-serif'] }
```

---

## 3. Estrutura de Pastas

```
src/
  components/
    layout/         # AppShell, Sidebar, Topbar
    ui/             # Button, Badge, Table, Modal, FormControl, Card, Pagination
  pages/
    Dashboard/
    saude/
      Aso/          # list + form
      Pcmso/
      Absenteismo/
    seguranca/
      Acidentes/
      Inspecoes/
      Permissoes/
    epi/
    treinamentos/
    cipa/
    laudos/
    funcionarios/
      FichaCompleta/
    auth/
      Login/
  hooks/
    useAuth.js
    useRole.js
  lib/
    supabase.js
    auth.js
```

---

## 4. Módulos e Rotas

### 4.1 Dashboard (`/dashboard`)
- KPIs: ASOs vencidos, ASOs vencendo em 30d, EPIs com CA vencido, % treinamentos válidos, acidentes no mês
- Painel "ASOs críticos" — lista dos mais urgentes com link direto
- Painel "Ocorrências recentes" — últimos acidentes/quase-acidentes com status
- Filtro por setor (SESMT vê todos; gestor vê apenas seu setor via RLS)

### 4.2 ASO / Exames Médicos (`/saude/aso`)
- Lista paginada com filtros por setor, tipo de ASO e situação (vencido / vence 30d / regular)
- Badges coloridos de situação: `vencido` (vermelho), `vence_30` (laranja), `vence_60` (amarelo), `vence_90` (azul), `ok` (verde), `sem_aso` (cinza)
- Formulário lateral: funcionário, tipo (admissional / periódico / retorno / mudança de função / demissional), data, médico responsável (CRM), resultado (apto / apto com restrição / inapto), restrições, exames complementares
- Exportação da lista em PDF/CSV
- **Tabelas:** `aso`, `exame_complementar`

### 4.3 PCMSO (`/saude/pcmso`)
- Cadastro do programa vigente (médico coordenador, CRM, vigência)
- Ações programadas por GHE com status (pendente / realizado)
- Upload/link do documento do programa
- **Tabelas:** `pcmso_programa`, `pcmso_acao`, `ghe` (Grupo Homogêneo de Exposição)

### 4.4 Absenteísmo (`/saude/absenteismo`)
- Registro de afastamentos: funcionário, tipo (doença / acidente / licença), CID-10, período (início/fim), dias afastados, CRM médico, número do INSS
- Vínculo com CAT quando for acidente de trabalho
- Indicador de taxa de absenteísmo mensal por setor
- **Tabela:** `afastamento`

### 4.5 Acidentes e CAT (`/seguranca/acidentes`)
- Registro de ocorrências: tipo (acidente típico / trajeto / quase-acidente / doença ocupacional), data/hora, local (setor + descrição), funcionário(s) envolvido(s), descrição, partes do corpo atingidas
- Fluxo de investigação com status: `registrado → investigando → concluído`
- Emissão de CAT (campos do formulário CAT do INSS)
- Árvore de causas simplificada (causa imediata, básica, falta de controle)
- Indicadores: taxa de frequência (TF) e taxa de gravidade (TG)
- **Tabelas:** `acidente`, `acidente_envolvido`, `cat`, `causa_acidente`

### 4.6 Inspeções de Segurança (`/seguranca/inspecoes`)
- Criação de inspeção: área/setor, tipo (rotineira / especial / pós-acidente), data, responsável técnico
- Checklist por área: estações, oficina, CCO, via permanente, depósito
- Registro de não-conformidades com foto (upload Supabase Storage), criticidade (crítica / grave / moderada) e prazo para correção
- Plano de ação com responsável e status de fechamento
- **Tabelas:** `inspecao`, `inspecao_item`, `nao_conformidade`, `plano_acao`

### 4.7 Permissões de Trabalho (`/seguranca/permissoes`)
- APR (Análise Preliminar de Riscos): atividade, local, riscos identificados, medidas de controle, EPI requerido
- Permissão de Trabalho para atividades críticas específicas do metrô:
  - **Entrada em Via** — verificação de isolamento elétrico (NR-10), autorização operacional
  - **Espaço Confinado** (NR-33) — atmosfera, ventilação, sentinela, equipe de resgate
  - **Trabalho em Altura** (NR-35) — ponto de ancoragem, inspeção de EPI
  - **Eletricidade** (NR-10) — nível de tensão, habilitação do executante
- Vincula: solicitante, executantes (lista de funcionários), responsável SST, aprovador
- Status: `rascunho → aprovada → em execução → encerrada`
- **Tabelas:** `permissao_trabalho`, `pt_executante`, `apr`, `apr_risco`

### 4.8 Gestão de EPIs (`/epi`)
- Cadastro de itens de EPI: nome, CA (Certificado de Aprovação), fabricante, validade do CA, tipo de risco
- Estoque por item com alertas de CA vencido
- Ficha de EPI por funcionário: entrega de cada item com data, quantidade, assinatura digital (checkbox de confirmação), devolução
- Histórico completo de entregas por funcionário
- Alerta automático quando CA vence
- **Tabelas:** `epi_item`, `epi_entrega`, `epi_estoque`

### 4.9 Treinamentos e Capacitações (`/treinamentos`)
- Cadastro de treinamentos: nome, NR vinculada, carga horária, validade (meses), instrutor
- Calendário de treinamentos programados
- Lista de presença: vincula funcionários ao treinamento com data de conclusão
- Controle de validade por funcionário × NR: alerta quando vence
- NRs monitoradas automaticamente: NR-6, NR-10, NR-12, NR-33, NR-35 (exigidas para funções do metrô)
- **Tabelas:** `treinamento`, `treinamento_participante`, `nr_validade`

### 4.10 CIPA (`/cipa`)
- Gestão de mandatos: período, número de membros por eleição/designação
- Cadastro de membros: funcionário, cargo (presidente / vice / titular / suplente), área representada
- Atas de reuniões ordinárias (mensal) e extraordinárias com upload de PDF
- Mapa de riscos: registro por área com tipo de risco e medida proposta
- **Tabelas:** `cipa_mandato`, `cipa_membro`, `cipa_reuniao`, `cipa_ata`, `mapa_risco`

### 4.11 Laudos e Programas (`/laudos`)
- Repositório de documentos do PGR, LTCAT, PPRA, PCMSO (upload para Supabase Storage)
- Campos: tipo, título, técnico responsável, data de emissão, vigência, revisão número
- Alerta quando vigência estiver próxima do vencimento
- Vinculação de GHEs ao LTCAT (quais grupos de exposição são abordados)
- **Tabela:** `laudo_documento`, `laudo_ghe`

### 4.12 Funcionários (`/funcionarios`)
- Lista com busca e filtros por setor/função
- Cadastro: matrícula, nome, CPF, função, setor, data de admissão, turno, status (ativo/inativo)
- **Ficha Completa do Funcionário** (`/funcionarios/:id`) — prontuário SST 360°:
  - Linha do tempo de ASOs
  - EPIs entregues (com status de CA)
  - Treinamentos e validades de NRs
  - Acidentes e afastamentos
  - Permissões de trabalho emitidas
  - Participação na CIPA
- **Tabela:** `funcionario` (existente), `setor`, `funcao`

---

## 5. Autenticação e Perfis de Acesso

### Fluxo de Login
Supabase Auth com e-mail + senha. Após login, busca `perfil` do usuário para determinar papel e setor.

### Tabela `perfil`
```sql
perfil (
  id uuid references auth.users,
  nome text,
  papel text check (papel in ('sesmt', 'gestor')),
  setor_id int references setor(id),  -- null para sesmt (acessa todos)
  created_at timestamptz
)
```

### Matriz de Permissões

| Ação | SESMT | Gestor |
|---|---|---|
| Dashboard — todos os setores | ✅ | ❌ |
| Dashboard — próprio setor | ✅ | ✅ |
| Registrar / editar qualquer módulo | ✅ | ❌ |
| Consultar registros do próprio setor | ✅ | ✅ |
| Exportar relatórios (próprio setor) | ✅ | ✅ |
| Gerenciar funcionários | ✅ | ❌ |
| Laudos e PCMSO (leitura) | ✅ | ✅ |
| Permissões de Trabalho (leitura) | ✅ | ✅ |

### Row Level Security (Supabase)
Gestores têm RLS aplicado em todas as tabelas filtrando por `setor_id`. SESMT não tem restrição de setor.

---

## 6. Padrão Visual dos Módulos

Todos os módulos seguem o mesmo padrão de layout:

1. **Topbar** — breadcrumb, botão de exportar, botão de ação primária (ex: "Novo ASO")
2. **Barra de filtros** — busca por texto + selects de setor/tipo + chips de situação rápida
3. **Tabela paginada** — colunas padronizadas, badges de status, ações por linha (ver / editar)
4. **Formulário lateral** — painel que abre à direita da tabela com header azul-marinho e campos do formulário

### Componentes UI a construir
- `Button` (primary / outline / ghost, tamanhos sm/md)
- `Badge` (vencido / vence_30 / vence_60 / vence_90 / ok / sem_aso + variantes livres)
- `Table` + `TableRow` + `Pagination`
- `FormControl` (label + input/select/textarea com foco em metro-primary)
- `FilterBar` + `SearchInput` + `FilterChip`
- `Card` + `KpiCard`
- `SidePanel` (formulário lateral deslizante)
- `Modal` (confirmações e detalhes)
- `AppShell` (Sidebar + Topbar + área de conteúdo)
- `Sidebar` com seções, items ativos e badges de alerta

---

## 7. Modelo de Dados — Tabelas Novas

As tabelas `funcionario`, `aso` e as views `vw_vencimentos` / `vw_situacao_funcionario` já existem. As novas tabelas a criar:

```
setor, funcao, ghe
perfil
afastamento
acidente, acidente_envolvido, cat, causa_acidente
inspecao, inspecao_item, nao_conformidade, plano_acao
permissao_trabalho, pt_executante, apr, apr_risco
epi_item, epi_entrega, epi_estoque
treinamento, treinamento_participante, nr_validade
cipa_mandato, cipa_membro, cipa_reuniao, cipa_ata, mapa_risco
pcmso_programa, pcmso_acao
laudo_documento, laudo_ghe
exame_complementar
```

---

## 8. Fases de Implementação

A implementação será feita em 4 fases priorizando os módulos de maior impacto operacional:

**Fase 1 — Fundação**
- Setup Tailwind com tokens Metro-DF
- Componentes UI base (Button, Badge, Table, FormControl, AppShell, Sidebar)
- React Router com estrutura de rotas
- Autenticação Supabase Auth + perfis SESMT/Gestor
- Migração do ASO existente para o novo layout

**Fase 2 — Módulos Críticos**
- Dashboard com KPIs
- Acidentes / CAT
- Gestão de EPIs
- Treinamentos e NRs

**Fase 3 — Módulos Regulatórios**
- Permissões de Trabalho (APR + PT)
- Inspeções de Segurança
- Absenteísmo
- PCMSO

**Fase 4 — Gestão e Documentos**
- CIPA
- Laudos / PGR
- Ficha Completa do Funcionário (prontuário 360°)
- Exportações PDF/CSV

---

## 9. Critérios de Sucesso

- Dashboard carrega KPIs em < 2s
- Todos os módulos vinculam registros a funcionários
- Ficha do Funcionário consolida dados de todos os módulos
- RLS garante que gestores vejam apenas dados do próprio setor
- Design idêntico ao site metro.df.gov.br (tokens, fonte, ícones)
- Formulários validam campos obrigatórios antes de salvar
- Exportação disponível em todos os módulos de lista
