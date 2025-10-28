"use client";

import { useEffect, useState, useCallback } from "react";
import * as idb from "../lib/db/indexedDB";
import * as syncManager from "../lib/sync/syncManager";
import * as supabase from "../lib/supabase";

/**
 * Helper: Mapeia store do IndexedDB para tabela do Supabase
 */
function getTableNameForStore(storeName) {
  const mapping = {
    [idb.STORES.FUNCIONARIOS]: supabase.TABLES.FUNCIONARIOS,
    [idb.STORES.ESTOQUE]: supabase.TABLES.ESTOQUE,
    [idb.STORES.FORNECEDORES]: supabase.TABLES.FORNECEDORES,
    [idb.STORES.PRAZOS]: supabase.TABLES.PRAZOS,
    [idb.STORES.LANCAMENTOS]: supabase.TABLES.LANCAMENTOS,
  };
  return mapping[storeName] || null;
}

/**
 * Hook para gerenciar dados de uma store do IndexedDB
 * Suporta operações CRUD e sincronização automática
 */
export function useData(storeName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Inicializar DB
        if (!initialized) {
          await idb.initDB();
          setInitialized(true);
        }

        // Tentar fazer pull do Supabase primeiro
        const tableName = getTableNameForStore(storeName);
        if (tableName) {
          try {
            await syncManager.pullFromSupabase(storeName, tableName);
          } catch (pullError) {
            console.warn(`Não foi possível fazer pull do Supabase:`, pullError);
          }
        }

        // Carregar dados da store (agora com dados do Supabase se houver)
        const items = await idb.getAllItems(storeName);
        
        // Se não houver dados, fazer seed apenas como último recurso
        if (items.length === 0 && !initialized) {
          await idb.seedInitialData();
          const seededItems = await idb.getAllItems(storeName);
          if (mounted) {
            setData(seededItems);
          }
        } else {
          if (mounted) {
            setData(items);
          }
        }
      } catch (err) {
        console.error(`Erro ao carregar ${storeName}:`, err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [storeName, initialized]);

  // Criar/Atualizar item
  const upsert = useCallback(
    async (item) => {
      try {
        // Verificar se o item já existe para determinar a operação correta
        const existingItem = item.id ? await idb.getItemById(storeName, item.id) : null;
        const operation = existingItem ? "update" : "create";
        
        console.log(`Operação detectada: ${operation}`, { item, existingItem });
        
        const updated = await idb.upsertItem(storeName, item);
        
        // Adicionar à fila de sincronização
        await syncManager.queueOperation(
          storeName,
          operation,
          updated,
          updated.id
        );

        // Atualizar estado local
        setData((current) => {
          const index = current.findIndex((i) => i.id === updated.id);
          if (index >= 0) {
            const newData = [...current];
            newData[index] = updated;
            return newData;
          }
          return [updated, ...current];
        });

        return updated;
      } catch (err) {
        console.error(`Erro ao salvar em ${storeName}:`, err);
        throw err;
      }
    },
    [storeName]
  );

  // Deletar item
  const remove = useCallback(
    async (id) => {
      try {
        await idb.deleteItem(storeName, id);
        
        // Adicionar à fila de sincronização
        await syncManager.queueOperation(storeName, "delete", null, id);

        // Atualizar estado local
        setData((current) => current.filter((item) => item.id !== id));
      } catch (err) {
        console.error(`Erro ao deletar de ${storeName}:`, err);
        throw err;
      }
    },
    [storeName]
  );

  // Recarregar dados
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const items = await idb.getAllItems(storeName);
      setData(items);
    } catch (err) {
      console.error(`Erro ao recarregar ${storeName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  return {
    data,
    loading,
    error,
    upsert,
    remove,
    refresh,
  };
}

/**
 * Hook para gerenciar sincronização com Supabase
 */
export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Verificar operações pendentes
  useEffect(() => {
    const checkPending = async () => {
      const count = await syncManager.getPendingCount();
      setPendingCount(count);
    };

    checkPending();
    
    // Verificar a cada 10 segundos
    const interval = setInterval(checkPending, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Sincronizar manualmente
  const sync = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);

      const result = await syncManager.syncAll();

      if (result.success) {
        setLastSync(result.summary.timestamp);
        setPendingCount(0);
        return result;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Erro na sincronização:", err);
      setError(err.message);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    sync,
    syncing,
    lastSync,
    error,
    pendingCount,
    hasPending: pendingCount > 0,
  };
}

/**
 * Hook para gerenciar auto-sync
 */
export function useAutoSync(enabled = true, intervalMs = 60000) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Monitorar status de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Configurar auto-sync
    const cleanup = syncManager.setupAutoSync(intervalMs);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (cleanup) cleanup();
    };
  }, [enabled, intervalMs]);

  return {
    isOnline,
  };
}
