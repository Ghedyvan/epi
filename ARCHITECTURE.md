# 🚀 PWA EPI - Arquitetura de Dados

## 📊 Visão Geral

Sistema híbrido de armazenamento com suporte offline-first e sincronização em nuvem.

```
┌─────────────────────────────────────────────────────────┐
│                    Componentes React                     │
│          (useData, useSync, useAutoSync)                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Camada de Sincronização                     │
│           (lib/sync/syncManager.js)                      │
│   • Push: IndexedDB → Supabase                           │
│   • Pull: Supabase → IndexedDB                           │
│   • Resolução de conflitos (LWW)                         │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
           ▼                            ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   IndexedDB (Local)   │    │   Supabase (Nuvem)      │
│  • 5 Stores de dados  │    │  • PostgreSQL            │
│  • Fila de sync       │    │  • Realtime (opcional)   │
│  • Metadados          │    │  • RLS Security          │
└──────────────────────┘    └──────────────────────────┘
```

## 🗄️ Estrutura de Dados

### IndexedDB Stores

| Store | Chave | Índices | Descrição |
|-------|-------|---------|-----------|
| `funcionarios` | `id` | nome, departamento, updated_at | Cadastro de colaboradores |
| `estoque` | `id` | nome, fornecedor, updated_at | Controle de EPIs |
| `fornecedores` | `id` | nome, updated_at | Parceiros fornecedores |
| `prazos` | `id` | epi, status, updated_at | Validade de certificados |
| `lancamentos` | `id` | funcionario, status, updated_at | Histórico de entregas |
| `sync_queue` | auto | store, operation, timestamp | Fila de sincronização |
| `meta` | key | - | Timestamps de sync |

### Supabase Tables

Estrutura idêntica às stores do IndexedDB, com:
- Triggers para atualizar `updated_at` automaticamente
- Índices para otimização de queries
- RLS (Row Level Security) configurável

## 🔄 Fluxo de Sincronização

### 1. Operação Local (Offline ou Online)

```javascript
// Usuário edita um funcionário
await upsert({
  id: "col-01",
  nome: "João Silva",
  cargo: "Supervisor",
  // ...
});

// ✅ Salvo imediatamente no IndexedDB
// ✅ Adicionado à fila de sincronização
```

### 2. Sincronização Automática (a cada 60s, se online)

```javascript
// Auto-sync executa automaticamente
// PUSH: Envia operações pendentes
// PULL: Baixa dados atualizados
// ✅ Fila limpa após sucesso
```

### 3. Sincronização Manual

```javascript
// Usuário clica em "Sincronizar"
const { sync } = useSync();
await sync();
// ✅ Sincronização forçada imediatamente
```

## 🎯 Casos de Uso

### Caso 1: Modo 100% Offline

```
Usuário sem internet
  ↓
Todas as operações vão para IndexedDB
  ↓
Fila de sincronização acumula mudanças
  ↓
Conexão restaurada
  ↓
Auto-sync envia tudo para Supabase
```

### Caso 2: Supabase Não Configurado

```
.env.local sem credenciais
  ↓
App detecta Supabase não configurado
  ↓
Funciona normalmente com IndexedDB
  ↓
Nenhum erro - modo offline puro
```

### Caso 3: Multi-dispositivo (com Supabase)

```
Dispositivo A faz mudança
  ↓
Sincroniza com Supabase
  ↓
Dispositivo B faz pull
  ↓
IndexedDB de B atualizado
  ↓
UI re-renderiza automaticamente
```

## 🛠️ APIs Principais

### useData Hook

```typescript
interface UseDataReturn<T> {
  data: T[];              // Lista de itens
  loading: boolean;       // Carregando?
  error: string | null;   // Erro?
  upsert: (item: T) => Promise<T>;   // Criar/Atualizar
  remove: (id: string) => Promise<void>;  // Deletar
  refresh: () => Promise<void>;      // Recarregar
}
```

### useSync Hook

```typescript
interface UseSyncReturn {
  sync: () => Promise<SyncResult>;   // Sincronizar manualmente
  syncing: boolean;                  // Sincronizando?
  lastSync: string | null;           // Timestamp última sync
  error: string | null;              // Erro?
  pendingCount: number;              // Ops pendentes
  hasPending: boolean;               // Tem pendências?
}
```

### useAutoSync Hook

```typescript
interface UseAutoSyncReturn {
  isOnline: boolean;  // Status de conexão
}

// Uso
useAutoSync(enabled: boolean, intervalMs: number);
```

## 🔐 Segurança

### Desenvolvimento

```sql
-- Políticas permissivas para facilitar desenvolvimento
CREATE POLICY "Permitir acesso público temporário" 
ON funcionarios FOR ALL USING (true);
```

### Produção

```sql
-- Remover políticas de desenvolvimento
DROP POLICY "Permitir acesso público temporário" ON funcionarios;

-- Implementar RLS baseado em autenticação
CREATE POLICY "Usuários autenticados podem ler"
ON funcionarios FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem inserir seus dados"
ON funcionarios FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## 📈 Performance

### Estratégias de Otimização

1. **Índices no IndexedDB**
   - Campos de busca frequentes indexados
   - Queries rápidas mesmo com milhares de registros

2. **Sincronização Incremental**
   - Apenas dados modificados desde última sync
   - Campo `updated_at` para controle

3. **Lazy Loading**
   - Dados carregados sob demanda
   - Componentes mostram spinner durante load

4. **Debouncing de Auto-sync**
   - Evita sincronizações excessivas
   - Intervalo configurável (padrão 60s)

## 🧪 Testes

### Testar Offline

```javascript
// Chrome DevTools
1. Abra DevTools (F12)
2. Network tab → Selecione "Offline"
3. Faça operações no app
4. Verifique IndexedDB → sync_queue
5. Volte para "Online"
6. Observe sincronização automática
```

### Testar Conflitos

```javascript
// Simular conflito
1. Dispositivo A: Edita funcionário, fica offline
2. Dispositivo B: Edita MESMO funcionário
3. Dispositivo B: Sincroniza (vence)
4. Dispositivo A: Volta online e sincroniza
5. Resultado: Versão de B prevalece (LWW)
```

## 📦 Estrutura de Arquivos

```
lib/
├── db/
│   └── indexedDB.js          # Setup IDB, CRUD, seed
├── sync/
│   └── syncManager.js        # Lógica de sincronização
└── supabase.js               # Cliente Supabase

hooks/
└── useData.js                # Hooks React

app/dashboard/
├── funcionarios/page.js      # Exemplo de uso
├── estoque/page.js
├── fornecedores/page.js
├── prazos/page.js
└── lancamentos/page.js

docs/
├── SUPABASE_SETUP.md         # Setup Supabase + SQL
├── HOOKS_GUIDE.md            # Guia de hooks
└── ARCHITECTURE.md           # Este arquivo
```

## 🚦 Fluxo Completo

```
1. App inicializa
   ├─ IndexedDB inicializado
   ├─ Seed de dados (se vazio)
   └─ Auto-sync configurado

2. Usuário acessa página
   ├─ useData carrega de IndexedDB
   ├─ Spinner enquanto carrega
   └─ Dados renderizados

3. Usuário cria/edita/deleta
   ├─ Operação salva no IndexedDB
   ├─ Adicionada à fila de sync
   ├─ UI atualizada imediatamente
   └─ Badge mostra "X pendências"

4. Auto-sync ou sync manual
   ├─ Verifica se online
   ├─ PUSH: Envia fila para Supabase
   ├─ PULL: Baixa atualizações
   ├─ Resolve conflitos (LWW)
   └─ Limpa fila de sync

5. Realtime (opcional)
   ├─ Supabase notifica mudanças
   ├─ Pull automático
   └─ UI atualizada
```

## 🎓 Melhores Práticas

### ✅ Fazer

- Sempre usar hooks para acessar dados
- Validar entrada antes de `upsert()`
- Mostrar loading states
- Tratar erros com try/catch
- Testar em modo offline

### ❌ Evitar

- Acessar IndexedDB diretamente (use hooks)
- Fazer operações síncronas na UI
- Ignorar estados de loading/error
- Assumir que Supabase está sempre online
- Expor credenciais em código frontend

## 🔄 Próximos Passos

### Melhorias Futuras

1. **Conflict Resolution Avançado**
   - Merge manual de conflitos
   - Versionamento otimista

2. **Background Sync API**
   - Service Worker background sync
   - Sincronizar mesmo com app fechado

3. **Compression**
   - Comprimir payload de sincronização
   - Economizar banda/tempo

4. **Analytics**
   - Monitorar taxa de sincronização
   - Detectar problemas de conflito

5. **Autenticação**
   - Supabase Auth
   - RLS por usuário
   - Multi-tenancy

## 📚 Referências

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [idb Library](https://github.com/jakearchibald/idb)
- [Supabase Docs](https://supabase.com/docs)
- [Offline First](https://offlinefirst.org/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
