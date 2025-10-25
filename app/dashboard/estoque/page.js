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

const INVENTORY = [
  {
    id: "EST-001",
    nome: "Capacete classe B",
    fornecedor: "ProtegeMax",
    quantidadeRecebida: 120,
    estoqueAtual: 178,
    custoUnitario: 48.5,
    valorNota: 5820,
  },
  {
    id: "EST-002",
    nome: "Respirador PFF2",
    fornecedor: "SafeEquip",
    quantidadeRecebida: 90,
    estoqueAtual: 124,
    custoUnitario: 12.9,
    valorNota: 1161,
  },
  {
    id: "EST-003",
    nome: "Luva nitrílica",
    fornecedor: "Escudo Total",
    quantidadeRecebida: 250,
    estoqueAtual: 312,
    custoUnitario: 8.75,
    valorNota: 2187.5,
  },
  {
    id: "EST-004",
    nome: "Óculos de proteção",
    fornecedor: "Segurança Ativa",
    quantidadeRecebida: 140,
    estoqueAtual: 205,
    custoUnitario: 22.4,
    valorNota: 3136,
  },
  {
    id: "EST-005",
    nome: "Avental de PVC",
    fornecedor: "Escudo Total",
    quantidadeRecebida: 80,
    estoqueAtual: 168,
    custoUnitario: 37.3,
    valorNota: 2984,
  },
];

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

export default function EstoquePage() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Controle de estoque</h2>
          <p className="text-sm text-slate-600">
            Registro financeiro das entradas de EPIs, com rastreabilidade por fornecedor e documento fiscal.
          </p>
        </div>
        <Chip>{INVENTORY.length} itens</Chip>
      </CardHeader>
      <Divider className="border-slate-200" />
      <CardBody className="p-0">
        <Table removeWrapper className="text-sm">
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Equipamento</TableColumn>
            <TableColumn>Fornecedor</TableColumn>
            <TableColumn className="text-right">Quantidade recebida</TableColumn>
            <TableColumn className="text-right">Estoque total atualizado</TableColumn>
            <TableColumn className="text-right">Custo unitário</TableColumn>
            <TableColumn className="text-right">Valor da nota fiscal</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhuma entrada registrada">
            {INVENTORY.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-900">{item.id}</TableCell>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.fornecedor}</TableCell>
                <TableCell className="text-right">{item.quantidadeRecebida} un.</TableCell>
                <TableCell className="text-right">{item.estoqueAtual} un.</TableCell>
                <TableCell className="text-right">{formatCurrency(item.custoUnitario)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.valorNota)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
