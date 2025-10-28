-- SQL para ajustar tabela de estoque no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Renomear coluna 'fornecedor' para 'fabricante'
ALTER TABLE public.estoque 
RENAME COLUMN fornecedor TO fabricante;

-- 2. Renomear coluna 'valor_nota' para 'total'
ALTER TABLE public.estoque 
RENAME COLUMN valor_nota TO total;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.estoque.fabricante IS 'Fabricante do equipamento';
COMMENT ON COLUMN public.estoque.total IS 'Total calculado (custo_unitario * quantidade_recebida)';

-- Verificar estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'estoque'
ORDER BY ordinal_position;
