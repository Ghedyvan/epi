import { openDB } from "idb";

const DB_NAME = "pwa-epi-db";

/**
 * Limpa todos os dados locais do IndexedDB
 * Use para remover dados de seed antigos e forçar re-sincronização com Supabase
 */
export async function clearAllLocalData() {
  try {
    const db = await openDB(DB_NAME);
    
    // Pegar todos os object stores
    const storeNames = db.objectStoreNames;
    
    console.log("🗑️ Limpando dados locais do IndexedDB...");
    
    // Limpar cada store
    for (const storeName of storeNames) {
      const tx = db.transaction(storeName, "readwrite");
      await tx.store.clear();
      await tx.done;
      console.log(`   ✓ Store "${storeName}" limpa`);
    }
    
    db.close();
    
    console.log("✅ Todos os dados locais foram removidos");
    console.log("🔄 Recarregue a página para sincronizar com Supabase");
    
    return true;
  } catch (error) {
    console.error("❌ Erro ao limpar dados locais:", error);
    return false;
  }
}

/**
 * Limpa dados de uma store específica
 */
export async function clearStoreData(storeName) {
  try {
    const db = await openDB(DB_NAME);
    
    console.log(`🗑️ Limpando dados da store "${storeName}"...`);
    
    const tx = db.transaction(storeName, "readwrite");
    await tx.store.clear();
    await tx.done;
    
    db.close();
    
    console.log(`✅ Store "${storeName}" limpa`);
    console.log("🔄 Recarregue a página para sincronizar com Supabase");
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao limpar store "${storeName}":`, error);
    return false;
  }
}

// Exportar para uso no console do navegador
if (typeof window !== "undefined") {
  window.clearAllLocalData = clearAllLocalData;
  window.clearStoreData = clearStoreData;
}
