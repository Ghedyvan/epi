import * as idb from "../db/indexedDB";
import * as supabase from "../supabase";

/**
 * Gerenciador de sincronização entre IndexedDB e Supabase
 * Implementa padrão offline-first com sincronização bidirecional
 */

export const SYNC_STATUS = {
  IDLE: "idle",
  SYNCING: "syncing",
  SUCCESS: "success",
  ERROR: "error",
};

/**
 * Estratégia de sincronização:
 * 1. Pull: Baixar dados novos do Supabase para IndexedDB
 * 2. Push: Enviar operações pendentes do IndexedDB para Supabase
 * 3. Conflitos: Last-write-wins baseado em updated_at
 */

/**
 * PULL: Sincroniza dados do Supabase para IndexedDB
 */
export async function pullFromSupabase(storeName, tableName) {
  try {
    // Verificar se Supabase está configurado
    if (!supabase.isSupabaseConfigured()) {
      console.warn("Supabase não configurado - modo offline puro");
      return { success: true, pulled: 0, message: "Modo offline" };
    }

    // Pegar timestamp da última sincronização
    const lastSync = await idb.getLastSyncTime(storeName);
    
    // Buscar apenas registros atualizados desde a última sincronização
    let remoteData;
    if (lastSync) {
      remoteData = await supabase.fetchUpdatedSince(tableName, lastSync);
    } else {
      remoteData = await supabase.fetchAll(tableName);
    }

    // Atualizar IndexedDB com dados remotos
    for (const item of remoteData) {
      await idb.upsertItem(storeName, item);
    }

    // Atualizar timestamp de última sincronização
    const now = new Date().toISOString();
    await idb.setLastSyncTime(storeName, now);

    return {
      success: true,
      pulled: remoteData.length,
      message: `${remoteData.length} registros sincronizados`,
    };
  } catch (error) {
    console.error(`Erro ao fazer pull de ${storeName}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * PUSH: Envia operações pendentes do IndexedDB para Supabase
 */
export async function pushToSupabase() {
  try {
    // Verificar se Supabase está configurado
    if (!supabase.isSupabaseConfigured()) {
      return { success: true, pushed: 0, message: "Modo offline" };
    }

    // Pegar todas as operações pendentes da fila
    const pendingOps = await idb.getPendingSync();

    if (pendingOps.length === 0) {
      return {
        success: true,
        pushed: 0,
        message: "Nenhuma operação pendente",
      };
    }

    let successCount = 0;
    const errors = [];

    // Processar cada operação
    for (const op of pendingOps) {
      try {
        const { store, operation, data, recordId } = op;
        const tableName = getTableName(store);

        switch (operation) {
          case "create":
          case "update":
            await supabase.upsertItem(tableName, data);
            break;

          case "delete":
            await supabase.deleteItem(tableName, recordId);
            break;

          default:
            console.warn(`Operação desconhecida: ${operation}`);
        }

        // Marcar como sincronizado
        await idb.markAsSynced(op.id);
        successCount++;
      } catch (error) {
        console.error(`Erro ao processar operação ${op.id}:`, error);
        errors.push({ opId: op.id, error: error.message });
      }
    }

    // Limpar operações antigas já sincronizadas
    await idb.cleanSyncedQueue();

    return {
      success: errors.length === 0,
      pushed: successCount,
      failed: errors.length,
      errors,
      message: `${successCount} operações sincronizadas${errors.length > 0 ? `, ${errors.length} falharam` : ""}`,
    };
  } catch (error) {
    console.error("Erro ao fazer push para Supabase:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * SYNC COMPLETO: Pull + Push para todas as tabelas
 */
export async function syncAll() {
  const results = {
    funcionarios: null,
    estoque: null,
    fornecedores: null,
    prazos: null,
    lancamentos: null,
    push: null,
  };

  try {
    // 1. Primeiro fazer push das operações pendentes
    results.push = await pushToSupabase();

    // 2. Depois fazer pull de cada tabela
    results.funcionarios = await pullFromSupabase(
      idb.STORES.FUNCIONARIOS,
      supabase.TABLES.FUNCIONARIOS
    );

    results.estoque = await pullFromSupabase(
      idb.STORES.ESTOQUE,
      supabase.TABLES.ESTOQUE
    );

    results.fornecedores = await pullFromSupabase(
      idb.STORES.FORNECEDORES,
      supabase.TABLES.FORNECEDORES
    );

    results.prazos = await pullFromSupabase(
      idb.STORES.PRAZOS,
      supabase.TABLES.PRAZOS
    );

    results.lancamentos = await pullFromSupabase(
      idb.STORES.LANCAMENTOS,
      supabase.TABLES.LANCAMENTOS
    );

    // Calcular totais
    const totalPulled = Object.values(results)
      .filter((r) => r?.pulled !== undefined)
      .reduce((sum, r) => sum + r.pulled, 0);

    const totalPushed = results.push?.pushed || 0;

    return {
      success: true,
      results,
      summary: {
        pulled: totalPulled,
        pushed: totalPushed,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Erro na sincronização completa:", error);
    return {
      success: false,
      error: error.message,
      results,
    };
  }
}

/**
 * Adiciona operação à fila de sincronização
 */
export async function queueOperation(storeName, operation, data, recordId = null) {
  await idb.addToSyncQueue({
    store: storeName,
    operation, // 'create', 'update', 'delete'
    data,
    recordId,
  });
}

/**
 * Verifica se há operações pendentes
 */
export async function hasPendingOperations() {
  const pending = await idb.getPendingSync();
  return pending.length > 0;
}

/**
 * Retorna contagem de operações pendentes
 */
export async function getPendingCount() {
  const pending = await idb.getPendingSync();
  return pending.length;
}

/**
 * Helper: Mapeia store do IndexedDB para tabela do Supabase
 */
function getTableName(storeName) {
  const mapping = {
    [idb.STORES.FUNCIONARIOS]: supabase.TABLES.FUNCIONARIOS,
    [idb.STORES.ESTOQUE]: supabase.TABLES.ESTOQUE,
    [idb.STORES.FORNECEDORES]: supabase.TABLES.FORNECEDORES,
    [idb.STORES.PRAZOS]: supabase.TABLES.PRAZOS,
    [idb.STORES.LANCAMENTOS]: supabase.TABLES.LANCAMENTOS,
  };

  return mapping[storeName] || storeName;
}

/**
 * Auto-sync: Tenta sincronizar automaticamente quando online
 */
export function setupAutoSync(intervalMs = 60000) {
  let intervalId = null;

  const startSync = () => {
    if (typeof window === "undefined") return;

    const doSync = async () => {
      if (navigator.onLine && supabase.isSupabaseConfigured()) {
        console.log("🔄 Auto-sync iniciado...");
        const result = await syncAll();
        if (result.success) {
          console.log("✅ Auto-sync concluído:", result.summary);
        } else {
          console.error("❌ Auto-sync falhou:", result.error);
        }
      }
    };

    // Sincronizar imediatamente
    doSync();

    // Configurar intervalo
    intervalId = setInterval(doSync, intervalMs);

    // Sincronizar quando voltar online
    const handleOnline = () => {
      console.log("🌐 Conexão restaurada - sincronizando...");
      doSync();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
    };
  };

  return startSync();
}
