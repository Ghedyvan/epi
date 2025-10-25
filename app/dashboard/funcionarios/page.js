"use client";

import {
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
} from "@heroui/react";

const EMPLOYEES = [
  {
    id: "col-01",
    nome: "João Silva",
    dataAdmissao: "14/03/2019",
    cargo: "Supervisor de Campo",
    departamento: "Operações",
    examePeriodico: "18/09/2025",
    proximoExame: "18/09/2026",
    observacoes: "Treinamento NR-35 atualizado.",
  },
  {
    id: "col-02",
    nome: "Mariana Campos",
    dataAdmissao: "02/07/2021",
    cargo: "Analista de Logística",
    departamento: "Logística",
    examePeriodico: "09/08/2025",
    proximoExame: "09/08/2026",
    observacoes: "Revisar reciclagem de empilhadeira.",
  },
  {
    id: "col-03",
    nome: "Carlos Ribeiro",
    dataAdmissao: "27/11/2017",
    cargo: "Técnico de Manutenção",
    departamento: "Manutenção",
    examePeriodico: "22/10/2025",
    proximoExame: "22/10/2026",
    observacoes: "Apto para trabalho em altura.",
  },
  {
    id: "col-04",
    nome: "Ana Paula Souza",
    dataAdmissao: "15/01/2023",
    cargo: "Assistente de Almoxarifado",
    departamento: "Almoxarifado",
    examePeriodico: "03/07/2025",
    proximoExame: "03/01/2026",
    observacoes: "Aguardar agendamento de audiometria.",
  },
  {
    id: "col-05",
    nome: "Rafael Gomes",
    dataAdmissao: "05/05/2020",
    cargo: "Operador Industrial",
    departamento: "Produção",
    examePeriodico: "30/06/2025",
    proximoExame: "30/06/2026",
    observacoes: "Monitorar índice de absenteísmo pós turno noturno.",
  },
];

export default function FuncionariosPage() {
  return (
    <>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Controle de funcionários</h2>
            <p className="text-sm text-slate-600">
              Base de dados com informações ocupacionais e exames periódicos exigidos pela NR-07.
            </p>
          </div>
          <Chip>{EMPLOYEES.length} colaboradores</Chip>
        </CardHeader>
        <Divider className="border-slate-200" />
        <Table removeWrapper className="text-sm">
          <TableHeader>
            <TableColumn>Nome</TableColumn>
            <TableColumn>Data de admissão</TableColumn>
            <TableColumn>Cargo</TableColumn>
            <TableColumn>Departamento</TableColumn>
            <TableColumn>Último exame periódico</TableColumn>
            <TableColumn>Próximo exame</TableColumn>
            <TableColumn>Observações</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum colaborador cadastrado">
            {EMPLOYEES.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium text-slate-900">{employee.nome}</TableCell>
                <TableCell>{employee.dataAdmissao}</TableCell>
                <TableCell>{employee.cargo}</TableCell>
                <TableCell>{employee.departamento}</TableCell>
                <TableCell>{employee.examePeriodico}</TableCell>
                <TableCell>{employee.proximoExame}</TableCell>
                <TableCell>{employee.observacoes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
