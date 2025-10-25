## PWA · Gestão de EPIs e Compliance

Aplicação Next.js com HeroUI e Tailwind que demonstra um fluxo completo de gestão de estoque e entrega de EPIs para empresas parceiras. O projeto inclui landing page, autenticação fictícia e um dashboard rico com dados simulados.

### Funcionalidades

- Entrada controlada por login com validação básica e opção de manter sessão
- Painel principal com visão geral de entregas, estoque crítico e prazos de auditoria
- Tabelas de colaboradores, fornecedores homologados, fichas de controle, empresas e setores
- Fila de entregas com confirmação de recebimento diretamente pelo gestor
- Indicadores visuais (chips, progressos, switches) para decisões rápidas
- Persistência local das entregas com sincronização automática quando a conexão voltar
- Service worker para cache offline e manifesto configurado para instalação como aplicativo

### Credenciais demo

Use as credenciais abaixo para acessar o dashboard:

- **E-mail:** `gestor@empresa.com`
- **Senha:** `seguranca123`

A sessão é armazenada no `localStorage` quando a opção "Continuar conectado" estiver marcada.

### Como executar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para acessar a landing page. Clique em **Acessar painel seguro** e efetue login com as credenciais demo.

### Configurar Supabase (Opcional)

O projeto funciona 100% offline usando IndexedDB. Para habilitar sincronização em nuvem:

1. Crie uma conta em [Supabase](https://supabase.com)
2. Siga as instruções em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Configure as variáveis de ambiente no `.env.local`

Sem Supabase configurado, o app continua funcional em modo offline puro.

### Fluxo de navegação

1. **Landing (`/`)** – destaque do PWA e botão para login
2. **Login (`/login`)** – formulário com validação e persistência opcional da sessão
3. **Dashboard (`/dashboard`)** – monitoramento de entregas, estoque e cadastros

### Verificação de entrega

Na seção **Fila de Entregas de EPIs**, utilize o switch "Entrega confirmada" para registrar que o material foi entregue ao colaborador. As métricas de progresso são atualizadas em tempo real conforme os itens são marcados como concluídos.

### Modo offline e sincronização

- Os dados são armazenados localmente no **IndexedDB** do navegador via biblioteca `idb`
- A fila de operações pendentes é gerenciada automaticamente pelo `syncManager`
- Quando online e o Supabase estiver configurado, a **sincronização automática** ocorre a cada 60 segundos
- O cabeçalho exibe status de conexão e botão de sincronização manual
- **Estratégia de conflito**: Last-Write-Wins baseado no campo `updated_at`
- O PWA funciona 100% offline mesmo sem Supabase configurado

### Instalar como PWA

1. Acesse a aplicação em um navegador compatível (Chrome, Edge, Safari mobile).
2. Utilize a opção **Adicionar à tela inicial** / **Install app** oferecida pelo navegador.
3. O manifesto (`app/manifest.json`) e o service worker (`public/sw.js`) garantem tema claro, splash screen e cache básico para navegação offline.

### Tecnologias

- [Next.js](https://nextjs.org) 15 (App Router)
- [React](https://react.dev) 19
- [HeroUI](https://www.heroui.com/) para componentes UI acessíveis
- [Tailwind CSS](https://tailwindcss.com) 4 para utilitários de estilo
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb) para armazenamento offline
- [Supabase](https://supabase.com) para banco de dados PostgreSQL em nuvem e sincronização

### Scripts úteis

- `npm run dev` – inicia o servidor de desenvolvimento
- `npm run build` – gera a build de produção
- `npm run start` – executa a build gerada
- `npm run lint` – roda as checagens de lint

