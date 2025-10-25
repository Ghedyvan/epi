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

const ENTRIES = [
  {
    id: "LAN-001",
    funcionario: "João Silva",
    cargo: "Supervisor de Campo",
    departamento: "Operações",
    equipamento: "Respirador PFF2",
    ca: "37922",
    entrega: "02/09/2025",
    trocaPrevista: "02/03/2026",
    vencimentoCa: "15/03/2026",
    status: "No prazo",
  },
  {
    id: "LAN-002",
    funcionario: "Mariana Campos",
    cargo: "Analista de Logística",
    departamento: "Logística",
    equipamento: "Luva nitrílica",
    ca: "31114",
    entrega: "18/08/2025",
    trocaPrevista: "18/02/2026",
    vencimentoCa: "28/01/2026",
    status: "Próximo do vencimento",
  },
  {
    id: "LAN-003",
    funcionario: "Carlos Ribeiro",
    cargo: "Técnico de Manutenção",
    departamento: "Manutenção",
    equipamento: "Capacete classe B",
    ca: "34590",
    entrega: "25/07/2024",
    trocaPrevista: "25/07/2026",
    vencimentoCa: "10/10/2025",
    status: "Vencido",
  },
  {
    id: "LAN-004",
    funcionario: "Ana Paula Souza",
    cargo: "Assistente de Almoxarifado",
    departamento: "Almoxarifado",
    equipamento: "Óculos de proteção",
    ca: "26888",
    entrega: "12/05/2025",
    trocaPrevista: "12/05/2026",
    vencimentoCa: "05/08/2025",
    status: "Próximo do vencimento",
  },
  {
    id: "LAN-005",
    funcionario: "Rafael Gomes",
    cargo: "Operador Industrial",
    departamento: "Produção",
    equipamento: "Avental de PVC",
    ca: "41234",
    entrega: "06/04/2025",
    trocaPrevista: "06/10/2025",
    vencimentoCa: "30/06/2025",
    status: "Vencido",
  },
];

const statusColor = (value) => {
  if (value === "No prazo") return "success";
  if (value === "Vencido") return "danger";
  return "warning";
};

export default function LancamentosPage() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Lançamentos de entrega de EPIs</h2>
          <p className="text-sm text-slate-600">
            Histórico das entregas realizadas por colaborador, com previsão de troca e acompanhamento do certificado de aprovação.
          </p>
        </div>
        <Chip>{ENTRIES.length} registros</Chip>
      </CardHeader>
      <Divider className="border-slate-200" />
      <CardBody className="p-0">
        <Table removeWrapper className="text-sm">
          <TableHeader>
            <TableColumn>Funcionário</TableColumn>
            <TableColumn>Cargo</TableColumn>
            <TableColumn>Departamento</TableColumn>
            <TableColumn>Equipamento entregue</TableColumn>
            <TableColumn>CA</TableColumn>
            <TableColumn>Data de entrega</TableColumn>
            <TableColumn>Data de troca prevista</TableColumn>
            <TableColumn>Vencimento do CA</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum lançamento registrado">
            {ENTRIES.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium text-slate-900">{entry.funcionario}</TableCell>
                <TableCell>{entry.cargo}</TableCell>
                <TableCell>{entry.departamento}</TableCell>
                <TableCell>{entry.equipamento}</TableCell>
                <TableCell>{entry.ca}</TableCell>
                <TableCell>{entry.entrega}</TableCell>
                <TableCell>{entry.trocaPrevista}</TableCell>
                <TableCell>{entry.vencimentoCa}</TableCell>
                <TableCell>
                  <Chip color={statusColor(entry.status)} variant="flat" size="sm">
                    {entry.status}
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
