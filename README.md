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

### Fluxo de navegação

1. **Landing (`/`)** – destaque do PWA e botão para login
2. **Login (`/login`)** – formulário com validação e persistência opcional da sessão
3. **Dashboard (`/dashboard`)** – monitoramento de entregas, estoque e cadastros

### Verificação de entrega

Na seção **Fila de Entregas de EPIs**, utilize o switch "Entrega confirmada" para registrar que o material foi entregue ao colaborador. As métricas de progresso são atualizadas em tempo real conforme os itens são marcados como concluídos.

### Modo offline e sincronização

- Os estados de entrega ficam salvos no `localStorage` (`pwa-deliveries`).
- A fila de ações pendentes é guardada em `pwa-sync-queue` e é enviada automaticamente quando o navegador voltar a ficar online.
- O cabeçalho e a fila exibem chips de status para indicar quando você está offline, quantas ações aguardam sincronização e a última sincronização concluída.
- O botão **Sincronizar pendências** força o envio manual sempre que houver conexão.

### Instalar como PWA

1. Acesse a aplicação em um navegador compatível (Chrome, Edge, Safari mobile).
2. Utilize a opção **Adicionar à tela inicial** / **Install app** oferecida pelo navegador.
3. O manifesto (`app/manifest.json`) e o service worker (`public/sw.js`) garantem tema claro, splash screen e cache básico para navegação offline.

### Tecnologias

- [Next.js](https://nextjs.org) 15 (App Router)
- [React](https://react.dev) 19
- [HeroUI](https://www.heroui.com/) para componentes UI acessíveis
- [Tailwind CSS](https://tailwindcss.com) 4 para utilitários de estilo

### Scripts úteis

- `npm run dev` – inicia o servidor de desenvolvimento
- `npm run build` – gera a build de produção
- `npm run start` – executa a build gerada
- `npm run lint` – roda as checagens de lint

