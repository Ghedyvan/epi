# 📘 Guia de Uso - Hooks de Dados

Este guia explica como usar os hooks personalizados para gerenciar dados no PWA.

## 🎣 useData

Hook principal para gerenciar dados de uma store do IndexedDB com sincronização automática.

### Uso Básico

```jsx
"use client";

import { useData } from "@/hooks/useData";
import { STORES } from "@/lib/db/indexedDB";

export default function MinhaPage() {
  const { data, loading, error, upsert, remove, refresh } = useData(STORES.FUNCIONARIOS);

  if (loading) return <Spinner label="Carregando..." />;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.nome}</div>
      ))}
    </div>
  );
}
```

### API do useData

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `data` | `Array` | Lista de itens da store |
| `loading` | `boolean` | Indica se está carregando |
| `error` | `string \| null` | Mensagem de erro, se houver |
| `upsert` | `Function` | Criar ou atualizar item |
| `remove` | `Function` | Deletar item por ID |
| `refresh` | `Function` | Recarregar dados |

### Exemplo: Criar/Atualizar

```jsx
const { upsert } = useData(STORES.FUNCIONARIOS);

const handleSave = async () => {
  try {
    await upsert({
      id: "col-99",
      nome: "Novo Funcionário",
      cargo: "Analista",
      departamento: "TI",
      // ... outros campos
    });
    alert("Salvo com sucesso!");
  } catch (err) {
    alert("Erro ao salvar: " + err.message);
  }
};
```

### Exemplo: Deletar

```jsx
const { remove } = useData(STORES.FUNCIONARIOS);

const handleDelete = async (id) => {
  if (confirm("Tem certeza?")) {
    try {
      await remove(id);
      alert("Deletado!");
    } catch (err) {
      alert("Erro ao deletar: " + err.message);
    }
  }
};
```

## 🔄 useSync

Hook para gerenciar sincronização manual com Supabase.

### Uso Básico

```jsx
"use client";

import { useSync } from "@/hooks/useData";
import { Button, Chip, Spinner } from "@heroui/react";

export default function SyncButton() {
  const { sync, syncing, lastSync, error, pendingCount, hasPending } = useSync();

  return (
    <div>
      <Button
        color="primary"
        onPress={sync}
        isLoading={syncing}
        disabled={!hasPending}
      >
        {syncing ? "Sincronizando..." : "Sincronizar"}
      </Button>

      {hasPending && (
        <Chip color="warning">{pendingCount} pendências</Chip>
      )}

      {lastSync && (
        <p>Última sincronização: {new Date(lastSync).toLocaleString()}</p>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### API do useSync

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `sync` | `Function` | Executa sincronização manual |
| `syncing` | `boolean` | Indica se está sincronizando |
| `lastSync` | `string \| null` | Timestamp da última sync |
| `error` | `string \| null` | Erro na sincronização |
| `pendingCount` | `number` | Quantidade de operações pendentes |
| `hasPending` | `boolean` | Se há operações pendentes |

## 🔁 useAutoSync

Hook para habilitar sincronização automática em background.

### Uso Básico

```jsx
"use client";

import { useAutoSync } from "@/hooks/useData";
import { Chip } from "@heroui/react";

export default function Layout({ children }) {
  const { isOnline } = useAutoSync(true, 60000); // auto-sync a cada 60s

  return (
    <div>
      <header>
        <Chip color={isOnline ? "success" : "warning"}>
          {isOnline ? "Online" : "Offline"}
        </Chip>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### API do useAutoSync

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `enabled` | `boolean` | `true` | Habilita auto-sync |
| `intervalMs` | `number` | `60000` | Intervalo em ms |

| Retorno | Tipo | Descrição |
|---------|------|-----------|
| `isOnline` | `boolean` | Status de conexão |

## 📦 Stores Disponíveis

```javascript
import { STORES } from "@/lib/db/indexedDB";

STORES.FUNCIONARIOS    // Funcionários
STORES.ESTOQUE         // Estoque/Equipamentos
STORES.FORNECEDORES    // Fornecedores
STORES.PRAZOS          // Prazos/Validade de EPIs
STORES.LANCAMENTOS     // Lançamentos/Entregas
```

## 🎯 Exemplo Completo

```jsx
"use client";

import { useState } from "react";
import { useData, useSync } from "@/hooks/useData";
import { STORES } from "@/lib/db/indexedDB";
import {
  Button,
  Card,
  CardBody,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";

export default function CRUDExample() {
  const { data, loading, upsert, remove } = useData(STORES.FUNCIONARIOS);
  const { sync, syncing, hasPending, pendingCount } = useSync();
  
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");

  const handleAdd = async () => {
    if (!nome || !cargo) return;
    
    await upsert({
      id: `col-${Date.now()}`,
      nome,
      cargo,
      departamento: "Novo",
      updated_at: new Date().toISOString(),
    });

    setNome("");
    setCargo("");
  };

  if (loading) return <Spinner />;

  return (
    <Card>
      <CardBody>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nome"
            value={nome}
            onValueChange={setNome}
          />
          <Input
            placeholder="Cargo"
            value={cargo}
            onValueChange={setCargo}
          />
          <Button color="primary" onPress={handleAdd}>
            Adicionar
          </Button>
        </div>

        {hasPending && (
          <Button
            color="warning"
            onPress={sync}
            isLoading={syncing}
            className="mb-4"
          >
            Sincronizar ({pendingCount} pendências)
          </Button>
        )}

        <Table>
          <TableHeader>
            <TableColumn>Nome</TableColumn>
            <TableColumn>Cargo</TableColumn>
            <TableColumn>Ações</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.cargo}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => remove(item.id)}
                  >
                    Deletar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
```

## 🔥 Dicas Avançadas

### 1. Refresh Manual

```jsx
const { refresh } = useData(STORES.ESTOQUE);

// Recarregar após ação externa
useEffect(() => {
  window.addEventListener("storage", refresh);
  return () => window.removeEventListener("storage", refresh);
}, [refresh]);
```

### 2. Validação Antes de Salvar

```jsx
const handleSave = async (item) => {
  // Validar
  if (!item.nome || item.nome.length < 3) {
    alert("Nome deve ter pelo menos 3 caracteres");
    return;
  }

  // Salvar
  try {
    await upsert(item);
  } catch (err) {
    console.error(err);
  }
};
```

### 3. Loading States Personalizados

```jsx
const { data, loading } = useData(STORES.FORNECEDORES);

if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" />
      <p>Carregando fornecedores...</p>
    </div>
  );
}
```

### 4. Combinar Múltiplas Stores

```jsx
function Dashboard() {
  const funcionarios = useData(STORES.FUNCIONARIOS);
  const estoque = useData(STORES.ESTOQUE);
  const { sync, syncing } = useSync();

  const loading = funcionarios.loading || estoque.loading;

  if (loading) return <Spinner />;

  return (
    <div>
      <h2>Funcionários: {funcionarios.data.length}</h2>
      <h2>Estoque: {estoque.data.length}</h2>
      <Button onPress={sync} isLoading={syncing}>
        Sincronizar Tudo
      </Button>
    </div>
  );
}
```

## 🐛 Debugging

### Ver IndexedDB no DevTools

1. Abra DevTools (F12)
2. Vá em **Application** → **Storage** → **IndexedDB**
3. Expanda `pwa-epi-db`
4. Veja as stores e dados armazenados

### Ver Fila de Sincronização

```jsx
import { getPendingSync } from "@/lib/db/indexedDB";

const checkQueue = async () => {
  const pending = await getPendingSync();
  console.log("Operações pendentes:", pending);
};
```

### Forçar Sync Completa

```jsx
import { syncAll } from "@/lib/sync/syncManager";

const forceSyncAll = async () => {
  const result = await syncAll();
  console.log("Resultado da sincronização:", result);
};
```

## 📚 Recursos Relacionados

- [IndexedDB API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [idb Library](https://github.com/jakearchibald/idb)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Hooks (Official)](https://react.dev/reference/react)
