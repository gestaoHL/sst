# SST Metro-DF — Fase 4: Design Spec

**Data:** 2026-06-17  
**Status:** Aprovado  
**Escopo:** CIPA (membros), Laudos/PGR (documentos + riscos por GHE), Ficha Completa do Funcionário (prontuário 360°), Exportações CSV + PDF por impressão CSS

---

## 1. Contexto

O projeto SST Metro-DF completou 3 fases com 10 módulos operacionais. Todos seguem o padrão: `Topbar + FilterBar + DataTable + SidePanel`. A Fase 4 fecha o escopo do MVP com os 3 stubs restantes no router (`/cipa`, `/laudos`, `/funcionarios`) e adiciona exportações transversais.

**Tech stack:** React 18, Vite 5, Tailwind CSS 3, React Router v6, Supabase JS v2, Font Awesome 6 (CDN). Nenhuma dependência nova será adicionada.

---

## 2. Arquitetura

### Arquivos novos

| Arquivo | Responsabilidade |
|---|---|
| `src/pages/funcionarios/FuncionariosPage.jsx` | Lista de funcionários com design system (substitui legado) |
| `src/pages/funcionarios/FuncionarioProntuario.jsx` | Perfil 360° com 5 abas |
| `src/pages/funcionarios/ProntuarioPrint.jsx` | Layout A4 para impressão do prontuário |
| `src/pages/cipa/CipaPage.jsx` | Lista de membros da CIPA |
| `src/pages/cipa/CipaMembroForm.jsx` | Formulário de cadastro de membro |
| `src/pages/laudos/LaudosPage.jsx` | Container com abas Documentos / Riscos |
| `src/pages/laudos/LaudoForm.jsx` | Formulário de laudo/documento técnico |
| `src/pages/laudos/RiscoForm.jsx` | Formulário de risco por GHE |
| `src/lib/exportCsv.js` | Utilitário de exportação CSV |
| `src/pages/seguranca/Permissoes/PermissaoPrint.jsx` | Layout A4 para impressão de PT/APR |

### Arquivos modificados

| Arquivo | O que muda |
|---|---|
| `src/router.jsx` | 3 stubs → componentes reais + nova rota `/funcionarios/:id` |
| `src/pages/saude/Aso/AsoPage.jsx` | Botão "Exportar CSV" no Topbar |
| `src/pages/epi/EpiPage.jsx` | Botão "Exportar CSV" no Topbar |
| `src/pages/treinamentos/TreinamentosPage.jsx` | Botão "Exportar CSV" no Topbar |
| `src/pages/seguranca/Acidentes/AcidentesPage.jsx` | Botão "Exportar CSV" no Topbar |
| `src/pages/saude/Absenteismo/AbsenteismoPage.jsx` | Botão "Exportar CSV" no Topbar |
| `src/pages/seguranca/Permissoes/PermissoesPage.jsx` | Botão "Imprimir PT" por linha |

---

## 3. Módulo Funcionários

### `/funcionarios` — Lista

- Topbar com título "Funcionários", breadcrumb "Cadastros"
- FilterBar: busca por nome/matrícula + chips de situação (Todos / Regular / Vencido / Vence em breve)
- DataTable colunas: Matrícula, Nome, Função, Setor, Último ASO, Situação
- Dados via `vw_situacao_funcionario` (view já existente no Supabase)
- Cada linha: botão olho navega para `/funcionarios/:id`
- O arquivo legado `src/pages/Funcionarios.jsx` deixa de ser usado (router aponta para o novo)

### `/funcionarios/:id` — Prontuário 360°

**Cabeçalho:** nome completo, matrícula, função, setor. Botão "Imprimir Prontuário" → `window.print()`.

**5 abas:**

| Aba | Fonte de dados | Conteúdo |
|---|---|---|
| Resumo | múltiplas tabelas | KPIs: último ASO (data + situação), total de EPIs entregues, treinamentos válidos, dias afastados no ano |
| ASOs | tabela `aso` | Lista filtrada por `funcionario_id`, ordenada por data desc |
| EPIs | tabela `epi_entrega` | Histórico de entregas com nome do EPI e CA |
| Treinamentos | tabela `treinamento_participante` (se existir) | Lista de participações; se tabela ausente, exibe aviso informativo |
| Afastamentos | tabela `afastamento` | Lista filtrada por `funcionario_id` |

**Impressão (`ProntuarioPrint.jsx`):** componente renderizado abaixo do conteúdo principal, visível apenas via `@media print`. Cabeçalho com logo Metro-DF (texto), dados do funcionário, e todas as seções em tabelas simples. Sidebar e topbar ocultos no print via classe `print:hidden`.

---

## 4. Módulo CIPA

### `/cipa` — Membros

- Topbar: "CIPA", breadcrumb "Gestão", botão "Adicionar Membro"
- FilterBar: busca por nome + chips Todos / Titular / Suplente
- DataTable colunas: Nome, Matrícula, Cargo na CIPA, Tipo, Representação, Início, Fim, Situação
- Situação calculada no front: `data_fim >= hoje` → badge verde "Ativo"; caso contrário → badge cinza "Inativo"

**`CipaMembroForm` campos:**
- Funcionário (select de `funcionario`)
- Cargo (Presidente / Vice-Presidente / Secretário / Membro)
- Tipo (Titular / Suplente)
- Representação (Empregador / Empregados)
- Data de Início do Mandato
- Data de Fim do Mandato

**Tabela Supabase:** `cipa_membro` com campos correspondentes.

---

## 5. Módulo Laudos / PGR

### `/laudos` — Duas abas

Abas no topo da página (state local `abaAtiva`), sem roteamento separado.

#### Aba Documentos

- DataTable colunas: Tipo, Título, Responsável Técnico, Data Emissão, Validade, Status
- Status calculado no front: mesmo padrão de `caStatus()` do módulo EPI (vencido / vencendo em 90d / válido)
- Botão "Novo Documento" → SidePanel com `LaudoForm`

**`LaudoForm` campos:**
- Tipo (Laudo Insalubridade / Laudo Periculosidade / LTCAT / PGR / Outro)
- Título
- Responsável Técnico
- CRT/CRQ do Responsável
- Data de Emissão
- Validade
- URL/Link do documento
- Observações

#### Aba Riscos por GHE

- DataTable colunas: GHE, Agente, Tipo de Risco, Fonte, Intensidade, EPC, EPI Requerido
- Botão "Novo Risco" → SidePanel com `RiscoForm`

**`RiscoForm` campos:**
- GHE (Grupo Homogêneo de Exposição)
- Agente de Risco
- Tipo (Físico / Químico / Biológico / Ergonômico / Acidente)
- Fonte/Origem
- Intensidade/Concentração
- EPC adotado
- EPI requerido
- Observações

**Tabelas Supabase:** `laudo` e `risco_ghe`.

---

## 6. Exportações

### CSV

**`src/lib/exportCsv.js`:**
```js
export function exportCsv(rows, filename) {
  // converte array de objetos para CSV, dispara download via blob URL
}
```

- Exporta os dados **filtrados** (o que está visível na tela, não a tabela inteira)
- Botão "Exportar CSV" com ícone `file-csv` adicionado ao `actions` do Topbar em: ASO, EPIs, Treinamentos, Acidentes, Afastamentos
- Campos aninhados (ex: `funcionario.nome_completo`) são achatados antes do export

### PDF por impressão CSS

- `@media print` via Tailwind `print:hidden` na sidebar e topbar
- `ProntuarioPrint.jsx`: componente visível só no print, renderiza prontuário completo em layout A4
- `PermissaoPrint.jsx`: layout formal da PT/APR com campos de assinatura (Emitente / Responsável SST / Aprovador). Mecanismo: botão "Imprimir PT" por linha em `PermissoesPage` guarda o registro em state (`printTarget`), renderiza `<PermissaoPrint data={printTarget} />` oculto no DOM (`print:block hidden`), chama `window.print()`. Após o print, limpa o state.
- Botão "Imprimir Prontuário" em `FuncionarioProntuario.jsx` chama `window.print()` diretamente — `ProntuarioPrint` já está no DOM da página

---

## 7. Testes

Suite existente (23 testes) deve continuar passando após cada task. Nenhum teste novo é exigido para esta fase — os componentes seguem o mesmo padrão visual já coberto.

---

## 8. Tabelas Supabase necessárias (criadas pelo usuário)

| Tabela | Campos mínimos |
|---|---|
| `cipa_membro` | `id`, `funcionario_id`, `cargo`, `tipo`, `representacao`, `data_inicio`, `data_fim` |
| `laudo` | `id`, `tipo`, `titulo`, `responsavel_tecnico`, `crt_crq`, `data_emissao`, `validade`, `url_documento`, `observacoes` |
| `risco_ghe` | `id`, `ghe`, `agente`, `tipo_risco`, `fonte`, `intensidade`, `epc`, `epi_requerido`, `observacoes` |
| `treinamento_participante` | `id`, `treinamento_id`, `funcionario_id` (opcional — aba exibe aviso se ausente) |
