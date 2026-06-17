# Saude Ocupacional - SST Metro-DF (scaffold)

Modulo de gestao de exames ocupacionais (PCMSO) com controle de vencimento.
Persistencia em Supabase.

## 1. Banco
Aplique a migration `0001_saude_ocupacional.sql` no seu projeto Supabase
(SQL Editor, ou `supabase/migrations/` + `supabase db push`).

## 2. Frontend
```bash
npm install
cp .env.example .env      # preencha URL e anon key do projeto
npm run dev
```

## Telas
- **Vencimentos** -> le a view `vw_vencimentos` (vencidos / vence em 30/60/90).
- **Funcionarios** -> le `vw_situacao_funcionario`.
- **Novo ASO** -> insere em `aso`; a trigger calcula `data_proximo` sozinha.

## Proximos passos sugeridos
- Cadastro de funcao/risco e da matriz de exames (periodicidade do PCMSO).
- Upload do PDF do ASO no Supabase Storage (campo `arquivo_url`).
- Convocacao automatica (pg_cron + Edge Function p/ e-mail/WhatsApp).
- Geracao do evento eSocial S-2220.
- Autenticacao e RLS por papel (substituir a policy base "authenticated").
