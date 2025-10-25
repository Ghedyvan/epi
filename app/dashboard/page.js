"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Progress,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";

const STORAGE_KEYS = {
  deliveries: "pwa-deliveries",
  queue: "pwa-sync-queue",
  lastSync: "pwa-last-sync",
  log: "pwa-sync-log",
};

const SYNC_DELAY_MS = 1200;

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (error) {
    console.error("Erro ao formatar data", error);
    return value;
  }
};

const EMPLOYEES = [
  {
    id: "col-01",
    nome: "João Silva",
    setor: "Operações",
    ultimoTreinamento: "10/09/2025",
    status: "Apto",
  },
  {
    id: "col-02",
    nome: "Mariana Campos",
    setor: "Logística",
    ultimoTreinamento: "22/08/2025",
    status: "Reciclagem pendente",
  },
  {
    id: "col-03",
    nome: "Carlos Ribeiro",
    setor: "Manutenção",
    ultimoTreinamento: "05/10/2025",
    status: "Apto",
  },
];

const SUPPLIERS = [
  {
    id: "forn-01",
    nome: "ProtegeMax",
    categoria: "Capacetes e luvas",
    contato: "contato@protegmax.com",
  },
  {
    id: "forn-02",
    nome: "Segurança Ativa",
    categoria: "Aventais e óculos",
    contato: "comercial@segativa.com",
  },
  {
    id: "forn-03",
    nome: "SafeEquip",
    categoria: "Respiradores",
    contato: "vendas@safeequip.com",
  },
];

const STOCK = [
  { id: "eq-01", equipamento: "Capacete classe B", disponivel: 58, minimo: 50 },
  { id: "eq-02", equipamento: "Luva nitrílica", disponivel: 120, minimo: 100 },
  { id: "eq-03", equipamento: "Respirador PFF2", disponivel: 34, minimo: 60 },
  { id: "eq-04", equipamento: "Avental de PVC", disponivel: 87, minimo: 40 },
];

const DEADLINES = [
  {
    id: "prazo-01",
    item: "Troca de respiradores PFF2",
    prazo: "04/11/2025",
    responsavel: "Mariana Campos",
  },
  {
    id: "prazo-02",
    item: "Auditoria interna NR-06",
    prazo: "18/11/2025",
    responsavel: "Equipe de SST",
  },
  {
    id: "prazo-03",
    item: "Treinamento anual de uso de EPIs",
    prazo: "30/11/2025",
    responsavel: "Carlos Ribeiro",
  },
];

const REPORTS = [
  {
    id: "rel-01",
    titulo: "Relatório mensal de entregas",
    periodo: "Set 2025",
    status: "Disponível",
  },
  {
    id: "rel-02",
    titulo: "Indicadores de conformidade",
    periodo: "3º Tri 2025",
    status: "Em elaboração",
  },
  {
    id: "rel-03",
    titulo: "Controle de estoque crítico",
    periodo: "Out 2025",
    status: "Assinado",
  },
];

const CONTROL_SHEETS = [
  {
    id: "fc-01",
    colaborador: "João Silva",
    equipamento: "Capacete classe B",
    validade: "12/2025",
  },
  {
    id: "fc-02",
    colaborador: "Mariana Campos",
    equipamento: "Respirador PFF2",
    validade: "09/2025",
  },
  {
    id: "fc-03",
    colaborador: "Carlos Ribeiro",
    equipamento: "Luva nitrílica",
    validade: "01/2026",
  },
];

const COMPANIES = [
  {
    id: "emp-01",
    nome: "Construtora Horizonte",
    cnpj: "12.345.678/0001-90",
    status: "Ativa",
  },
  {
    id: "emp-02",
    nome: "Metalúrgica Futuro",
    cnpj: "98.765.432/0001-10",
    status: "Ativa",
  },
  {
    id: "emp-03",
    nome: "Serviços Integrados Sul",
    cnpj: "54.321.987/0001-55",
    status: "Bloqueada",
  },
];

const SECTORS = [
  { id: "set-01", nome: "Operações", responsavel: "João Silva", colaboradores: 24 },
  { id: "set-02", nome: "Logística", responsavel: "Mariana Campos", colaboradores: 18 },
  { id: "set-03", nome: "Manutenção", responsavel: "Carlos Ribeiro", colaboradores: 15 },
];

const DELIVERY_QUEUE = [
  {
    id: "ent-01",
    colaborador: "João Silva",
    equipamento: "Respirador PFF2",
    quantidade: 2,
    requisicao: "REQ-4491",
    entregue: true,
    atualizadoEm: "2025-10-05T09:30:00-03:00",
  },
  {
    id: "ent-02",
    colaborador: "Ana Paula",
    equipamento: "Luva nitrílica",
    quantidade: 5,
    requisicao: "REQ-4492",
    entregue: false,
    atualizadoEm: null,
  },
  {
    id: "ent-03",
    colaborador: "Rafael Gomes",
    equipamento: "Capacete classe B",
    quantidade: 1,
    requisicao: "REQ-4493",
    entregue: false,
    atualizadoEm: null,
  },
];

const mergeDeliveries = (stored) => {
  if (!Array.isArray(stored)) return DELIVERY_QUEUE;

  const map = new Map(stored.map((item) => [item.id, item]));
  return DELIVERY_QUEUE.map((item) => ({
    ...item,
    ...map.get(item.id),
  }));
};

export default function DashboardPage() {
  const [deliveries, setDeliveries] = useState(DELIVERY_QUEUE);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [syncedLog, setSyncedLog] = useState([]);
  const [lastSync, setLastSync] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedDeliveries = localStorage.getItem(STORAGE_KEYS.deliveries);
      if (storedDeliveries) {
        setDeliveries(mergeDeliveries(JSON.parse(storedDeliveries)));
      }
    } catch (error) {
      console.error("Não foi possível carregar entregas armazenadas", error);
    }

    try {
      const storedQueue = localStorage.getItem(STORAGE_KEYS.queue);
      if (storedQueue) {
        const parsedQueue = JSON.parse(storedQueue);
        if (Array.isArray(parsedQueue)) {
          setPendingQueue(parsedQueue);
        }
      }
    } catch (error) {
      console.error("Não foi possível carregar fila pendente", error);
    }

    try {
      const storedLastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
      if (storedLastSync) {
        setLastSync(storedLastSync);
      }
    } catch (error) {
      console.error("Não foi possível carregar última sincronização", error);
    }

    try {
      const storedLog = localStorage.getItem(STORAGE_KEYS.log);
      if (storedLog) {
        const parsedLog = JSON.parse(storedLog);
        if (Array.isArray(parsedLog)) {
          setSyncedLog(parsedLog);
        }
      }
    } catch (error) {
      console.error("Não foi possível carregar histórico de sincronização", error);
    }

    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setHydrated(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.deliveries, JSON.stringify(deliveries));
    } catch (error) {
      console.error("Não foi possível salvar entregas", error);
    }
  }, [deliveries, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(pendingQueue));
    } catch (error) {
      console.error("Não foi possível salvar fila pendente", error);
    }
  }, [pendingQueue, hydrated]);

  useEffect(() => {
    if (!hydrated || !lastSync) return;
    try {
      localStorage.setItem(STORAGE_KEYS.lastSync, lastSync);
    } catch (error) {
      console.error("Não foi possível armazenar última sincronização", error);
    }
  }, [hydrated, lastSync]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(syncedLog));
    } catch (error) {
      console.error("Não foi possível armazenar histórico de sincronização", error);
    }
  }, [hydrated, syncedLog]);

  const entregasConcluidas = useMemo(
    () => deliveries.filter((item) => item.entregue).length,
    [deliveries],
  );

  const entregaProgress = useMemo(() => {
    if (deliveries.length === 0) return 0;
    return Math.round((entregasConcluidas / deliveries.length) * 100);
  }, [deliveries.length, entregasConcluidas]);

  const estoqueCritico = useMemo(
    () => STOCK.filter((item) => item.disponivel <= item.minimo),
    [],
  );

  const pendingMap = useMemo(
    () => new Map(pendingQueue.map((action) => [action.deliveryId, action])),
    [pendingQueue],
  );

  const syncedMap = useMemo(
    () => new Map(syncedLog.map((action) => [action.deliveryId, action])),
    [syncedLog],
  );

  const toggleEntrega = useCallback(
    (id) => {
      const target = deliveries.find((item) => item.id === id);
      if (!target) return;

      const timestamp = new Date().toISOString();
      const nextValue = !target.entregue;

      setDeliveries((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, entregue: nextValue, atualizadoEm: timestamp }
            : item,
        ),
      );

      setPendingQueue((queue) => {
        const filtered = queue.filter((action) => action.deliveryId !== id);
        return [...filtered, { deliveryId: id, entregue: nextValue, timestamp }];
      });

      setSyncedLog((log) => log.filter((entry) => entry.deliveryId !== id));
    },
    [deliveries],
  );

  const processQueue = useCallback(async () => {
    if (!hydrated || !isOnline || syncing || pendingQueue.length === 0) return;

    setSyncing(true);
    const queuedActions = [...pendingQueue];

    try {
      await new Promise((resolve) => setTimeout(resolve, SYNC_DELAY_MS));

      const syncTimestamp = new Date().toISOString();

      setDeliveries((current) =>
        current.map((item) => {
          const action = queuedActions.find((queued) => queued.deliveryId === item.id);
          if (!action) return item;
          return {
            ...item,
            entregue: action.entregue,
            atualizadoEm: action.timestamp ?? syncTimestamp,
          };
        }),
      );

      setSyncedLog((log) => {
        const processed = queuedActions.map((action) => ({
          ...action,
          syncedAt: syncTimestamp,
        }));
        return [...processed, ...log].slice(0, 12);
      });

      setPendingQueue([]);
      setLastSync(syncTimestamp);
    } finally {
      setSyncing(false);
    }
  }, [hydrated, isOnline, pendingQueue, syncing]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Card className="border border-slate-200 bg-white px-8 py-6 shadow-md">
          <CardBody className="text-slate-600">Preparando painel...</CardBody>
        </Card>
      </div>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col items-start gap-2">
            <p className="text-sm uppercase tracking-wide text-slate-500">Status</p>
            <h3 className="text-xl font-semibold text-slate-900">Entregas confirmadas</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Progress value={entregaProgress} color="success" aria-label="Progresso de entregas" />
            <p className="text-sm text-slate-600">
              {entregasConcluidas} de {deliveries.length} solicitações marcadas como entregues.
            </p>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col items-start gap-2">
            <p className="text-sm uppercase tracking-wide text-slate-500">Estoque</p>
            <h3 className="text-xl font-semibold text-slate-900">Itens em nível crítico</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {estoqueCritico.length ? (
              <ul className="space-y-2 text-sm text-slate-600">
                {estoqueCritico.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span>{item.equipamento}</span>
                    <Chip color="danger" variant="flat">
                      {item.disponivel} un.
                    </Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">Nenhum item abaixo do mínimo.</p>
            )}
          </CardBody>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col items-start gap-2">
            <p className="text-sm uppercase tracking-wide text-slate-500">Prazos</p>
            <h3 className="text-xl font-semibold text-slate-900">Eventos próximos</h3>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-slate-600">
            {DEADLINES.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-slate-100 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{deadline.item}</p>
                  <p className="text-xs text-slate-500">Responsável: {deadline.responsavel}</p>
                </div>
                <Chip color="warning" variant="flat">
                  {deadline.prazo}
                </Chip>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Fila de Entregas de EPIs</h2>
            <p className="text-sm text-slate-600">
              Confirme a entrega de cada requisição para manter o histórico atualizado.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Chip color="primary" variant="flat">
              {deliveries.length} solicitações
            </Chip>
            <Chip color={pendingQueue.length ? "warning" : "success"} variant="flat">
              {pendingQueue.length ? `${pendingQueue.length} pendências` : "Sem pendências"}
            </Chip>
          </div>
        </CardHeader>
        <Divider className="border-slate-200" />
        <Table removeWrapper className="text-sm">
          <TableHeader>
            <TableColumn>Requisição</TableColumn>
            <TableColumn>Colaborador</TableColumn>
            <TableColumn>Equipamento</TableColumn>
            <TableColumn className="text-right">Qtd.</TableColumn>
            <TableColumn>Última atualização</TableColumn>
            <TableColumn>Entrega confirmada</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhuma requisição pendente">
            {deliveries.map((item) => {
              const pendingAction = pendingMap.get(item.id);
              const recentlySynced = syncedMap.get(item.id);

              return (
                <TableRow
                  key={item.id}
                  className={pendingAction ? "bg-amber-50" : "hover:bg-slate-100"}
                >
                  <TableCell>
                    <Chip variant="flat" color="secondary" size="sm">
                      {item.requisicao}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900">{item.colaborador}</span>
                      {pendingAction && (
                        <span className="text-xs text-amber-600">
                          Aguardando sincronização offline
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.equipamento}</TableCell>
                  <TableCell className="text-right">{item.quantidade}</TableCell>
                  <TableCell>{formatDateTime(item.atualizadoEm)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-3">
                      <Switch
                        isSelected={item.entregue}
                        color="success"
                        onValueChange={() => toggleEntrega(item.id)}
                      >
                        {item.entregue ? "Confirmada" : "Pendente"}
                      </Switch>
                      {pendingAction && (
                        <Chip color="warning" size="sm" variant="flat">
                          Offline
                        </Chip>
                      )}
                      {!pendingAction && recentlySynced && (
                        <Chip color="success" size="sm" variant="flat">
                          Sincronizado
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <CardFooter className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip color={isOnline ? "success" : "warning"} variant="flat">
                {isOnline ? "Conectado" : "Modo offline"}
              </Chip>
              {syncing && (
                <Chip color="primary" variant="flat">
                  Sincronizando...
                </Chip>
              )}
              <Chip color={pendingQueue.length ? "warning" : "success"} variant="bordered">
                {pendingQueue.length
                  ? `${pendingQueue.length} ações aguardando`
                  : "Todas as ações sincronizadas"}
              </Chip>
            </div>
            <Button
              color="primary"
              variant="flat"
              size="sm"
              onPress={processQueue}
              isDisabled={!isOnline || pendingQueue.length === 0 || syncing}
            >
              Sincronizar pendências
            </Button>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Última sincronização: {lastSync ? formatDateTime(lastSync) : "Ainda não sincronizado"}
            </span>
            {syncedLog.length > 0 && (
              <span>
                Último envio: {syncedLog[0].deliveryId} · {syncedLog[0].entregue ? "Confirmada" : "Pendente"}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Colaboradores</h2>
            <Chip>{EMPLOYEES.length} ativos</Chip>
          </CardHeader>
          <Divider className="border-slate-200" />
          <Table removeWrapper className="text-sm">
            <TableHeader>
              <TableColumn>Nome</TableColumn>
              <TableColumn>Setor</TableColumn>
              <TableColumn>Treinamento</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Sem colaboradores cadastrados">
              {EMPLOYEES.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium text-slate-900">{employee.nome}</TableCell>
                  <TableCell>{employee.setor}</TableCell>
                  <TableCell>{employee.ultimoTreinamento}</TableCell>
                  <TableCell>
                    <Chip
                      color={employee.status === "Apto" ? "success" : "warning"}
                      variant="flat"
                      size="sm"
                    >
                      {employee.status}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Fornecedores homologados</h2>
            <Chip>{SUPPLIERS.length} ativos</Chip>
          </CardHeader>
          <Divider className="border-slate-200" />
          <Table removeWrapper className="text-sm">
            <TableHeader>
              <TableColumn>Fornecedor</TableColumn>
              <TableColumn>Categoria</TableColumn>
              <TableColumn>Contato</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Nenhum fornecedor cadastrado">
              {SUPPLIERS.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium text-slate-900">{supplier.nome}</TableCell>
                  <TableCell>{supplier.categoria}</TableCell>
                  <TableCell>
                    <Tooltip content={supplier.contato}>
                      <Button as="a" href={`mailto:${supplier.contato}`} variant="light" size="sm">
                        Enviar e-mail
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">Estoque detalhado</h2>
          </CardHeader>
          <Divider className="border-slate-200" />
          <CardBody className="space-y-3 text-sm text-slate-600">
            {STOCK.map((item) => {
              const percentual = Math.min(100, (item.disponivel / item.minimo) * 100);
              return (
                <div
                  key={item.id}
                  className="space-y-2 rounded-md border border-slate-200 bg-slate-100 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{item.equipamento}</p>
                    <Chip
                      color={item.disponivel <= item.minimo ? "danger" : "success"}
                      variant="flat"
                      size="sm"
                    >
                      {item.disponivel} un.
                    </Chip>
                  </div>
                  <Progress
                    value={percentual}
                    color={item.disponivel <= item.minimo ? "danger" : "primary"}
                    showValueLabel
                    aria-label={`Estoque de ${item.equipamento}`}
                  />
                  <p className="text-xs text-slate-500">Mínimo operacional: {item.minimo} un.</p>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">Relatórios e auditorias</h2>
          </CardHeader>
          <Divider className="border-slate-200" />
          <CardBody className="space-y-3 text-sm text-slate-600">
            {REPORTS.map((report) => {
              const statusColor =
                report.status === "Disponível"
                  ? "success"
                  : report.status === "Assinado"
                    ? "primary"
                    : "warning";
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-100 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{report.titulo}</p>
                    <p className="text-xs text-slate-500">Período: {report.periodo}</p>
                  </div>
                  <Chip color={statusColor} variant="flat" size="sm">
                    {report.status}
                  </Chip>
                </div>
              );
            })}
            <Button color="secondary" variant="flat">
              Gerar novo relatório
            </Button>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">Fichas de controle</h2>
          </CardHeader>
          <Divider className="border-slate-200" />
          <CardBody className="space-y-3 text-sm text-slate-600">
            {CONTROL_SHEETS.map((sheet) => (
              <div
                key={sheet.id}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-100 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{sheet.colaborador}</p>
                  <p className="text-xs text-slate-500">Equipamento: {sheet.equipamento}</p>
                </div>
                <Chip color="secondary" variant="flat" size="sm">
                  Validade {sheet.validade}
                </Chip>
              </div>
            ))}
            <Button variant="flat">Importar ficha assinada</Button>
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Empresas vinculadas</h2>
            <Button color="primary" size="sm" variant="flat">
              Nova empresa
            </Button>
          </CardHeader>
          <Divider className="border-slate-200" />
          <Table removeWrapper className="text-sm">
            <TableHeader>
              <TableColumn>Empresa</TableColumn>
              <TableColumn>CNPJ</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Nenhum cadastro efetuado">
              {COMPANIES.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium text-slate-900">{company.nome}</TableCell>
                  <TableCell>{company.cnpj}</TableCell>
                  <TableCell>
                    <Chip
                      color={company.status === "Ativa" ? "success" : "danger"}
                      variant="flat"
                      size="sm"
                    >
                      {company.status}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Setores monitorados</h2>
            <Chip>{SECTORS.length} setores</Chip>
          </CardHeader>
          <Divider className="border-slate-200" />
          <Table removeWrapper className="text-sm">
            <TableHeader>
              <TableColumn>Setor</TableColumn>
              <TableColumn>Responsável</TableColumn>
              <TableColumn className="text-right">Colaboradores</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Nenhum setor cadastrado">
              {SECTORS.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium text-slate-900">{sector.nome}</TableCell>
                  <TableCell>{sector.responsavel}</TableCell>
                  <TableCell className="text-right">{sector.colaboradores}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardBody className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PWA Segurança · Gestão completa de EPIs.</p>
          <p>Versão demo — dados fictícios para validação de fluxo.</p>
        </CardBody>
        <CardFooter className="flex flex-col items-start gap-2 border-t border-slate-200 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Precisa auditar a entrega de um material? Garanta que a requisição esteja marcada como
            <strong className="text-success"> confirmada</strong> na fila de entregas.
          </span>
          <span>Sincronização contínua mesmo sem internet.</span>
        </CardFooter>
      </Card>
    </>
  );
}
