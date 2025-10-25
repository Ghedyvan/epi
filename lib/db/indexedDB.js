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
  await tx.store.put({
    ...item,
    updated_at: new Date().toISOString(),
  });
  await tx.done;
  return item;
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
 */
export async function seedInitialData() {
  const db = await initDB();

  // Verificar se já existem dados
  const funcionarios = await db.getAll(STORES.FUNCIONARIOS);
  if (funcionarios.length > 0) {
    return; // Já tem dados, não fazer seed
  }

  // Seed de funcionários
  const funcionariosData = [
    {
      id: "col-01",
      nome: "João Silva",
      dataAdmissao: "14/03/2019",
      cargo: "Supervisor de Campo",
      departamento: "Operações",
      examePeriodico: "18/09/2025",
      proximoExame: "18/09/2026",
      observacoes: "Treinamento NR-35 atualizado.",
      updated_at: new Date().toISOString(),
    },
    {
      id: "col-02",
      nome: "Mariana Campos",
      dataAdmissao: "02/07/2021",
      cargo: "Analista de Logística",
      departamento: "Logística",
      examePeriodico: "09/08/2025",
      proximoExame: "09/08/2026",
      observacoes: "Revisar reciclagem de empilhadeira.",
      updated_at: new Date().toISOString(),
    },
    {
      id: "col-03",
      nome: "Carlos Ribeiro",
      dataAdmissao: "27/11/2017",
      cargo: "Técnico de Manutenção",
      departamento: "Manutenção",
      examePeriodico: "22/10/2025",
      proximoExame: "22/10/2026",
      observacoes: "Apto para trabalho em altura.",
      updated_at: new Date().toISOString(),
    },
  ];

  for (const func of funcionariosData) {
    await upsertItem(STORES.FUNCIONARIOS, func);
  }

  // Seed de estoque
  const estoqueData = [
    {
      id: "EST-001",
      nome: "Capacete classe B",
      fornecedor: "ProtegeMax",
      quantidadeRecebida: 120,
      estoqueAtual: 178,
      custoUnitario: 48.5,
      valorNota: 5820,
      updated_at: new Date().toISOString(),
    },
    {
      id: "EST-002",
      nome: "Respirador PFF2",
      fornecedor: "SafeEquip",
      quantidadeRecebida: 90,
      estoqueAtual: 124,
      custoUnitario: 12.9,
      valorNota: 1161,
      updated_at: new Date().toISOString(),
    },
  ];

  for (const item of estoqueData) {
    await upsertItem(STORES.ESTOQUE, item);
  }

  // Seed de fornecedores
  const fornecedoresData = [
    {
      id: "forn-01",
      nome: "ProtegeMax",
      responsavel: "Larissa Prado",
      telefone: "(11) 3888-9001",
      email: "larissa.prado@protegmax.com",
      observacoes: "Entrega mensal confirmada · Certificação ISO 45001.",
      updated_at: new Date().toISOString(),
    },
    {
      id: "forn-02",
      nome: "Segurança Ativa",
      responsavel: "Eduardo Lemos",
      telefone: "(21) 2555-7744",
      email: "eduardo.lemos@segativa.com",
      observacoes: "Revisar contrato de manutenção preventiva.",
      updated_at: new Date().toISOString(),
    },
  ];

  for (const forn of fornecedoresData) {
    await upsertItem(STORES.FORNECEDORES, forn);
  }

  // Seed de prazos
  const prazosData = [
    {
      id: "PRZ-001",
      epi: "Respirador PFF2",
      fornecedor: "SafeEquip",
      ca: "37922",
      validade: "15/03/2026",
      fabricacao: "15/03/2024",
      tempoUsoMaximo: "12 meses",
      status: "No prazo",
      updated_at: new Date().toISOString(),
    },
    {
      id: "PRZ-002",
      epi: "Luva nitrílica",
      fornecedor: "Escudo Total",
      ca: "31114",
      validade: "28/01/2026",
      fabricacao: "28/01/2024",
      tempoUsoMaximo: "18 meses",
      status: "No prazo",
      updated_at: new Date().toISOString(),
    },
  ];

  for (const prazo of prazosData) {
    await upsertItem(STORES.PRAZOS, prazo);
  }

  // Seed de lançamentos
  const lancamentosData = [
    {
      id: "LAN-001",
      funcionario: "João Silva",
      cargo: "Supervisor de Campo",
      departamento: "Operações",
      equipamento: "Respirador PFF2",
      ca: "37922",
      entrega: "02/09/2025",
      trocaPrevista: "02/03/2026",
      vencimentoCa: "15/03/2026",
      status: "No prazo",
      updated_at: new Date().toISOString(),
    },
    {
      id: "LAN-002",
      funcionario: "Mariana Campos",
      cargo: "Analista de Logística",
      departamento: "Logística",
      equipamento: "Luva nitrílica",
      ca: "31114",
      entrega: "18/08/2025",
      trocaPrevista: "18/02/2026",
      vencimentoCa: "28/01/2026",
      status: "Próximo do vencimento",
      updated_at: new Date().toISOString(),
    },
  ];

  for (const lanc of lancamentosData) {
    await upsertItem(STORES.LANCAMENTOS, lanc);
  }

  console.log("✅ IndexedDB inicializado com dados de exemplo");
}
