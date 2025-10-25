"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";

const SUPPLIERS = [
  {
    id: "forn-01",
    nome: "ProtegeMax",
    responsavel: "Larissa Prado",
    telefone: "(11) 3888-9001",
    email: "larissa.prado@protegmax.com",
    observacoes: "Entrega mensal confirmada · Certificação ISO 45001.",
  },
  {
    id: "forn-02",
    nome: "Segurança Ativa",
    responsavel: "Eduardo Lemos",
    telefone: "(21) 2555-7744",
    email: "eduardo.lemos@segativa.com",
    observacoes: "Revisar contrato de manutenção preventiva.",
  },
  {
    id: "forn-03",
    nome: "SafeEquip",
    responsavel: "Fernanda Ortiz",
    telefone: "(31) 3344-1188",
    email: "fernanda.ortiz@safeequip.com",
    observacoes: "Aguardando envio de laudo CA renovado.",
  },
  {
    id: "forn-04",
    nome: "Escudo Total",
    responsavel: "Rogério Lima",
    telefone: "(41) 3030-1122",
    email: "rogerio.lima@escudototal.com",
    observacoes: "Disponibilizar prazos de entrega reduzidos para obras emergenciais.",
  },
];

const ACTIONS = [
  {
    id: "acao-01",
    descricao: "Solicitar certificados atualizados de qualidade",
    prazo: "10/11/2025",
    fornecedor: "SafeEquip",
  },
  {
    id: "acao-02",
    descricao: "Negociar lote extra de aventais para obra Porto Sul",
    prazo: "25/10/2025",
    fornecedor: "Segurança Ativa",
  },
];

export default function FornecedoresPage() {
  return (
    <>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Cadastro de fornecedores</h2>
            <p className="text-sm text-slate-600">
              Informações de contato e observações operacionais sobre os parceiros responsáveis pelo fornecimento de EPIs.
            </p>
          </div>
          <Chip>{SUPPLIERS.length} fornecedores</Chip>
        </CardHeader>
        <Divider className="border-slate-200" />
        <Table removeWrapper className="text-sm">
          <TableHeader>
            <TableColumn>Nome do fornecedor</TableColumn>
            <TableColumn>Responsável</TableColumn>
            <TableColumn>Telefone</TableColumn>
            <TableColumn>E-mail</TableColumn>
            <TableColumn>Observações</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum fornecedor cadastrado">
            {SUPPLIERS.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium text-slate-900">{supplier.nome}</TableCell>
                <TableCell>
                  <span className="text-slate-700">{supplier.responsavel}</span>
                </TableCell>
                <TableCell>{supplier.telefone}</TableCell>
                <TableCell>
                  <Tooltip content={supplier.email}>
                    <Button as="a" href={`mailto:${supplier.email}`} variant="light" size="sm">
                      Enviar e-mail
                    </Button>
                  </Tooltip>
                </TableCell>
                <TableCell>{supplier.observacoes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ações em andamento</h2>
            <p className="text-sm text-slate-600">
              Pendências estratégicas com fornecedores para garantir abastecimento contínuo.
            </p>
          </div>
          <Chip color="warning" variant="flat">
            {ACTIONS.length} ações
          </Chip>
        </CardHeader>
        <Divider className="border-slate-200" />
        <CardBody className="space-y-3">
          {ACTIONS.map((action) => (
            <div
              key={action.id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{action.descricao}</p>
                <p className="text-xs text-slate-500">Fornecedor: {action.fornecedor}</p>
              </div>
              <Chip color="primary" variant="flat" size="sm">
                Prazo {action.prazo}
              </Chip>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
