# 🗄️ Configuração do Supabase

Este guia explica como configurar o banco de dados Supabase para o PWA de Gestão de EPIs.

## 📋 Pré-requisitos

1. Crie uma conta gratuita em [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Aguarde a inicialização do projeto (~ 2 minutos)

## 🔑 Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em **Settings → API**
2. Copie as seguintes informações:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

4. Preencha as variáveis no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🏗️ Criar Schema do Banco de Dados

No dashboard do Supabase, vá em **SQL Editor** e execute o seguinte script:

```sql
-- ============================================
-- Schema para PWA de Gestão de EPIs
-- ============================================

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  data_admissao TEXT,
  cargo TEXT,
  departamento TEXT,
  exame_periodico TEXT,
  proximo_exame TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Estoque
CREATE TABLE IF NOT EXISTS estoque (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  fornecedor TEXT,
  quantidade_recebida INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  custo_unitario DECIMAL(10, 2),
  valor_nota DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  responsavel TEXT,
  telefone TEXT,
  email TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Prazos/Validade de EPIs
CREATE TABLE IF NOT EXISTS prazos (
  id TEXT PRIMARY KEY,
  epi TEXT NOT NULL,
  fornecedor TEXT,
  ca TEXT,
  validade TEXT,
  fabricacao TEXT,
  tempo_uso_maximo TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Lançamentos/Entregas
CREATE TABLE IF NOT EXISTS lancamentos (
  id TEXT PRIMARY KEY,
  funcionario TEXT NOT NULL,
  cargo TEXT,
  departamento TEXT,
  equipamento TEXT NOT NULL,
  ca TEXT,
  entrega TEXT,
  troca_prevista TEXT,
  vencimento_ca TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Índices para performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_funcionarios_nome ON funcionarios(nome);
CREATE INDEX IF NOT EXISTS idx_funcionarios_departamento ON funcionarios(departamento);
CREATE INDEX IF NOT EXISTS idx_funcionarios_updated ON funcionarios(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_estoque_nome ON estoque(nome);
CREATE INDEX IF NOT EXISTS idx_estoque_fornecedor ON estoque(fornecedor);
CREATE INDEX IF NOT EXISTS idx_estoque_updated ON estoque(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores(nome);
CREATE INDEX IF NOT EXISTS idx_fornecedores_updated ON fornecedores(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_prazos_epi ON prazos(epi);
CREATE INDEX IF NOT EXISTS idx_prazos_status ON prazos(status);
CREATE INDEX IF NOT EXISTS idx_prazos_updated ON prazos(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_lancamentos_funcionario ON lancamentos(funcionario);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_updated ON lancamentos(updated_at DESC);

-- ============================================
-- Triggers para atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_funcionarios_updated_at
  BEFORE UPDATE ON funcionarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estoque_updated_at
  BEFORE UPDATE ON estoque
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at
  BEFORE UPDATE ON fornecedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prazos_updated_at
  BEFORE UPDATE ON prazos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lancamentos_updated_at
  BEFORE UPDATE ON lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- Configurar políticas conforme necessário
-- ============================================

-- Por padrão, permitir acesso público (desenvolvimento)
-- Em produção, configure políticas adequadas

ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE prazos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Política temporária: permitir todas as operações (DESENVOLVIMENTO APENAS)
CREATE POLICY "Permitir acesso público temporário" ON funcionarios FOR ALL USING (true);
CREATE POLICY "Permitir acesso público temporário" ON estoque FOR ALL USING (true);
CREATE POLICY "Permitir acesso público temporário" ON fornecedores FOR ALL USING (true);
CREATE POLICY "Permitir acesso público temporário" ON prazos FOR ALL USING (true);
CREATE POLICY "Permitir acesso público temporário" ON lancamentos FOR ALL USING (true);

-- ============================================
-- Dados de exemplo (opcional)
-- ============================================

INSERT INTO funcionarios (id, nome, data_admissao, cargo, departamento, exame_periodico, proximo_exame, observacoes) VALUES
('col-01', 'João Silva', '14/03/2019', 'Supervisor de Campo', 'Operações', '18/09/2025', '18/09/2026', 'Treinamento NR-35 atualizado.'),
('col-02', 'Mariana Campos', '02/07/2021', 'Analista de Logística', 'Logística', '09/08/2025', '09/08/2026', 'Revisar reciclagem de empilhadeira.'),
('col-03', 'Carlos Ribeiro', '27/11/2017', 'Técnico de Manutenção', 'Manutenção', '22/10/2025', '22/10/2026', 'Apto para trabalho em altura.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO estoque (id, nome, fornecedor, quantidade_recebida, estoque_atual, custo_unitario, valor_nota) VALUES
('EST-001', 'Capacete classe B', 'ProtegeMax', 120, 178, 48.50, 5820.00),
('EST-002', 'Respirador PFF2', 'SafeEquip', 90, 124, 12.90, 1161.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO fornecedores (id, nome, responsavel, telefone, email, observacoes) VALUES
('forn-01', 'ProtegeMax', 'Larissa Prado', '(11) 3888-9001', 'larissa.prado@protegmax.com', 'Entrega mensal confirmada · Certificação ISO 45001.'),
('forn-02', 'Segurança Ativa', 'Eduardo Lemos', '(21) 2555-7744', 'eduardo.lemos@segativa.com', 'Revisar contrato de manutenção preventiva.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prazos (id, epi, fornecedor, ca, validade, fabricacao, tempo_uso_maximo, status) VALUES
('PRZ-001', 'Respirador PFF2', 'SafeEquip', '37922', '15/03/2026', '15/03/2024', '12 meses', 'No prazo'),
('PRZ-002', 'Luva nitrílica', 'Escudo Total', '31114', '28/01/2026', '28/01/2024', '18 meses', 'No prazo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lancamentos (id, funcionario, cargo, departamento, equipamento, ca, entrega, troca_prevista, vencimento_ca, status) VALUES
('LAN-001', 'João Silva', 'Supervisor de Campo', 'Operações', 'Respirador PFF2', '37922', '02/09/2025', '02/03/2026', '15/03/2026', 'No prazo'),
('LAN-002', 'Mariana Campos', 'Analista de Logística', 'Logística', 'Luva nitrílica', '31114', '18/08/2025', '18/02/2026', '28/01/2026', 'Próximo do vencimento')
ON CONFLICT (id) DO NOTHING;
```

## ✅ Verificar Configuração

Execute o seguinte comando no SQL Editor para verificar se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver as seguintes tabelas:
- `funcionarios`
- `estoque`
- `fornecedores`
- `prazos`
- `lancamentos`

## 🔄 Como Funciona a Sincronização

### Modo Offline-First

1. **Todas as operações são salvas primeiro no IndexedDB local**
2. **Fila de sincronização** registra todas as mudanças pendentes
3. **Auto-sync** executa a cada 60 segundos quando online
4. **Sincronização manual** disponível via botão no dashboard

### Fluxo de Sincronização

```
┌─────────────┐      PUSH (offline → online)      ┌──────────┐
│  IndexedDB  │ ────────────────────────────────> │ Supabase │
│   (Local)   │                                    │ (Nuvem)  │
└─────────────┘ <──────────────────────────────── └──────────┘
                 PULL (online → offline)
```

1. **PUSH**: Envia operações pendentes para Supabase
2. **PULL**: Baixa dados atualizados do Supabase

### Resolução de Conflitos

- **Estratégia**: Last-Write-Wins (LWW)
- **Campo**: `updated_at` (timestamp)
- O registro com timestamp mais recente prevalece

## 🔒 Segurança (Produção)

⚠️ **IMPORTANTE**: As políticas atuais permitem acesso público para facilitar o desenvolvimento.

Para produção, configure RLS (Row Level Security) adequado:

```sql
-- Remover políticas de desenvolvimento
DROP POLICY IF EXISTS "Permitir acesso público temporário" ON funcionarios;

-- Criar políticas baseadas em autenticação
CREATE POLICY "Usuários podem ler seus próprios dados"
  ON funcionarios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados"
  ON funcionarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 🧪 Testar Sincronização

1. **Inicie o app**: `yarn dev`
2. **Abra DevTools** → Application → IndexedDB → `pwa-epi-db`
3. **Faça uma mudança** em qualquer página
4. **Verifique a fila**: Store `sync_queue`
5. **Aguarde sincronização** ou clique em "Sincronizar" no dashboard
6. **Confirme no Supabase**: Dashboard → Table Editor

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime) (opcional - sincronização em tempo real)

## 🆘 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique políticas RLS

### Dados não sincronizam
- Abra DevTools → Console
- Verifique logs de sincronização
- Confirme que há conexão de internet
- Verifique a fila: `sync_queue` no IndexedDB

### Conflitos de dados
- A estratégia LWW pode sobrescrever mudanças
- Para casos críticos, implemente merge manual
- Considere adicionar campo `version` para controle otimista
