import { openDB } from "idb";

const DB_NAME = "pwa-epi-db";
const DB_VERSION = 1;

// Nomes das stores (tabelas)
export const STORES = {
  FUNCIONARIOS: "funcionarios",
  ESTOQUE: "estoque",
  FORNECEDORES: "fornecedores",
  PRAZOS: "prazos",
  LANCAMENTOS: "lancamentos",
  SYNC_QUEUE: "sync_queue",
  META: "meta", // Para controlar timestamps de sincronização
};

/**
 * Inicializa o banco de dados IndexedDB
 * Cria todas as stores necessárias com índices apropriados
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Store de funcionários
      if (!db.objectStoreNames.contains(STORES.FUNCIONARIOS)) {
        const funcionariosStore = db.createObjectStore(STORES.FUNCIONARIOS, {
          keyPath: "id",
          autoIncrement: false,
        });
        funcionariosStore.createIndex("nome", "nome", { unique: false });
        funcionariosStore.createIndex("departamento", "departamento", { unique: false });
        funcionariosStore.createIndex("updated_at", "updated_at", { unique: false });
      }

      // Store de estoque
      if (!db.objectStoreNames.contains(STORES.ESTOQUE)) {
        const estoqueStore = db.createObjectStore(STORES.ESTOQUE, {
          keyPath: "id",
          autoIncrement: false,
        });
        estoqueStore.createIndex("nome", "nome", { unique: false });
        estoqueStore.createIndex("fornecedor", "fornecedor", { unique: false });
        estoqueStore.createIndex("updated_at", "updated_at", { unique: false });
      }

      // Store de fornecedores
      if (!db.objectStoreNames.contains(STORES.FORNECEDORES)) {
        const fornecedoresStore = db.createObjectStore(STORES.FORNECEDORES, {
          keyPath: "id",
          autoIncrement: false,
        });
        fornecedoresStore.createIndex("nome", "nome", { unique: false });
        fornecedoresStore.createIndex("updated_at", "updated_at", { unique: false });
      }

      // Store de prazos
      if (!db.objectStoreNames.contains(STORES.PRAZOS)) {
        const prazosStore = db.createObjectStore(STORES.PRAZOS, {
          keyPath: "id",
          autoIncrement: false,
        });
        prazosStore.createIndex("epi", "epi", { unique: false });
        prazosStore.createIndex("status", "status", { unique: false });
        prazosStore.createIndex("updated_at", "updated_at", { unique: false });
      }

      // Store de lançamentos
      if (!db.objectStoreNames.contains(STORES.LANCAMENTOS)) {
        const lancamentosStore = db.createObjectStore(STORES.LANCAMENTOS, {
          keyPath: "id",
          autoIncrement: false,
        });
        lancamentosStore.createIndex("funcionario", "funcionario", { unique: false });
        lancamentosStore.createIndex("status", "status", { unique: false });
        lancamentosStore.createIndex("updated_at", "updated_at", { unique: false });
      }

      // Fila de sincronização (para operações offline)
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        });
        syncStore.createIndex("store", "store", { unique: false });
        syncStore.createIndex("operation", "operation", { unique: false });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      // Metadados (timestamps de última sincronização)
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, {
          keyPath: "key",
        });
      }
    },
  });
}

/**
 * Operações CRUD genéricas para qualquer store
 */

// CREATE/UPDATE (upsert)
export async function upsertItem(storeName, item) {
  const db = await initDB();
  const tx = db.transaction(storeName, "readwrite");
  const itemWithTimestamp = {
    ...item,
    updated_at: new Date().toISOString(),
  };
  await tx.store.put(itemWithTimestamp);
  await tx.done;
  return itemWithTimestamp;
}

// READ - pegar todos os itens
export async function getAllItems(storeName) {
  const db = await initDB();
  return db.getAll(storeName);
}

// READ - pegar item por ID
export async function getItemById(storeName, id) {
  const db = await initDB();
  return db.get(storeName, id);
}

// READ - buscar por índice
export async function getItemsByIndex(storeName, indexName, value) {
  const db = await initDB();
  return db.getAllFromIndex(storeName, indexName, value);
}

// DELETE
export async function deleteItem(storeName, id) {
  const db = await initDB();
  await db.delete(storeName, id);
}

// CLEAR - limpar toda a store
export async function clearStore(storeName) {
  const db = await initDB();
  await db.clear(storeName);
}

/**
 * Funções específicas para fila de sincronização
 */

// Adicionar operação à fila
export async function addToSyncQueue(operation) {
  const db = await initDB();
  const tx = db.transaction(STORES.SYNC_QUEUE, "readwrite");
  const id = await tx.store.add({
    ...operation,
    timestamp: new Date().toISOString(),
    synced: false,
  });
  await tx.done;
  return id;
}

// Pegar todas as operações pendentes
export async function getPendingSync() {
  const db = await initDB();
  const all = await db.getAll(STORES.SYNC_QUEUE);
  return all.filter((item) => !item.synced);
}

// Marcar operação como sincronizada
export async function markAsSynced(id) {
  const db = await initDB();
  const tx = db.transaction(STORES.SYNC_QUEUE, "readwrite");
  const item = await tx.store.get(id);
  if (item) {
    item.synced = true;
    item.synced_at = new Date().toISOString();
    await tx.store.put(item);
  }
  await tx.done;
}

// Limpar operações já sincronizadas (manutenção)
export async function cleanSyncedQueue() {
  const db = await initDB();
  const tx = db.transaction(STORES.SYNC_QUEUE, "readwrite");
  const all = await tx.store.getAll();
  for (const item of all) {
    if (item.synced) {
      await tx.store.delete(item.id);
    }
  }
  await tx.done;
}

/**
 * Metadados de sincronização
 */

export async function getLastSyncTime(storeName) {
  const db = await initDB();
  const meta = await db.get(STORES.META, `last_sync_${storeName}`);
  return meta?.value || null;
}

export async function setLastSyncTime(storeName, timestamp) {
  const db = await initDB();
  await db.put(STORES.META, {
    key: `last_sync_${storeName}`,
    value: timestamp,
  });
}

/**
 * Seed inicial de dados (para primeira instalação)
 * DESABILITADO - Os dados devem vir do Supabase
 */
export async function seedInitialData() {
  // Seed desabilitado - use dados reais do Supabase
  console.log("ℹ️ Seed inicial desabilitado - carregando dados do Supabase");
  return;
}
