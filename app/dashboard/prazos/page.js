"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
  TableCell,
  Chip,
} from "@heroui/react";

const DEADLINES = [
  {
    id: "PRZ-001",
    epi: "Respirador PFF2",
    fornecedor: "SafeEquip",
    ca: "37922",
    validade: "15/03/2026",
    fabricacao: "15/03/2024",
    tempoUsoMaximo: "12 meses",
    status: "No prazo",
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
  },
  {
    id: "PRZ-003",
    epi: "Capacete classe B",
    fornecedor: "ProtegeMax",
    ca: "34590",
    validade: "10/10/2025",
    fabricacao: "10/10/2023",
    tempoUsoMaximo: "24 meses",
    status: "Próximo do vencimento",
  },
  {
    id: "PRZ-004",
    epi: "Óculos de proteção",
    fornecedor: "Segurança Ativa",
    ca: "26888",
    validade: "05/08/2025",
    fabricacao: "05/08/2023",
    tempoUsoMaximo: "24 meses",
    status: "No prazo",
  },
  {
    id: "PRZ-005",
    epi: "Avental de PVC",
    fornecedor: "Escudo Total",
    ca: "41234",
    validade: "30/06/2025",
    fabricacao: "30/06/2023",
    tempoUsoMaximo: "18 meses",
    status: "Vencido",
  },
];

const getStatusColor = (status) => {
  if (status === "No prazo") return "success";
  if (status === "Vencido") return "danger";
  return "warning";
};

export default function PrazosPage() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Controle de validade de EPIs</h2>
          <p className="text-sm text-slate-600">
            Acompanhe o ciclo de vida dos equipamentos e antecipe substituições conforme certificados de aprovação (CA).
          </p>
        </div>
        <Chip>{DEADLINES.length} itens monitorados</Chip>
      </CardHeader>
      <Divider className="border-slate-200" />
      <CardBody className="p-0">
        <Table removeWrapper className="text-sm">
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Nome do EPI</TableColumn>
            <TableColumn>Fornecedor</TableColumn>
            <TableColumn>CA</TableColumn>
            <TableColumn>Data de validade</TableColumn>
            <TableColumn>Data de fabricação</TableColumn>
            <TableColumn>Tempo de uso máximo</TableColumn>
            <TableColumn>Status da validade</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum prazo cadastrado">
            {DEADLINES.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-900">{item.id}</TableCell>
                <TableCell>{item.epi}</TableCell>
                <TableCell>{item.fornecedor}</TableCell>
                <TableCell>{item.ca}</TableCell>
                <TableCell>{item.validade}</TableCell>
                <TableCell>{item.fabricacao}</TableCell>
                <TableCell>{item.tempoUsoMaximo}</TableCell>
                <TableCell>
                  <Chip color={getStatusColor(item.status)} variant="flat" size="sm">
                    {item.status}
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
