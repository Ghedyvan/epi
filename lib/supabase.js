import { createClient } from "@supabase/supabase-js";

// Variáveis de ambiente (configure no .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Cliente Supabase singleton
 * Usado para todas as operações de banco de dados na nuvem
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Não precisamos de auth por enquanto
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-client-info": "pwa-epi@1.0.0",
    },
  },
});

/**
 * Verifica se o Supabase está configurado corretamente
 */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Verifica conectividade com Supabase
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase não configurado" };
  }

  try {
    const { error } = await supabase.from("funcionarios").select("count", { count: "exact", head: true });
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Helpers para operações CRUD no Supabase
 */

// Tabelas disponíveis
export const TABLES = {
  FUNCIONARIOS: "funcionarios",
  ESTOQUE: "estoque",
  FORNECEDORES: "fornecedores",
  PRAZOS: "prazos",
  LANCAMENTOS: "lancamentos",
};

// SELECT - buscar todos os registros de uma tabela
export async function fetchAll(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// SELECT - buscar por ID
export async function fetchById(tableName, id) {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// SELECT - buscar registros atualizados após timestamp
export async function fetchUpdatedSince(tableName, timestamp) {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .gt("updated_at", timestamp)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// INSERT
export async function insertItem(tableName, item) {
  const { data, error } = await supabase
    .from(tableName)
    .insert({
      ...item,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// UPDATE
export async function updateItem(tableName, id, updates) {
  const { data, error } = await supabase
    .from(tableName)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// UPSERT (insert ou update)
export async function upsertItem(tableName, item) {
  const { data, error } = await supabase
    .from(tableName)
    .upsert(
      {
        ...item,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DELETE
export async function deleteItem(tableName, id) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Realtime subscriptions (opcional - para sincronização em tempo real)
 */
export function subscribeToTable(tableName, callback) {
  const channel = supabase
    .channel(`${tableName}_changes`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: tableName,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
